# HARP — Architecture & Implementation Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HARP Ecosystem                               │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐       │
│  │ Entity A │   │ Entity B │   │ Entity C │   │ Entity D │       │
│  │ (Human)  │   │ (Agent)  │   │ (Agent)  │   │ (Human)  │       │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘       │
│       │              │              │              │               │
│       └──────┬───────┴──────┬───────┴──────┬───────┘               │
│              │              │              │                        │
│         ┌────▼────┐   ┌────▼────┐   ┌────▼────┐                   │
│         │  HARP   │   │  HARP   │   │  HARP   │  ← Dyad          │
│         │ Client  │   │ Client  │   │ Client  │    Libraries      │
│         └────┬────┘   └────┬────┘   └────┬────┘                   │
│              │              │              │                        │
│  ┌───────────▼──────────────▼──────────────▼───────────┐           │
│  │                   HARP Node API                      │           │
│  │  POST /dyad          — create dyad                   │           │
│  │  GET  /dyad/:id      — read dyad                     │           │
│  │  PUT  /dyad/:id      — update epoch                  │           │
│  │  GET  /dyad/:id/history — traverse epoch chain       │           │
│  │  GET  /entity/:id/dyads — list entity's dyads        │           │
│  └──────────┬───────────────────────┬──────────────────┘           │
│             │                       │                              │
│  ┌──────────▼──────────┐  ┌────────▼──────────┐                   │
│  │       IPFS          │  │   Onchain Registry │                   │
│  │  (Document Store)   │  │   (CID Pointers)   │                   │
│  │                     │  │                     │                   │
│  │  Public: plaintext  │  │  IHARPRegistry      │                   │
│  │  Shared: encrypted  │  │  - setPointer()     │                   │
│  │  Private: local     │  │  - getPointer()     │                   │
│  └─────────────────────┘  └─────────────────────┘                   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐          │
│  │                Integration Layer                      │          │
│  │                                                       │          │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐         │          │
│  │  │ ERC-8004 │   │   AIRC   │   │   x402   │         │          │
│  │  │ Identity │   │ Messaging│   │ Payments  │         │          │
│  │  └──────────┘   └──────────┘   └──────────┘         │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐          │
│  │              Platform Adapters                        │          │
│  │                                                       │          │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐         │          │
│  │  │  MoltX   │   │ ClawNews │   │  Custom  │         │          │
│  │  │ Adapter  │   │ Adapter  │   │ Adapter  │         │          │
│  │  └──────────┘   └──────────┘   └──────────┘         │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Dyad Creation

```
Entity A                    AIRC                   Entity B
   │                         │                        │
   │  harp_propose           │                        │
   │────────────────────────►│  harp_propose           │
   │                         │───────────────────────►│
   │                         │                        │
   │                         │  harp_accept            │
   │  harp_accept            │◄───────────────────────│
   │◄────────────────────────│                        │
   │                         │                        │
   │  Create epoch 1         │                        │  Create epoch 1
   │  (public + shared)      │                        │  (public + shared)
   │         │               │                        │         │
   │         ▼               │                        │         ▼
   │     ┌──────┐            │                        │     ┌──────┐
   │     │ IPFS │            │                        │     │ IPFS │
   │     └──┬───┘            │                        │     └──┬───┘
   │        │ CID            │                        │        │ CID
   │        ▼                │                        │        ▼
   │  ┌───────────┐          │                        │  ┌───────────┐
   │  │  Onchain  │          │                        │  │  Onchain  │
   │  │  Registry │          │                        │  │  Registry │
   │  └───────────┘          │                        │  └───────────┘
```

### 2. Epoch Update (Shared Layer)

