/**
 * @dyad/harp — Human-Agent Relational Protocol
 *
 * Public API surface. Only intentionally exported symbols are re-exported here.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Core client
// ---------------------------------------------------------------------------

export {
  HarpClient,
  MemoryStorage,
} from "./harp.js";

// ---------------------------------------------------------------------------
// Document lifecycle
// ---------------------------------------------------------------------------

export {
  createDocument,
  createNextEpoch,
  parseDocument,
  serializeDocument,
  serializeSection,
  computeChecksum,
} from "./harp.js";

// ---------------------------------------------------------------------------
// Section operations
// ---------------------------------------------------------------------------

export {
  createSection,
  addSection,
  filterSections,
} from "./harp.js";

// ---------------------------------------------------------------------------
// Identity utilities
// ---------------------------------------------------------------------------

export {
  normalizeEntityId,
  computeDyadId,
} from "./harp.js";

// ---------------------------------------------------------------------------
// AIRC integration helpers
// ---------------------------------------------------------------------------

export {
  createProposal,
  createUpdateNotification,
  createContextAttachment,
} from "./harp.js";

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export {
  deriveTrustScore,
  assessCollaborationReadiness,
} from "./harp.js";

// ---------------------------------------------------------------------------
// Types — re-export everything from the type definitions
// ---------------------------------------------------------------------------

export type {
  EntityType,
  EntityId,
  DyadId,
  CID,
  Layer,
  ERC8004Metadata,
  EntityDescriptor,
  SignatureScheme,
  Signature,
  HarpFrontmatter,
  CoreSectionType,
  SectionType,
  Reference,
  SectionMeta,
  HarpSection,
  HarpDocument,
  EpochRef,
  EpochChain,
  Dyad,
  HarpAIRCMessageType,
  HarpProposal,
  HarpProposalResponse,
  HarpUpdateNotification,
  HarpContextAttachment,
  DerivedScore,
  CollaborationReadiness,
  HarpConfig,
  SectionFilter,
  HarpStorage,
  HarpRegistry,
} from "./types.js";
