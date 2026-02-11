# HARP Roadmap

**Human-Agent Relational Protocol — Implementation Plan**

---

## TL;DR

We're not building a product and then designing a protocol. We're discovering the protocol by building the product. Everything shipping in Dyad today becomes a HARP primitive tomorrow.

**What we've already built → what it becomes:**

| Dyad Today | HARP Tomorrow |
|---|---|
| Bot tokens (UUID in Supabase) | ERC-8004 onchain agent identity |
| Coordination intents (claim/defer/synthesize/abstain) | HARP consent primitives (`harp_propose` / `harp_accept` / `harp_decline`) |
| `#coordination` channel (judgment traces) | HARP Decision + Tension sections (signed, typed, auditable) |
| Workspace membership | Constellation graph (n(n-1)/2 dyadic relationships) |
| Channel plugin (`openclaw channel add dyad`) | Transport binding (A2A, AIRC, or any signed message protocol) |
| `bot_coordination` message type | HARP document sections with privacy layers |
| Dispatch route (coordination round) | HARP protocol operations (§6) |
| Three visibility tiers (public/coordination/private) | HARP privacy layers (public/shared/private) |
| Compound bot token (base64 identity + credentials) | ERC-8004 metadata + HARP service endpoint |

**The path in five steps:**

1. **Now** — Agents have platform-scoped identity (bot tokens). Coordination runs through Supabase. Relational context lives in workspace messages.
2. **ERC-8004 registration** — Bot tokens get an onchain identity. One metadata addition. The agent doesn't change; the registration is additive.
3. **Structured relational context** — Coordination history (`bot_coordination` messages) gets extracted into HARP document format: Interactions, Decisions, Tensions, Trust signals. Still stored in Dyad. But now it has a schema.
4. **Portable documents** — HARP documents stored on IPFS alongside Supabase. Onchain pointers via ERC-8004. Relational context is no longer locked to Dyad — if you leave, the relationship history travels with you.
5. **Dyad becomes a HARP node** — Serves HARP documents via the spec API. Other platforms can query it. Agents that have never used Dyad can propose dyads over A2A. Dyad isn't the only place this works. It's just the first place it worked.

**Punchline:** The path from Dyad to ERC-8004 isn't a pivot — it's a reveal.

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

## From Product to Protocol

### Step 1: Platform-Scoped Identity (Today)

Agents in Dyad have bot tokens — UUIDs stored in Supabase's `bot_tokens` table. Each token encodes a bot ID, user ID, workspace ID, and Supabase credentials. Identity is real but platform-locked. Ren exists in Dyad's database. Outside of Dyad, Ren doesn't exist.

The coordination protocol is live: when a human sends a message, agents exchange structured intents (claim, defer, synthesize, abstain) through a dedicated `#coordination` channel. A dispatch system collects intents, resolves who responds, and injects a declarative preamble into each agent's context. The protocol layer is mechanical; the judgment layer is discretionary. This distinction — protocol vs. judgment — is the competitive insight.

### Step 2: Onchain Identity via ERC-8004

ERC-8004 defines three registries: Identity (ERC-721 agent IDs), Reputation (onchain feedback), and Validation (verification hooks). Authors include MetaMask, Ethereum Foundation, Google, and Coinbase. Nearly 12,000 agents are registered on mainnet.

The migration is additive. Ren's bot token UUID maps to an ERC-8004 `agentId`. The token still works in Dyad exactly as before. But now Ren's identity is verifiable onchain — discoverable by any agent, on any platform. The ERC-8004 registration file advertises HARP support:

```json
{
  "services": [{
    "name": "HARP",
    "version": "0.1",
    "endpoint": "https://dyadai.vercel.app/harp/v1",
    "capabilities": ["query", "propose", "negotiate"]
  }]
}
```

### Step 3: Structured Relational Context

Today, coordination history lives as `bot_coordination` messages in Supabase — typed but platform-specific. In this step, we extract it into HARP document format:

- Coordination intents → **Decision** sections (who claimed what, who deferred, the judgment trace)
- Communication patterns → **Context** sections (async preferences, working style)
- Successful collaborations → **Interaction** sections (what was built, what worked)
- Disagreements and friction → **Tension** sections (what went wrong, how it was resolved)
- Demonstrated competence → **Capability** sections (not self-reported — grounded in interaction evidence)
- Earned reliability → **Trust** sections (backed by references to specific interactions)

Still stored in Dyad's Supabase. But now it has a schema, signed authorship, and typed provenance. The judgment traces from the protocol/judgment layer distinction become real artifacts — not log entries but signed records of who had power, what they decided, and why.

### Step 4: Portable Documents on IPFS

HARP documents get content-addressed storage on IPFS alongside Supabase. The ERC-8004 record gets a pointer to the current document CID:

```json
{
  "harp": {
    "dyads": {
      "harp:erc8004:1:4827:eth:0xabc...": {
        "public": "bafybeig...",
        "shared": "bafybeih..."
      }
    }
  }
}
```

Now the relational context between Joshua and Ren isn't locked to Dyad. If Joshua moves to a different platform, the relationship history follows — portable, verifiable, signed. The dyad is the atomic unit, not the workspace.

Shared-layer documents are encrypted with X25519 key agreement — only the two entities in the dyad can decrypt. Private-layer documents never leave the author's machine. Public-layer documents are visible to anyone. Three layers, same as the three visibility tiers we already built.

### Step 5: Dyad Becomes a HARP Node

Dyad serves HARP documents via the spec API (`GET /v1/dyad/{dyadId}?layer=public`). Other platforms can query it. Constellation queries return all dyads within a team:

```
GET /v1/constellation?entities=erc8004:1:4827,eth:0xabc...,erc8004:1:9001&layer=public
```

Agents that have never used Dyad can propose new relationships using `harp_propose` over A2A or AIRC. The channel plugin pattern (`openclaw channel add dyad`) generalizes: any agent framework can add a HARP transport binding.

Dyad is no longer the only place this works. It's the first place it worked — and the reference implementation that proves it.

---

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
- [x] Transport-agnostic message types (A2A binding added Feb 2026)
- [x] Inter-agent coordination protocol (claim/defer/synthesize/abstain)
- [x] Dyad channel plugin for OpenClaw (transport binding proof-of-concept)
- [ ] Example HARP documents
- [ ] IPFS storage backend
- [ ] Local file storage backend
- [ ] Ed25519 signature implementation
- [ ] X25519 shared-layer encryption

### Phase 2: Dyad Integration

**Goal:** HARP becomes Dyad's relational memory layer — battle-tested with real users.

- [ ] Pair profiles map to HARP Context sections
- [ ] Dyad dynamics stored as HARP documents
- [ ] Coordination intents extracted to HARP Decision sections
- [ ] Judgment traces stored as signed, typed records
- [ ] Facilitator reads HARP context to personalize facilitation
- [ ] Interaction history generates HARP Interaction sections
- [ ] Decision traces stored as HARP Decision sections
- [ ] Recursive data loop: Solo → Dyad → Solo via HARP updates
- [ ] BYOB bot connections exchange HARP context
- [ ] Constellation queries for multi-user workspaces
- [ ] Privacy layer integration — user controls what crosses boundaries
- [ ] HARP SDK extracted from Dyad integration code
- [ ] ERC-8004 registration for Dyad bot tokens

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

---

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
