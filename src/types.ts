/**
 * HARP — Human/Agentic Relational Protocol
 * Core type definitions
 *
 * These types model the HARP document format as defined in SPEC.md §4.
 * They are designed to be strict enough for validation but flexible enough
 * for the evolving nature of relational context.
 */

// =============================================================================
// Identity
// =============================================================================

/**
 * Entity types supported by HARP.
 */
export type EntityType = "human" | "agent";

/**
 * Entity identifier string. Follows one of:
 *   - "erc8004:<chainId>:<agentId>"  (onchain agent)
 *   - "eth:<address>"                 (Ethereum address)
 *   - "airc:<handle>"                 (AIRC handle)
 */
export type EntityId = string;

/**
 * Dyad identifier string: "harp:<entityA>:<entityB>" where entityA < entityB
 * lexicographically.
 */
export type DyadId = string;

/**
 * IPFS Content Identifier.
 */
export type CID = string;

/**
 * Privacy layer for HARP documents.
 *
 *   public  — Visible to anyone who queries the dyad
 *   shared  — Visible only to the two entities in the dyad
 *   private — Visible only to the author entity
 */
export type Layer = "public" | "shared" | "private";

// =============================================================================
// Entity Descriptors
// =============================================================================

/**
 * ERC-8004 specific metadata for an agent entity.
 */
export interface ERC8004Metadata {
  chainId: number;
  agentId: number;
}

/**
 * An entity descriptor as it appears in HARP document frontmatter.
 */
export interface EntityDescriptor {
  /** Normalized entity identifier */
  id: EntityId;

  /** Entity type */
  type: EntityType;

  /** Human-readable display name (optional) */
  name?: string;

  /** ERC-8004 metadata, if the entity is an onchain agent */
  erc8004?: ERC8004Metadata;
}

// =============================================================================
// Signatures
// =============================================================================

/** Supported signature schemes */
export type SignatureScheme = "eip191" | "eip712" | "ed25519";

/**
 * A cryptographic signature attesting to a document's contents.
 */
export interface Signature {
  entity: EntityId;
  sig: string;
  scheme: SignatureScheme;
}

// =============================================================================
// Document Frontmatter
// =============================================================================

/**
 * HARP document frontmatter (YAML block).
 * Corresponds to SPEC.md §4.2.
 */
export interface HarpFrontmatter {
  /** Protocol version (semver string, e.g., "0.1.0") */
  harp: string;

  /** Canonical dyad identifier */
  dyad: DyadId;

  /** Monotonically increasing epoch number (starts at 1) */
  epoch: number;

  /** ISO 8601 timestamp of dyad creation */
  created: string;

  /** ISO 8601 timestamp of this epoch */
  updated: string;

  /** IPFS CID of the previous epoch, or null for epoch 1 */
  previous: CID | null;

  /** Privacy layer of this document */
  layer: Layer;

  /** Exactly two entity descriptors */
  entities: [EntityDescriptor, EntityDescriptor];

  /** SHA-256 checksum of the document body: "sha256:<hex>" */
  checksum: string;

  /** Optional cryptographic signatures */
  signatures?: Signature[];
}

// =============================================================================
// Section Types
// =============================================================================

/**
 * Core section types defined by the HARP spec.
 * Custom types use "x-" prefix (e.g., "x-MoltX-Bounty").
 */
export type CoreSectionType =
  | "Interaction"
  | "Trust"
  | "Context"
  | "Decision"
  | "Capability"
  | "Tension"
  | "Note";

/**
 * Any valid section type — core or custom (x- prefixed).
 */
export type SectionType = CoreSectionType | `x-${string}`;

/**
 * A reference to an external resource (bounty, AIRC thread, transaction, etc.)
 */
export interface Reference {
  type: string;
  id?: string;
  tx?: string;
  amount?: string;
  [key: string]: unknown; // Extensible
}

/**
 * Metadata embedded in a section's HTML comment block.
 * Not all fields apply to all section types.
 */
export interface SectionMeta {
  /** ISO 8601 timestamp of when this section was authored */
  timestamp: string;

  /** Entity that authored this section */
  author: EntityId;

  /** Freeform tags for categorization */
  tags?: string[];

  /** External references (bounties, threads, transactions) */
  references?: Reference[];

  /** Evidence references for Trust sections */
  evidence?: Array<Reference | { interaction_ref: string }>;

  /** Interaction references where a capability was demonstrated */
  demonstrated_in?: string[];

  /** Entity that acknowledged a Decision */
  acknowledged_by?: EntityId;

  /** Status of a Tension: "resolved", "ongoing", "escalated" */
  status?: "resolved" | "ongoing" | "escalated";

  /** Resolution description for resolved Tensions */
  resolution?: string;

  /** x402 payment details */
  x402?: {
    amount: string;
    tx: string;
    purpose?: string;
  };

  /** Platform identifier for adapter-generated sections */
  platform?: string;

  /** Arbitrary additional metadata (for custom section types) */
  [key: string]: unknown;
}

/**
 * A parsed section from a HARP document body.
 */
export interface HarpSection {
  /** Section type (from the heading) */
  type: SectionType;

  /** Section title (from the heading, after the type prefix) */
  title: string;

  /** Parsed metadata from the HTML comment block (may be undefined) */
  meta?: SectionMeta;

  /** Raw markdown content of the section body (excluding heading and meta) */
  content: string;

  /** The full raw text of this section (heading + meta + content) */
  raw: string;
}

// =============================================================================
// Complete Document
// =============================================================================

/**
 * A fully parsed HARP document.
 */
export interface HarpDocument {
  /** Parsed frontmatter */
  frontmatter: HarpFrontmatter;

  /** Preamble text between frontmatter and first section (the document intro) */
  preamble: string;