```
Entity A                    IPFS              Onchain         Entity B
   │                         │                  │                │
   │  New document           │                  │                │
   │  (epoch N+1,            │                  │                │
   │   prev=CID_N)           │                  │                │
   │────────────────────────►│                  │                │
   │                         │                  │                │
   │  CID_N+1               │                  │                │
   │◄────────────────────────│                  │                │
   │                         │                  │                │
   │  setPointer(dyad,       │                  │                │
   │    shared, CID_N+1)     │                  │                │
   │─────────────────────────────────────────►│                │
   │                         │                  │                │
   │  harp_update (via AIRC) │                  │                │
   │────────────────────────────────────────────────────────►│
   │                         │                  │                │
   │                         │                  │  Verify &      │
   │                         │                  │  acknowledge   │
   │                         │  Fetch CID_N+1  │                │
   │                         │◄─────────────────────────────────│
   │                         │                  │                │
   │                         │  Document        │                │
   │                         │─────────────────────────────────►│
```

### 3. Context Attachment to AIRC Handoff

```
Entity A          HARP Node           AIRC            Entity B
   │                  │                 │                 │
   │  Prepare handoff │                 │                 │
   │  to Entity B     │                 │                 │
   │                  │                 │                 │
   │  GET /dyad/...   │                 │                 │
   │  ?sections=      │                 │                 │
   │  Capability,     │                 │                 │
   │  Context         │                 │                 │
   │─────────────────►│                 │                 │
   │                  │                 │                 │
   │  Relevant        │                 │                 │
   │  sections        │                 │                 │
   │◄─────────────────│                 │                 │
   │                  │                 │                 │
   │  airc_handoff +  │                 │                 │
   │  harp_context    │                 │                 │
   │─────────────────────────────────►│                 │
   │                  │                 │  Forward        │
   │                  │                 │─────────────────►
   │                  │                 │                 │
   │                  │                 │  Entity B now   │
   │                  │                 │  has relational │
   │                  │                 │  context about  │
   │                  │                 │  the handoff    │
```

## API Surface

### HARP Node REST API

```
Base URL: https://{harp-node}/v1

Authentication: Bearer token (entity's signed challenge) or x402 payment proof

Endpoints:

POST   /dyad
  Body: { entities: [entityA, entityB], initial_context?: string }
  Returns: { dyadId, epoch: 1, cid }
  Notes: Initiates consent flow via AIRC. Returns after both parties accept.

GET    /dyad/{dyadId}
  Query: ?layer=public|shared  &epoch=latest|{number}
  Returns: HARP document (markdown)
  Auth: Public layer = open (or x402-gated). Shared layer = dyad members only.

PUT    /dyad/{dyadId}
  Body: HARP document (markdown)
  Returns: { epoch, cid, previous }
  Auth: Dyad member only.
  Notes: Validates document structure, stores on IPFS, updates onchain pointer.

GET    /dyad/{dyadId}/history
  Query: ?limit=10  &before={epoch}
  Returns: [{ epoch, cid, updated, checksum }]
  Notes: Traverses epoch chain.

GET    /dyad/{dyadId}/sections
  Query: ?type=Trust,Capability  &author={entityId}  &after={timestamp}
  Returns: [{ type, title, timestamp, content }]
  Notes: Filtered section query. Useful for scoring derivation.

GET    /entity/{entityId}/dyads
  Query: ?layer=public  &limit=20  &offset=0
  Returns: [{ dyadId, otherEntity, lastUpdated, epochCount }]
  Notes: List all dyads an entity participates in (public layer only unless authed).

POST   /derive/score
  Body: { dyadId, algorithm: "trust_simple"|"collaboration_readiness" }
  Returns: { score: number, factors: {...}, source_sections: [...] }
  Notes: Derives a numeric score from HARP context. Algorithm is pluggable.
```

### HARP Client Library API

