/**
 * HARP — Human/Agentic Relational Protocol
 * Core client library
 *
 * This is the reference implementation of the HARP client. It provides:
 * - Document creation, parsing, and serialization
 * - Dyad lifecycle management (create, read, update)
 * - Section operations (add, query, filter)
 * - Storage integration (IPFS, local, in-memory)
 * - Privacy layer management
 * - AIRC payload helpers
 *
 * See SPEC.md for the full protocol specification.
 */

import { createHash } from "crypto";
import type {
  CID,
  CollaborationReadiness,
  DerivedScore,
  Dyad,
  DyadId,
  EntityDescriptor,
  EntityId,
  EpochRef,
  HarpConfig,
  HarpContextAttachment,
  HarpDocument,
  HarpFrontmatter,
  HarpProposal,
  HarpSection,
  HarpStorage,
  HarpUpdateNotification,
  Layer,
  SectionFilter,
  SectionMeta,
  SectionType,
} from "./types.js";

// =============================================================================
// Constants
// =============================================================================

const HARP_VERSION = "0.1.0";
const FRONTMATTER_DELIMITER = "---";
const SECTION_HEADING_REGEX = /^## (\S+?):\s*(.+)$/;
const META_BLOCK_REGEX = /<!-- harp:meta\n([\s\S]*?)-->/;

// =============================================================================
// Identity Utilities
// =============================================================================

/**
 * Normalize an entity identifier for consistent sorting and comparison.
 *
 * - ERC-8004: ensure decimal integers, no leading zeros
 * - Ethereum addresses: lowercase
 * - AIRC handles: lowercase, trimmed
 */
export function normalizeEntityId(id: EntityId): EntityId {
  if (id.startsWith("erc8004:")) {
    const parts = id.split(":");
    if (parts.length !== 3) throw new Error(`Invalid ERC-8004 entity ID: ${id}`);
    const chainId = parseInt(parts[1], 10);
    const agentId = parseInt(parts[2], 10);
    if (isNaN(chainId) || isNaN(agentId)) {
      throw new Error(`Invalid ERC-8004 entity ID: ${id}`);
    }
    return `erc8004:${chainId}:${agentId}`;
  }

  if (id.startsWith("eth:")) {
    return `eth:${id.slice(4).toLowerCase()}`;
  }

  if (id.startsWith("airc:")) {
    return `airc:${id.slice(5).toLowerCase().trim()}`;
  }

  throw new Error(`Unknown entity ID format: ${id}`);
}

/**
 * Compute the canonical dyad ID for two entities.
 * Entities are normalized and sorted lexicographically.
 */
export function computeDyadId(entityA: EntityId, entityB: EntityId): DyadId {
  const a = normalizeEntityId(entityA);
  const b = normalizeEntityId(entityB);

  if (a === b) {
    throw new Error("A dyad requires two distinct entities");
  }

  const sorted = a < b ? [a, b] : [b, a];
  return `harp:${sorted[0]}:${sorted[1]}`;
}

// =============================================================================
// Document Parsing
// =============================================================================

/**
 * Parse YAML frontmatter from a HARP document string.
 * Uses a lightweight parser — does not depend on a full YAML library.
 *
 * TODO: Replace with proper YAML parser (js-yaml) for production use.
 * This simplified parser handles the subset of YAML used in HARP frontmatter.
 */
function parseFrontmatterYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  let currentKey = "";
  let currentArray: unknown[] | null = null;
  let indent = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Array item
    if (trimmed.startsWith("- ")) {
      if (currentArray) {
        const value = trimmed.slice(2).trim();
        currentArray.push(parseYamlValue(value));
      }
      continue;
    }

    // Key-value pair
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();

      const lineIndent = line.length - line.trimStart().length;

      if (value === "" || value === "|") {
        // Start of array or nested object
        currentKey = key;
        currentArray = [];
        result[key] = currentArray;
        indent = lineIndent;
      } else {
        if (currentArray && lineIndent > indent) {
          // Nested key in array item — skip for simplified parser
          continue;
        }
        currentArray = null;
        result[key] = parseYamlValue(value);
      }
    }
  }

  return result;
}

