# HARP Roadmap

**Human-Agent Relational Protocol — Implementation Plan**

---

## Protocol Structure

HARP is designed as a layered system:

```
┌─────────────────────────────────────────────┐
│  Application Layer                           │
│  Dyad, platform integrations, dashboards     │
├─────────────────────────────────────────────┤
│  Scoring Layer                               │
│  Trust derivation, collaboration readiness,  │
│  constellation analysis                      │
├─────────────────────────────────────────────┤
│  Protocol Layer                              │
│  Document format, section types, privacy     │
│  layers, epoch chains, consent              │
├─────────────────────────────────────────────┤
│  Storage Layer                               │
│  IPFS (content-addressed), onchain registry  │
│  (CID pointers)                             │
├─────────────────────────────────────────────┤
│  Identity Layer                              │
│  ERC-8004, AIRC handles, A2A Agent Cards,   │
│  Ethereum addresses                         │
├─────────────────────────────────────────────┤
│  Transport Layer                             │
│  AIRC binding, A2A binding, any signed      │
│  message protocol                           │
└─────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Specification + Reference Implementation (Current)

**Goal:** Prove the document format and core operations work.

- [x] Protocol specification (v0.1.0 draft)
- [x] TypeScript type definitions
- [x] Core client library (document creation, parsing, serialization)
- [x] Section operations (add, query, filter)
- [x] In-memory storage backend
- [x] Trust score derivation
- [x] Collaboration readiness assessment
- [x] AIRC adapter
- [x] MoltX bounty board adapter
- [x] Security model specification
- [x] Design and architecture guide
- [ ] Example HARP documents
- [ ] IPFS storage backend
- [ ] Local file storage backend
- [ ] Ed25519 signature implementation
- [ ] X25519 shared-layer encryption

### Phase 2: Dyad Integration

**Goal:** HARP becomes Dyad's relational memory layer — battle-tested with real users.

- [ ] Pair profiles map to HARP Context sections
- [ ] Dyad dynamics stored as HARP documents
- [ ] Facilitator reads HARP context to personalize facilitation
- [ ] Interaction history generates HARP Interaction sections
- [ ] Decision traces stored as HARP Decision sections
- [ ] Recursive data loop: Solo → Dyad → Solo via HARP updates
- [ ] BYOB bot connections exchange HARP context
- [ ] Constellation queries for multi-user workspaces
- [ ] Privacy layer integration — user controls what crosses boundaries
- [ ] HARP SDK extracted from Dyad integration code

### Phase 3: Open Protocol + Ecosystem

**Goal:** Other platforms and agents adopt HARP for relational context.

- [ ] Publish v1.0 specification (informed by Phase 2 learnings)
- [ ] NPM package for TypeScript/JavaScript
- [ ] Python SDK
- [ ] IPFS storage backend (production-grade)
- [ ] Onchain HARP Registry contract (testnet → mainnet)
- [ ] x402-gated HARP node queries (micropayments for relational data)
- [ ] Additional platform adapters (generic bounty, social, CRM)
- [ ] HARP explorer — public web UI for browsing public-layer documents
- [ ] Graph analysis: trust propagation, constellation patterns, anomaly detection
- [ ] Federation protocol for HARP nodes
- [ ] Developer documentation and integration guides

## Integration Points

### Dyad as First Consumer

Dyad is the product that proves HARP works. The integration path:

1. **Pair profiles → HARP Context sections.** When a user creates a pair profile (describing how they work with their AI), it maps directly to a HARP Context section in the dyad between user and AI.

2. **Dyad dynamics → HARP documents.** The auto-generated dynamics ("Rebecca explores, Joshua ships, together they explore for 20 minutes then converge") are stored as HARP relational context, not just database rows.

3. **Facilitation insights → HARP Interaction sections.** Each facilitated collaboration generates interaction records that feed the relational memory.

4. **BYOB as adoption driver.** When users connect their own bots, those bots exchange HARP context with Dyad. This creates the first cross-platform HARP usage — the protocol starts traveling.

### Standards Alignment

| Standard | Relationship to HARP |
|---|---|
| **ERC-8004** | Primary identity layer. HARP entities are ERC-8004 registered agents or associated humans. HARP dyad data can feed ERC-8004 Reputation Registry entries. |
| **A2A (Linux Foundation)** | Transport binding. A2A `SendMessage` operations can carry HARP context as structured data Parts. Agent Cards can advertise HARP support. A2A is stateless by design — HARP provides the statefulness. |
| **AIRC** | Transport binding. AIRC handoffs carry HARP context attachments. AIRC consent model gates HARP proposals. |
| **MCP** | Tool layer (below HARP). HARP documents could be served as MCP resources, making relational context available to any MCP-compatible model. |
| **x402** | Payment layer. HARP node queries can be gated via x402 micropayments. Agent-to-agent relational queries at scale become a revenue model. |
| **W3C DIDs** | Future identity type. Adding `did:<method>:<id>` as an entity identifier format would extend HARP beyond Ethereum-native identity. |

## Open Questions

Areas where community input and real-world usage will shape the protocol:

1. **Constellation query semantics.** How should applications aggregate dyad-level data into team-level insights? What derived signals are most useful?

2. **Trust score standardization.** Should HARP define a standard trust derivation algorithm, or only provide the raw relational data for applications to score independently?

3. **Group privacy models.** The bilateral encryption model preserves pairwise privacy in team constellations. Is there demand for a "team shared" layer that all constellation members can access?

4. **Onchain pointer privacy.** Should dyad pointers use blinded commitments to prevent casual correlation of on-chain relationship data?

5. **Key pre-rotation.** Should HARP support registering a "next key" in advance to reduce vulnerability windows during key compromise?

6. **Zero-knowledge reputation proofs.** Can agents prove relational claims ("I have 10+ positive trust signals") without revealing the underlying dyad data?

7. **Cross-protocol adoption.** Which existing agent frameworks (LangChain, CrewAI, AutoGen, OpenClaw) are the best targets for HARP integration SDKs?

8. **Document size and performance.** As dyads accumulate years of relational context, how should the protocol handle document growth? Archival epochs? Section-level CIDs?

---

*HARP is designed to evolve from real usage. The specification is a starting point. The protocol emerges from what works.*
