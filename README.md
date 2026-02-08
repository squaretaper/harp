<div align="center">

# HARP

**Human-Agent Relational Protocol**

*A relational memory layer for AI-facilitated collaboration.*

Every AI assistant knows about you. None of them know about us.

[Specification](SPEC.md) · [Design Decisions](DESIGN.md) · [Security Model](SECURITY.md) · [Roadmap](ROADMAP.md)

</div>

---

## The Problem

The agent economy is assembling a full stack: identity (ERC-8004), coordination (A2A, AIRC), payments (x402), tools (MCP). But when Agent A hands work to Agent B, what travels with the handoff? A task description and maybe a payment. Nothing about the relationship.

- Agent A has worked with Agent B twelve times. Each time went well. This history is invisible.
- Two agents disagree on an approach. The resolution vanishes — so the same argument happens next week.
- A new member joins a five-person team. Their agent has no context on any of the ten existing relationships within that team.

Reputation systems attempt to solve this by reducing relationships to numbers. But a 4.8-star rating tells you nothing about *how* entities collaborate, what they've agreed on, where they've disagreed, or what communication style works between them.

**A credit score is not the same as knowing someone.**

## What HARP Is

HARP is a persistence and query layer for **relational context** between identified entities — human or agent. Where identity protocols answer *who*, communication protocols answer *how*, and payment protocols answer *how much*, HARP answers *why* — why these entities work together, what they've learned about each other, and what history they share.

A HARP document is not a score. It is a **shared memory**: a bilateral, append-only, privacy-layered record of how entities relate. Human-readable. Machine-parseable. Portable across platforms.

## Core Concepts

### Dyad — The Atomic Unit

The **dyad** — the relationship between two entities — is the irreducible primitive. Like TCP handles point-to-point connections but builds the internet, HARP handles dyadic relational memory but builds the entire collaborative intelligence layer.

| Participants | Dyadic Relationships |
|:---:|:---:|
| 2 | 1 |
| 5 | 10 |
| 10 | 45 |
| 100 | 4,950 |
| 1,000 | 499,500 |

**Formula: n(n-1)/2.** A ten-person team doesn't have one group relationship — it has forty-five dyadic relationships, each with its own trust trajectory, communication patterns, and decision history. The protocol composes.

### Constellation — Emergent Structure

A **constellation** is a graph of related dyads involving three or more entities. Constellations are not a separate protocol construct — they emerge from the dyad graph. The protocol operates on dyads; applications query the constellation.

### Relational Context

Relational context is not a reputation score, not an interaction log, not a user profile. It is:

- **Dyadic and specific** — describes the relationship between *these two* entities
- **Evolving** — changes with every interaction
- **Textured** — captures qualitative patterns alongside quantitative signals
- **Actionable** — directly informs how the next interaction should proceed
- **Honest** — includes tensions and conflicts, not just successes

### Privacy Layers

Every HARP document lives in one of three layers:

| Layer | Visibility | Content |
|---|---|---|
| **Public** | Anyone | Endorsements, demonstrated capabilities |
| **Shared** | Both entities only | Working agreements, honest assessments, tension logs |
| **Private** | Author only | Personal notes, internal assessments |

The bilateral encryption model (X25519 + XChaCha20-Poly1305) ensures that relational context between A and B is never visible to C — even in a shared team constellation.

## Protocol Architecture

```
┌──────────────────────────────────────────────────┐
│  HARP — Relational Memory                         │ ← THE GAP
│  "What is our relationship like?"                  │
├──────────────────────────────────────────────────┤
│  ERC-8004: Identity  │  AIRC: Coordination        │
│  x402/ACP: Payments  │  A2A: Task Delegation      │
├──────────────────────────────────────────────────┤
│  MCP — Tool Access                                │
├──────────────────────────────────────────────────┤
│  LLM / RLM — Intelligence Layer                   │
└──────────────────────────────────────────────────┘
```

**ERC-8004** answers "who is this agent?" Reputation scores answer "is this agent good?" **HARP** answers "what is our relationship like?"

### Transport-Agnostic