function parseYamlValue(value: string): unknown {
  if (value === "null" || value === "~") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  // Strip quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Parse section metadata from an HTML comment block.
 */
function parseSectionMeta(raw: string): SectionMeta | undefined {
  const match = raw.match(META_BLOCK_REGEX);
  if (!match) return undefined;

  const yaml = match[1];
  const parsed = parseFrontmatterYaml(yaml);

  return parsed as unknown as SectionMeta;
}

/**
 * Parse a HARP document from a raw markdown string.
 */
export function parseDocument(raw: string): HarpDocument {
  // Split frontmatter from body
  const parts = raw.split(FRONTMATTER_DELIMITER);
  if (parts.length < 3) {
    throw new Error("Invalid HARP document: missing frontmatter delimiters");
  }

  const frontmatterYaml = parts[1];
  const body = parts.slice(2).join(FRONTMATTER_DELIMITER).trimStart();

  // Parse frontmatter
  const fm = parseFrontmatterYaml(frontmatterYaml);
  const frontmatter: HarpFrontmatter = {
    harp: String(fm.harp ?? HARP_VERSION),
    dyad: String(fm.dyad ?? ""),
    epoch: Number(fm.epoch ?? 1),
    created: String(fm.created ?? ""),
    updated: String(fm.updated ?? ""),
    previous: fm.previous ? String(fm.previous) : null,
    layer: (fm.layer as Layer) ?? "public",
    entities: (fm.entities as [EntityDescriptor, EntityDescriptor]) ?? [],
    checksum: String(fm.checksum ?? ""),
    signatures: fm.signatures as HarpFrontmatter["signatures"],
  };

  // Parse sections
  const sections: HarpSection[] = [];
  const sectionChunks = body.split(/(?=^## )/m);

  let preamble = "";

  for (const chunk of sectionChunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(SECTION_HEADING_REGEX);
    if (!headingMatch) {
      // This is preamble text (before first section)
      preamble += trimmed + "\n";
      continue;
    }

    const type = headingMatch[1] as SectionType;
    const title = headingMatch[2];

    // Extract content after heading (and after meta block if present)
    const afterHeading = trimmed.slice(headingMatch[0].length).trim();
    const meta = parseSectionMeta(afterHeading);

    let content = afterHeading;
    if (meta) {
      // Remove the meta block from content
      content = content.replace(META_BLOCK_REGEX, "").trim();
    }

    sections.push({
      type,
      title,
      meta,
      content,
      raw: trimmed,
    });
  }

  return {
    frontmatter,
    preamble: preamble.trim(),
    sections,
    raw,
  };
}

// =============================================================================
// Document Serialization
// =============================================================================

/**
 * Compute SHA-256 checksum of content.
 */
export function computeChecksum(content: string): string {
  const hash = createHash("sha256").update(content, "utf8").digest("hex");
  return `sha256:${hash}`;
}

/**
 * Serialize section metadata into an HTML comment block.
 */
function serializeSectionMeta(meta: SectionMeta): string {
  const lines: string[] = ["<!-- harp:meta"];

  if (meta.timestamp) lines.push(`timestamp: "${meta.timestamp}"`);
  if (meta.author) lines.push(`author: "${meta.author}"`);
  if (meta.tags?.length) {
    lines.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(", ")}]`);
  }
  if (meta.status) lines.push(`status: "${meta.status}"`);
  if (meta.resolution) lines.push(`resolution: "${meta.resolution}"`);
  if (meta.acknowledged_by) lines.push(`acknowledged_by: "${meta.acknowledged_by}"`);
  if (meta.demonstrated_in?.length) {
    lines.push("demonstrated_in:");
    for (const ref of meta.demonstrated_in) {
      lines.push(`  - "${ref}"`);
    }
  }
  if (meta.references?.length) {
    lines.push("references:");
    for (const ref of meta.references) {
      lines.push(`  - type: "${ref.type}"`);
      if (ref.id) lines.push(`    id: "${ref.id}"`);
      if (ref.tx) lines.push(`    tx: "${ref.tx}"`);
    }
  }
  if (meta.evidence?.length) {
    lines.push("evidence:");
    for (const ev of meta.evidence) {
      if ("interaction_ref" in ev) {
        lines.push(`  - interaction_ref: "${ev.interaction_ref}"`);
      } else {
        lines.push(`  - type: "${ev.type}"`);
        if (ev.id) lines.push(`    id: "${ev.id}"`);
      }
    }
  }

  lines.push("-->");
  return lines.join("\n");
}

/**
 * Serialize a section to markdown.
 */
export function serializeSection(section: HarpSection): string {
  const lines: string[] = [];
  lines.push(`## ${section.type}: ${section.title}`);
  lines.push("");

  if (section.meta) {
    lines.push(serializeSectionMeta(section.meta));
    lines.push("");
  }

  if (section.content) {
    lines.push(section.content);
  }

  return lines.join("\n");
}

/**
 * Serialize a full HARP document to markdown.
 * Recomputes the checksum based on the body content.
 */
export function serializeDocument(doc: HarpDocument): string {
  // Build body
  const bodyParts: string[] = [];

  if (doc.preamble) {
    bodyParts.push(doc.preamble);
    bodyParts.push("");
    bodyParts.push("---");
    bodyParts.push("");
  }

  for (const section of doc.sections) {
    bodyParts.push(serializeSection(section));
    bodyParts.push("");
  }

  const body = bodyParts.join("\n").trim();

  // Compute checksum
  const checksum = computeChecksum(body);

  // Build frontmatter
  const fm = doc.frontmatter;
  const fmLines: string[] = [
    FRONTMATTER_DELIMITER,
    `harp: "${fm.harp}"`,
    `dyad: "${fm.dyad}"`,
    `epoch: ${fm.epoch}`,
    `created: "${fm.created}"`,
    `updated: "${fm.updated}"`,
    fm.previous ? `previous: "${fm.previous}"` : `previous: null`,
    `layer: "${fm.layer}"`,
    `entities:`,
  ];

  for (const entity of fm.entities) {
    fmLines.push(`  - id: "${entity.id}"`);
    fmLines.push(`    type: "${entity.type}"`);
    if (entity.name) fmLines.push(`    name: "${entity.name}"`);
    if (entity.erc8004) {
      fmLines.push(`    erc8004:`);
      fmLines.push(`      chainId: ${entity.erc8004.chainId}`);
      fmLines.push(`      agentId: ${entity.erc8004.agentId}`);
    }
  }

  fmLines.push(`checksum: "${checksum}"`);

  if (fm.signatures?.length) {
    fmLines.push(`signatures:`);
    for (const sig of fm.signatures) {
      fmLines.push(`  - entity: "${sig.entity}"`);
      fmLines.push(`    sig: "${sig.sig}"`);
      fmLines.push(`    scheme: "${sig.scheme}"`);
    }
  }

  fmLines.push(FRONTMATTER_DELIMITER);

  return fmLines.join("\n") + "\n\n" + body + "\n";
}

// =============================================================================
// Document Creation
// =============================================================================

/**
 * Create a new HARP document (epoch 1) for a dyad.
 */
export function createDocument(
  entityA: EntityDescriptor,
  entityB: EntityDescriptor,
  layer: Layer,
  preamble?: string
): HarpDocument {
  const dyadId = computeDyadId(entityA.id, entityB.id);
  const now = new Date().toISOString();

  // Sort entities to match dyad ID order
  const entities: [EntityDescriptor, EntityDescriptor] =
    entityA.id < entityB.id ? [entityA, entityB] : [entityB, entityA];

  const doc: HarpDocument = {
    frontmatter: {
      harp: HARP_VERSION,
      dyad: dyadId,
      epoch: 1,
      created: now,
      updated: now,
      previous: null,
      layer,
      entities,
      checksum: "", // Will be computed during serialization
    },
    preamble: preamble ?? "",
    sections: [],
    raw: "",
  };

  // Serialize to compute checksum and raw
  doc.raw = serializeDocument(doc);
  doc.frontmatter.checksum = computeChecksum(
    doc.raw.split(FRONTMATTER_DELIMITER).slice(2).join(FRONTMATTER_DELIMITER).trim()
  );

  return doc;
}

/**
 * Create a new epoch from an existing document.
 * Increments epoch, sets previous to the given CID, updates timestamp.
 */
export function createNextEpoch(
  doc: HarpDocument,
  previousCid: CID
): HarpDocument {
  const now = new Date().toISOString();

  return {
    ...doc,
    frontmatter: {
      ...doc.frontmatter,
      epoch: doc.frontmatter.epoch + 1,
      updated: now,
      previous: previousCid,
      checksum: "", // Will be recomputed on serialization
    },
    raw: "", // Will be recomputed on serialization
  };
}

// =============================================================================
// Section Operations
// =============================================================================

/**
 * Add a section to a HARP document.
 * Returns a new document (immutable operation).
 */
export function addSection(
  doc: HarpDocument,
  section: HarpSection
): HarpDocument {
  return {
    ...doc,
    sections: [...doc.sections, section],
    raw: "", // Needs re-serialization
  };
}

/**
 * Create a section object.
 */
export function createSection(
  type: SectionType,
  title: string,
  content: string,
  meta?: Partial<SectionMeta>
): HarpSection {
  const fullMeta: SectionMeta | undefined = meta
    ? {
        timestamp: meta.timestamp ?? new Date().toISOString(),
        author: meta.author ?? "",
        ...meta,
      }
    : undefined;

  const section: HarpSection = {
    type,
    title,
    meta: fullMeta as SectionMeta | undefined,
    content,
    raw: "", // Will be computed during serialization
  };

  section.raw = serializeSection(section);
  return section;
}

/**
 * Filter sections from a document.
 */
export function filterSections(
  doc: HarpDocument,
  filter: SectionFilter
): HarpSection[] {
  let sections = doc.sections;

  if (filter.types?.length) {
    sections = sections.filter((s) => filter.types!.includes(s.type));
  }

  if (filter.author) {
    sections = sections.filter((s) => s.meta?.author === filter.author);
  }

  if (filter.after) {
    const after = new Date(filter.after).getTime();
    sections = sections.filter(
      (s) => s.meta?.timestamp && new Date(s.meta.timestamp).getTime() > after
    );
  }

  if (filter.before) {
    const before = new Date(filter.before).getTime();
    sections = sections.filter(
      (s) => s.meta?.timestamp && new Date(s.meta.timestamp).getTime() < before
    );
  }

  if (filter.tags?.length) {
    sections = sections.filter(
      (s) =>
        s.meta?.tags && filter.tags!.some((t) => s.meta!.tags!.includes(t))
    );
  }

  if (filter.limit) {
    sections = sections.slice(0, filter.limit);
  }

  return sections;
}

// =============================================================================
// AIRC Integration Helpers
// =============================================================================

/**
 * Create a HARP dyad proposal message for AIRC.
 */
export function createProposal(
  from: EntityId,
  to: EntityId,
  context?: string
): HarpProposal {
  return {
    type: "harp_propose",
    from: normalizeEntityId(from),
    to: normalizeEntityId(to),
    dyad: computeDyadId(from, to),
    initial_context: context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a HARP update notification for AIRC.
 */
export function createUpdateNotification(
  from: EntityId,
  to: EntityId,
  layer: Layer,
  epoch: number,
  cid: CID
): HarpUpdateNotification {
  return {
    type: "harp_update",
    from: normalizeEntityId(from),
    to: normalizeEntityId(to),
    dyad: computeDyadId(from, to),
    layer,
    epoch,
    cid,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a HARP context attachment for an AIRC handoff.
 */
export function createContextAttachment(
  dyadId: DyadId,
  layer: Layer,
  cid: CID,
  relevantSections?: string[]
): HarpContextAttachment {
  return {
    type: "harp_context",
    dyad: dyadId,
    layer,
    cid,
    relevant_sections: relevantSections,
  };
}

// =============================================================================
// Scoring Derivation
// =============================================================================

/**
 * Derive a simple trust score from a HARP document.
 * See DESIGN.md for algorithm details.
 *
 * Returns a score between 0 and 1.
 */
export function deriveTrustScore(doc: HarpDocument): DerivedScore {
  const factors: Record<string, number> = {
    interactions: 0,
    trust_signals: 0,
    decisions: 0,
    capabilities: 0,
    resolved_tensions: 0,
    unresolved_tensions: 0,
  };
  const sourceSections: string[] = [];

  let score = 0;
  let maxScore = 0;

  for (const section of doc.sections) {
    sourceSections.push(`${section.type}: ${section.title}`);

    switch (section.type) {
      case "Interaction":
        score += 1.0;
        maxScore += 1.0;
        factors.interactions++;
        break;

      case "Trust":
        score += 2.0;
        maxScore += 2.0;
        factors.trust_signals++;
        break;

      case "Decision":
        if (section.meta?.acknowledged_by) {
          score += 1.5;
        } else {
          score += 0.5;
        }
        maxScore += 1.5;
        factors.decisions++;
        break;

      case "Capability":
        score += 1.0;
        maxScore += 1.0;
        factors.capabilities++;
        break;

      case "Tension":
        if (section.meta?.status === "resolved") {
          score += 0.5;
          factors.resolved_tensions++;
        } else {
          score -= 2.0;
          factors.unresolved_tensions++;
        }
        maxScore += 0.5;
        break;

      case "Context":
      case "Note":
        // Context and notes don't directly affect trust score
        break;
    }
  }

  const normalizedScore = maxScore > 0 ? Math.max(0, Math.min(1, score / maxScore)) : 0;

  return {
    algorithm: "trust_simple_v1",
    score: Math.round(normalizedScore * 1000) / 1000,
    factors,
    source_sections: sourceSections,
    computed_at: new Date().toISOString(),
    source_epoch: doc.frontmatter.epoch,
  };
}

/**
 * Assess collaboration readiness from a HARP document.
 */
export function assessCollaborationReadiness(
  doc: HarpDocument
): CollaborationReadiness {
  const interactions = doc.sections.filter((s) => s.type === "Interaction");
  const tensions = doc.sections.filter((s) => s.type === "Tension");
  const unresolvedTensions = tensions.filter(
    (s) => s.meta?.status !== "resolved"
  );
  const contexts = doc.sections.filter((s) => s.type === "Context");
  const decisions = doc.sections.filter((s) => s.type === "Decision");
  const hasPayment = doc.sections.some(
    (s) =>
      s.meta?.x402 ||
      s.meta?.tags?.includes("payment") ||
      s.content.toLowerCase().includes("payment")
  );

  const interactionCount = interactions.length;
  let readinessLevel: CollaborationReadiness["readinessLevel"];

  if (interactionCount === 0) {
    readinessLevel = "new";
  } else if (interactionCount < 3) {
    readinessLevel = "emerging";
  } else if (interactionCount < 8 || decisions.length < 2) {
    readinessLevel = "established";
  } else {
    readinessLevel = "mature";
  }

  return {
    hasHistory: interactionCount > 0,
    interactionCount,
    unresolvedTensions: unresolvedTensions.length,
    hasCommPreferences: contexts.length > 0,
    hasSharedDecisions: decisions.length > 0,
    paymentHistory: hasPayment,
    readinessLevel,
  };
}

// =============================================================================
// In-Memory Storage (for testing and local development)
// =============================================================================

/**
 * Simple in-memory storage backend.
 * Useful for testing and local development. Not for production.
 */
export class MemoryStorage implements HarpStorage {
  private store = new Map<CID, string>();
  private pinned = new Set<CID>();

  async store(content: string): Promise<CID> {
    // Simulate a CID by hashing the content
    const hash = createHash("sha256").update(content, "utf8").digest("hex");
    const cid = `bafymem${hash.slice(0, 40)}`;
    this.store.set(cid, content);
    return cid;
  }

  async retrieve(cid: CID): Promise<string> {
    const content = this.store.get(cid);
    if (!content) throw new Error(`CID not found: ${cid}`);
    return content;
  }

  async exists(cid: CID): Promise<boolean> {
    return this.store.has(cid);
  }

  async pin(cid: CID): Promise<void> {
    this.pinned.add(cid);
  }

  async unpin(cid: CID): Promise<void> {
    this.pinned.delete(cid);
  }
}

// =============================================================================
// HARP Client
// =============================================================================

/**
 * HARP client — the main interface for working with HARP documents.
 *
 * Usage:
 * ```typescript
 * const client = new HarpClient({
 *   identity: { entityId: "airc:alice", type: "human" },
 *   storage: "memory",
 * });
 *
 * const doc = await client.createDyad(
 *   { id: "airc:alice", type: "human", name: "Alice" },
 *   { id: "erc8004:1:42", type: "agent", name: "Atlas" },
 *   "public",
 *   "Collaboration on documentation projects"
 * );
 * ```
 */
export class HarpClient {
  private config: HarpConfig;
  private storage: HarpStorage;

  // Local cache of current epoch CIDs per dyad+layer
  private pointers = new Map<string, CID>();

  constructor(config: HarpConfig) {
    this.config = config;

    // Initialize storage backend
    switch (config.storage ?? "memory") {
      case "memory":
        this.storage = new MemoryStorage();
        break;
      case "ipfs":
        // TODO: Implement IPFS storage backend
        throw new Error("IPFS storage not yet implemented. Use 'memory' or 'local'.");
      case "local":
        // TODO: Implement local file storage backend
        throw new Error("Local storage not yet implemented. Use 'memory'.");
      default:
        this.storage = new MemoryStorage();
    }
  }

  /**
   * Create a new dyad and store the initial (epoch 1) document.
   */
  async createDyad(
    entityA: EntityDescriptor,
    entityB: EntityDescriptor,
    layer: Layer = "public",
    preamble?: string
  ): Promise<{ document: HarpDocument; cid: CID }> {
    const doc = createDocument(entityA, entityB, layer, preamble);
    const serialized = serializeDocument(doc);
    const cid = await this.storage.store(serialized);

    const pointerKey = `${doc.frontmatter.dyad}:${layer}`;
    this.pointers.set(pointerKey, cid);

    // Update raw with final serialized form
    doc.raw = serialized;

    return { document: doc, cid };
  }

  /**
   * Read the current epoch of a dyad.
   */
  async getDyad(dyadId: DyadId, layer: Layer = "public"): Promise<HarpDocument | null> {
    const pointerKey = `${dyadId}:${layer}`;
    const cid = this.pointers.get(pointerKey);
    if (!cid) return null;

    const raw = await this.storage.retrieve(cid);
    return parseDocument(raw);
  }

  /**
   * Add a section to a dyad and create a new epoch.
   */
  async addSectionToDyad(
    dyadId: DyadId,
    layer: Layer,
    section: HarpSection
  ): Promise<{ document: HarpDocument; cid: CID }> {
    const current = await this.getDyad(dyadId, layer);
    if (!current) {
      throw new Error(`Dyad not found: ${dyadId} (layer: ${layer})`);
    }

    const pointerKey = `${dyadId}:${layer}`;
    const previousCid = this.pointers.get(pointerKey)!;

    // Add section and create new epoch
    let updated = addSection(current, section);
    updated = createNextEpoch(updated, previousCid);

    const serialized = serializeDocument(updated);
    const newCid = await this.storage.store(serialized);

    this.pointers.set(pointerKey, newCid);
    updated.raw = serialized;

    return { document: updated, cid: newCid };
  }

  /**
   * Query sections from a dyad.
   */
  async querySections(
    dyadId: DyadId,
    layer: Layer,
    filter: SectionFilter
  ): Promise<HarpSection[]> {
    const doc = await this.getDyad(dyadId, layer);
    if (!doc) return [];
    return filterSections(doc, filter);
  }

  /**
   * Derive a trust score for a dyad.
   */
  async getTrustScore(dyadId: DyadId, layer: Layer = "public"): Promise<DerivedScore | null> {
    const doc = await this.getDyad(dyadId, layer);
    if (!doc) return null;
    return deriveTrustScore(doc);
  }

  /**
   * Assess collaboration readiness for a dyad.
   */
  async getCollaborationReadiness(
    dyadId: DyadId,
    layer: Layer = "public"
  ): Promise<CollaborationReadiness | null> {
    const doc = await this.getDyad(dyadId, layer);
    if (!doc) return null;
    return assessCollaborationReadiness(doc);
  }

  /**
   * Create AIRC proposal payload for a new dyad.
   */
  createProposal(to: EntityId, context?: string): HarpProposal {
    return createProposal(this.config.identity.entityId, to, context);
  }

  /**
   * Create AIRC context attachment for a handoff.
   */
  async createHandoffContext(
    dyadId: DyadId,
    layer: Layer,
    relevantSectionTypes?: SectionType[]
  ): Promise<HarpContextAttachment | null> {
    const pointerKey = `${dyadId}:${layer}`;
    const cid = this.pointers.get(pointerKey);
    if (!cid) return null;

    let relevantSections: string[] | undefined;
    if (relevantSectionTypes?.length) {
      const doc = await this.getDyad(dyadId, layer);
      if (doc) {
        relevantSections = doc.sections
          .filter((s) => relevantSectionTypes.includes(s.type))
          .map((s) => `${s.type}: ${s.title}`);
      }
    }

    return createContextAttachment(dyadId, layer, cid, relevantSections);
  }

  /**
   * Get the underlying storage backend.
   */
  getStorage(): HarpStorage {
    return this.storage;
  }
}