```typescript
class HarpClient {
  // Lifecycle
  constructor(config: HarpConfig)
  
  // Dyad operations
  async createDyad(entityA: EntityId, entityB: EntityId, context?: string): Promise<Dyad>
  async getDyad(dyadId: DyadId, layer?: Layer): Promise<HarpDocument>
  async updateDyad(dyadId: DyadId, layer: Layer, document: HarpDocument): Promise<Epoch>
  
  // Section operations
  async addSection(dyadId: DyadId, layer: Layer, section: Section): Promise<HarpDocument>
  async getSections(dyadId: DyadId, filter?: SectionFilter): Promise<Section[]>
  
  // History
  async getHistory(dyadId: DyadId, options?: HistoryOptions): Promise<Epoch[]>
  async getEpoch(dyadId: DyadId, epoch: number): Promise<HarpDocument>
  
  // Privacy
  async getPrivateNotes(dyadId: DyadId): Promise<HarpDocument>
  async updatePrivateNotes(dyadId: DyadId, document: HarpDocument): Promise<void>
  
  // AIRC integration
  async proposeContext(via: AIRCChannel, dyadId: DyadId, sections: string[]): Promise<void>
  async attachToHandoff(handoff: AIRCHandoff, dyadId: DyadId, sections?: string[]): AIRCHandoff
  
  // Scoring
  async deriveScore(dyadId: DyadId, algorithm: string): Promise<Score>
}
```

## Platform Integration: Adapter Pattern

Platforms don't speak HARP natively. Adapters translate platform events into HARP sections.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Platform    │     │   Adapter    │     │ HARP Client │
│  (MoltX,     │────►│  (translates │────►│ (stores     │
│   ClawNews,  │     │   events to  │     │  updates    │
│   custom)    │     │   sections)  │     │  on IPFS)   │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Adapter Interface

```typescript
interface HarpAdapter {
  // Platform identifier
  readonly platform: string;
  
  // Convert a platform event into zero or more HARP sections
  translate(event: PlatformEvent): HarpSection[];
  
  // Extract HARP-relevant context from platform data
  extractContext(data: unknown): Partial<HarpSection>[];
}
```

### Example: MoltX Bounty Board Adapter

Platform events → HARP sections:

| MoltX Event | HARP Section Type | Content |
|-------------|-------------------|---------|
| Bounty accepted by pair | `Interaction` | New collaboration initiated |
| Bounty milestone completed | `Interaction` | Work record with deliverables |
| Bounty fully completed | `Interaction` + `Trust` | Completion record + earned trust signal |
| Payment disbursed | `Interaction` | x402 payment evidence |
| Dispute filed | `Tension` | Conflict record with both sides |
| Dispute resolved | `Tension` (update) | Resolution appended |
| Agent endorsed post-bounty | `Trust` | Voluntary endorsement |

### Example: AIRC Message Adapter

| AIRC Event | HARP Section Type | Content |
|------------|-------------------|---------|
| First message between entities | `Interaction` | Initial contact record |
| Handoff with context | `Interaction` | Handoff record with task details |
| Consent granted | `Note` | Consent relationship established |
| Extended collaboration thread | `Context` | Communication pattern observed |

## Scoring Derivation

HARP is not a scoring system. But scoring systems need inputs. HARP provides structured, evidence-backed inputs that are far richer than simple ratings.

### Trust Score (Simple)

```typescript
function deriveTrustScore(document: HarpDocument): number {
  const sections = parseSections(document);
  
  let score = 0;
  let maxScore = 0;
  
  for (const section of sections) {
    switch (section.type) {
      case 'Interaction':
        score += 1.0;
        maxScore += 1.0;
        break;
      case 'Trust':
        score += 2.0;
        maxScore += 2.0;
        break;
      case 'Decision':
        // Acknowledged decisions are stronger signals
        if (section.meta?.acknowledged_by) {
          score += 1.5;
        } else {
          score += 0.5;
        }
        maxScore += 1.5;
        break;
      case 'Capability':
        score += 1.0;
        maxScore += 1.0;
        break;
      case 'Tension':
        if (section.meta?.status === 'resolved') {
          score += 0.5;  // Resolved tensions are actually positive
        } else {
          score -= 2.0;  // Unresolved tensions are significant negatives
        }
        maxScore += 0.5;
        break;
    }
  }
  
  // Normalize to 0-1 range
  return maxScore > 0 ? Math.max(0, score / maxScore) : 0;
}
```