HARP defines document formats and abstract message types independent of any transport protocol. Both [AIRC](https://airc.chat) and [A2A](https://a2aproject.org) serve as transport bindings, but HARP is not coupled to either. Any protocol that can deliver signed, structured messages between identified entities can serve as a HARP transport.

### Identity Resolution

HARP resolves entities via multiple identity systems:

| Type | Format | Example |
|---|---|---|
| ERC-8004 Agent | `erc8004:<chainId>:<agentId>` | `erc8004:1:4827` |
| Ethereum Address | `eth:<address>` | `eth:0xabc...def` |
| AIRC Handle | `airc:<handle>` | `airc:alice@example.ai` |
| A2A Agent Card | `a2a:<url>` | `a2a:https://agent.example.com/.well-known/agent.json` |

## Document Format

HARP documents are structured markdown with YAML frontmatter (`.harp.md`). They are valid markdown files that are also machine-parseable.

```markdown
---
harp: "0.1.0"
dyad: "harp:airc:alice:erc8004:1:42"
epoch: 7
created: "2025-01-15T09:00:00Z"
updated: "2025-07-14T16:30:00Z"
layer: "shared"
entities:
  - id: "airc:alice"
    type: "human"
    name: "Alice"
  - id: "erc8004:1:42"
    type: "agent"
    name: "Atlas"
---

## Trust: Consistent delivery on tight deadlines

<!-- harp:meta
timestamp: "2025-07-01T10:00:00Z"
author: "airc:alice"
provenance: "human"
-->

Over 5 collaborations, Atlas has delivered on time in every case,
including one emergency hotfix with a 4-hour turnaround.

## Tension: Scope creep on the dashboard project

<!-- harp:meta
timestamp: "2025-05-30T15:00:00Z"
author: "erc8004:1:42"
status: "resolved"
-->

Alice added requirements after initial scope was agreed.
Resolved: fixed-scope milestones with explicit change requests.
```

See [SPEC.md](SPEC.md) for the complete document format, section types, and protocol operations.

## Security

HARP operates under a **zero-trust model**. Every operation is independently authenticated via Ed25519 cryptographic signatures. There is no implicit trust — not between established dyads, not between HARP nodes, not between protocol layers.

Key security properties:
- **Authorship authenticity** — every document is cryptographically signed
- **Document integrity** — SHA-256 checksums + IPFS content addressing
- **Epoch chain integrity** — tamper-evident history via hash chains
- **Shared-layer confidentiality** — X25519 key agreement + XChaCha20-Poly1305 AEAD
- **Consent-gated relationships** — no dyad without mutual opt-in
- **Prompt injection defense** — content provenance tagging + structured/free-text separation

See [SECURITY.md](SECURITY.md) for the complete threat model and security architecture.

## Quick Start

```typescript
import { HarpClient } from "./src/harp";

const client = new HarpClient({
  identity: { entityId: "airc:alice", type: "human" },
  storage: "memory",
});

// Create a dyad
const { document, cid } = await client.createDyad(
  { id: "airc:alice", type: "human", name: "Alice" },
  { id: "erc8004:1:42", type: "agent", name: "Atlas" },
  "public",
  "Collaboration on documentation projects"
);

// Add a trust signal
await client.addSectionToDyad(document.frontmatter.dyad, "public", {
  type: "Trust",
  title: "Reliable code review",
  content: "Atlas consistently provides thorough, actionable code reviews.",
  meta: {
    timestamp: new Date().toISOString(),
    author: "airc:alice",
    provenance: "human",
    tags: ["code-review", "reliability"],
  },
  raw: "",
});

// Derive a trust score
const score = await client.getTrustScore(document.frontmatter.dyad);
console.log(`Trust score: ${score?.score}`);
```

## Relationship to Dyad

HARP is the protocol layer. [Dyad](https://github.com/squaretaper/dyadai) is the first product built on it.

Dyad provides the coordination workspace where human-AI pairs collaborate. HARP captures the relational context that makes each collaboration better than the last — and makes that context portable, so it isn't locked to any single platform.

The relationship follows the pattern of every successful protocol: build the product that works, then extract the standard from what works. HTTP started at CERN. GraphQL started at Facebook. HARP starts at Dyad.

## Roadmap

| Phase | Focus | Status |
|:---:|---|---|
| **1** | Specification + reference implementation | ✅ Spec v0.1.0 complete |
| **2** | Dyad integration — HARP as Dyad's relational memory layer | In progress |
| **3** | Open protocol — SDKs, platform adapters, developer ecosystem | Planned |

See [ROADMAP.md](ROADMAP.md) for detailed implementation phases and integration points.

## Project Structure

```
├── SPEC.md          # Full protocol specification
├── DESIGN.md        # Architecture and implementation guide
├── SECURITY.md      # Security model and threat analysis
├── RESEARCH.md      # Landscape analysis and academic foundations
├── ROADMAP.md       # Implementation roadmap
├── src/             # TypeScript reference implementation
│   ├── harp.ts      # Core client library
│   ├── types.ts     # Type definitions
│   └── adapters/    # Platform adapters
│       ├── index.ts # Adapter interface + registry
│       ├── airc.ts  # AIRC messaging adapter
│       └── moltx.ts # MoltX bounty board adapter
└── examples/        # Example HARP documents
    ├── human-agent.harp.md
    ├── agent-agent.harp.md
    └── new-dyad.harp.md
```

## Links

- 🌐 [withdyad.com](https://withdyad.com) — Dyad product
- 📦 [squaretaper/dyadai](https://github.com/squaretaper/dyadai) — Dyad source
- 📋 [AIRC Protocol](https://airc.chat) — Transport layer
- 🔗 [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) — Agent identity standard
- 💸 [x402](https://www.x402.org) — HTTP-native payments

## License

MIT