  /** Parsed sections in document order */
  sections: HarpSection[];

  /** Raw markdown source */
  raw: string;
}

// =============================================================================
// Epoch & History
// =============================================================================

/**
 * An epoch reference — a lightweight pointer to a specific version.
 */
export interface EpochRef {
  epoch: number;
  cid: CID;
  updated: string;
  checksum: string;
}

/**
 * Full epoch chain for a dyad layer.
 */
export interface EpochChain {
  dyadId: DyadId;
  layer: Layer;
  current: EpochRef;
  history: EpochRef[];
}

// =============================================================================
// Dyad
// =============================================================================

/**
 * A dyad with its current state across all layers.
 */
export interface Dyad {
  id: DyadId;
  entities: [EntityDescriptor, EntityDescriptor];
  created: string;
  layers: {
    public?: EpochRef;
    shared?: EpochRef;
    // Private layers are entity-specific and not exposed here
  };
}

// =============================================================================
// AIRC Integration Types
// =============================================================================

/**
 * HARP-specific AIRC message types.
 */
export type HarpAIRCMessageType =
  | "harp_propose"
  | "harp_accept"
  | "harp_decline"
  | "harp_update"
  | "harp_context";

/**
 * AIRC message payload for HARP dyad proposal.
 */
export interface HarpProposal {
  type: "harp_propose";
  from: EntityId;
  to: EntityId;
  dyad: DyadId;
  initial_context?: string;
  timestamp: string;
}

/**
 * AIRC message payload for HARP dyad acceptance/decline.
 */
export interface HarpProposalResponse {
  type: "harp_accept" | "harp_decline";
  from: EntityId;
  to: EntityId;
  dyad: DyadId;
  timestamp: string;
  reason?: string; // For declines
}

/**
 * AIRC message payload for HARP epoch update notification.
 */
export interface HarpUpdateNotification {
  type: "harp_update";
  from: EntityId;
  to: EntityId;
  dyad: DyadId;
  layer: Layer;
  epoch: number;
  cid: CID;
  timestamp: string;
}

/**
 * HARP context attachment for AIRC handoffs.
 */
export interface HarpContextAttachment {
  type: "harp_context";
  dyad: DyadId;
  layer: Layer;
  cid: CID;
  relevant_sections?: string[];
}

// =============================================================================
// Scoring
// =============================================================================

/**
 * A derived score from HARP relational context.
 */
export interface DerivedScore {
  /** The scoring algorithm used */
  algorithm: string;

  /** Numeric score (interpretation depends on algorithm) */
  score: number;

  /** Breakdown of scoring factors */
  factors: Record<string, number>;

  /** Section references that contributed to the score */
  source_sections: string[];

  /** When the score was computed */
  computed_at: string;

  /** The epoch this score was derived from */
  source_epoch: number;
}

/**
 * Collaboration readiness assessment.
 */
export interface CollaborationReadiness {
  hasHistory: boolean;
  interactionCount: number;
  unresolvedTensions: number;
  hasCommPreferences: boolean;
  hasSharedDecisions: boolean;
  paymentHistory: boolean;
  readinessLevel: "new" | "emerging" | "established" | "mature";
}

// =============================================================================
// Configuration
// =============================================================================

/**
 * HARP client configuration.
 */
export interface HarpConfig {
  /** HARP node endpoint URL */
  nodeUrl?: string;

  /** IPFS gateway URL (for reading) */
  ipfsGateway?: string;

  /** IPFS API URL (for writing) */
  ipfsApi?: string;

  /** Onchain registry contract address */
  registryAddress?: string;

  /** Chain ID for onchain operations */
  chainId?: number;

  /** Entity identity for this client */
  identity: {
    entityId: EntityId;
    type: EntityType;
    /** Private key or signer function for signing documents */
    signer?: ((data: Uint8Array) => Promise<Uint8Array>) | string;
  };

  /** Storage backend override (default: IPFS) */
  storage?: "ipfs" | "local" | "memory";

  /** Local storage path (when storage = "local") */
  localPath?: string;
}

// =============================================================================
// Section Filter (for queries)
// =============================================================================

/**
 * Filter criteria for section queries.
 */
export interface SectionFilter {
  /** Filter by section type(s) */
  types?: SectionType[];

  /** Filter by author entity */
  author?: EntityId;

  /** Only sections after this timestamp */
  after?: string;

  /** Only sections before this timestamp */
  before?: string;

  /** Filter by tags (any match) */
  tags?: string[];

  /** Maximum number of sections to return */
  limit?: number;
}

// =============================================================================
// Storage Interface
// =============================================================================

/**
 * Abstract storage backend for HARP documents.
 * Implementations: IPFS, local filesystem, in-memory (for testing).
 */
export interface HarpStorage {
  /** Store a document and return its content identifier */
  store(content: string): Promise<CID>;

  /** Retrieve a document by its content identifier */
  retrieve(cid: CID): Promise<string>;

  /** Check if a CID exists in storage */
  exists(cid: CID): Promise<boolean>;

  /** Pin a CID to ensure persistence */
  pin(cid: CID): Promise<void>;

  /** Unpin a CID */
  unpin(cid: CID): Promise<void>;
}

/**
 * Onchain registry interface for CID pointers.
 */
export interface HarpRegistry {
  /** Set the current CID pointer for a dyad layer */
  setPointer(dyadId: DyadId, layer: Layer, cid: CID): Promise<string>; // tx hash

  /** Get the current CID pointer for a dyad layer */
  getPointer(dyadId: DyadId, layer: Layer): Promise<CID | null>;

  /** Listen for pointer updates */
  onPointerUpdated(
    dyadId: DyadId,
    callback: (layer: Layer, cid: CID) => void
  ): () => void; // Returns unsubscribe function
}