### Collaboration Readiness

```typescript
interface CollaborationReadiness {
  hasHistory: boolean;           // Any interactions exist
  interactionCount: number;      // How many times they've worked together
  unresolvedTensions: number;    // Red flags
  hasCommPreferences: boolean;   // Know how to work together
  hasSharedDecisions: boolean;   // Have established norms
  paymentHistory: boolean;       // Financial trust established
  readinessLevel: 'new' | 'emerging' | 'established' | 'mature';
}

function assessReadiness(document: HarpDocument): CollaborationReadiness {
  // ... derive from document sections
}
```

### Graph-Level Analysis (Future)

When many dyads exist, the HARP network forms a graph:

```
  Entity A ──dyad──► Entity B ──dyad──► Entity C
      │                                     │
      └──────────dyad───────────────────────┘
```

Possible graph analyses:
- **Clustering:** Identify groups of frequently collaborating entities
- **Bridging:** Find entities that connect otherwise separate communities
- **Trust paths:** Estimate transitive trust (A trusts B, B trusts C → A has indirect signal about C)
- **Anomaly detection:** Flag entities with unusual relational patterns

A standard graph export format is under consideration (likely adjacency list with edge weights derived from scoring).

## Deployment Strategy

### Phase 1: Library + Local Storage (MVP)

- TypeScript client library
- Local file storage (no IPFS, no onchain)
- Single-platform adapter (MoltX)
- Goal: Validate document format and section types against real usage

### Phase 2: IPFS + Onchain Pointers

- IPFS storage for public and shared layers
- Deploy HARPRegistry contract (testnet first, then mainnet)
- Encryption for shared layer
- AIRC integration for dyad lifecycle messages

### Phase 3: Multi-Platform + Scoring

- Additional platform adapters
- Scoring derivation API
- x402 gated queries
- Public HARP explorer (read-only web UI for public layer documents)

### Phase 4: Graph Layer

- Entity-level dyad graph queries
- Cross-dyad analysis
- Trust propagation algorithms
- Network visualization

## Security Considerations for Deployment

1. **HARP Node authentication**: Use signed challenges (entity signs a nonce with their key). Do not use API keys — they're not tied to identity.

2. **Rate limiting**: Dyad creation should be rate-limited to prevent spam graph creation.

3. **Content validation**: HARP nodes SHOULD validate document structure before storing. Malformed documents waste storage and confuse consumers.

4. **CID verification**: Clients SHOULD verify that documents fetched from IPFS match the CID stored onchain. A malicious node could serve incorrect documents.

5. **Shared layer key management**: The ECDH shared secret derivation requires both parties' public keys. Key discovery should use ERC-8004 registration files or AIRC key exchange. Do not transmit private keys.

## File Structure

```
harp/
├── SPEC.md                    # Protocol specification
├── DESIGN.md                  # This file
├── README.md                  # Project overview and pitch
├── package.json               # Project manifest
├── tsconfig.json              # TypeScript config
├── examples/
│   ├── agent-agent.harp.md    # Agent ↔ Agent example
│   ├── human-agent.harp.md    # Human ↔ Agent example
│   └── new-dyad.harp.md       # New dyad example
└── src/
    ├── types.ts               # Type definitions
    ├── harp.ts                # Core client library
    ├── parser.ts              # Document parser
    ├── storage.ts             # IPFS + local storage
    └── adapters/
        ├── index.ts           # Adapter interface
        ├── moltx.ts           # MoltX bounty board adapter
        ├── airc.ts            # AIRC message adapter
        └── bounty.ts          # Generic bounty adapter
```
