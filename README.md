<div align="center">

# HARP

**Human-Agent Relational Protocol**

*A relational memory layer for AI-facilitated collaboration.*

Every AI assistant knows about you. None of them know about *us*.

[![CI](https://github.com/squaretaper/harp/actions/workflows/ci.yml/badge.svg)](https://github.com/squaretaper/harp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@dyad/harp)](https://www.npmjs.com/package/@dyad/harp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

</div>

---

## Quick Start

```bash
npm install @dyad/harp
```

```typescript
import { HarpClient, createSection, serializeDocument } from "@dyad/harp";

const client = new HarpClient({
  identity: { entityId: "airc:alice", type: "human" },
  storage: "memory",
});

// Create a dyad between two entities
const { document } = await client.createDyad(
  { id: "airc:alice", type: "human", name: "Alice" },
  { id: "erc8004:1:42", type: "agent", name: "Atlas" },
  "public",
  "Collaboration on documentation projects"
);

// Add relational context
await client.addSectionToDyad(
  document.frontmatter.dyad,
  "public",
  createSection("Trust", "Reliable code review", "Atlas consistently provides thorough, actionable reviews.")
);

// Derive a trust score
const score = await client.getTrustScore(document.frontmatter.dyad);
console.log(`Trust score: ${score?.score}`); // 0 → 1

// Serialize to portable markdown
const md = serializeDocument((await client.getDyad(document.frontmatter.dyad, "public"))!);
```

See [`examples/`](examples/) for runnable scripts.

---

## What is HARP?

The agent economy is assembling a full stack — identity (ERC-8004), coordination (A2A, AIRC), payments (x402), tools (MCP) — but when Agent A hands work to Agent B, nothing about their *relationship* travels with the handoff.

**HARP fills that gap.** It is a persistence and query layer for **relational context** between identified entities, human or agent. Where identity protocols answer *who*, communication protocols answer *how*, and payment protocols answer *how much*, HARP answers **why** — why these entities work together, what they've learned about each other, and what history they share.

A HARP document is not a score. It is a **shared memory**: a bilateral, append-only, privacy-layered record of how entities relate. Human-readable. Machine-parseable. Portable across platforms.

**A credit score is not the same as knowing someone.**

## Core Concepts

### Dyad — The Atomic Unit

The **dyad** — the relationship between two entities — is HARP's irreducible primitive. Like TCP handles point-to-point connections but builds the internet, HARP handles dyadic memory but builds the collaborative intelligence layer.

| Participants | Dyadic Relationships |
|:---:|:---:|
| 2 | 1 |
| 5 | 10 |
| 10 | 45 |
| 100 | 4,950 |

**Formula: n(n-1)/2.** A ten-person team has forty-five dyadic relationships, each with its own trust trajectory and decision history.

### Constellation — Emergent Structure

A **constellation** is a graph of related dyads involving three or more entities. Constellations emerge from the dyad graph — the protocol operates on dyads; applications query the constellation.

### Privacy Layers

| Layer | Visibility | Content |
|---|---|---|
| **Public** | Anyone | Endorsements, demonstrated capabilities |
| **Shared** | Both entities only | Working agreements, honest assessments, tension logs |
| **Private** | Author only | Personal notes, internal assessments |

Bilateral encryption (X25519 + XChaCha20-Poly1305) ensures relational context between A and B is never visible to C.

### Section Types

HARP documents use typed sections to structure relational context:

| Type | Purpose | Example |
|---|---|---|
| `Interaction` | Record of a collaborative event | Code review session |
| `Trust` | Evidence-backed trust signal | "Delivered 5/5 on deadline" |
| `Context` | Communication preferences, working style | "Prefers async" |
| `Decision` | Jointly agreed outcomes | "Use TypeScript for all modules" |
| `Capability` | Demonstrated skills | "Expert in distributed systems" |
| `Tension` | Disagreements (resolved or ongoing) | "Scope creep on dashboard" |
| `Note` | Freeform observations | Internal reflection |

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

### Transport-Agnostic

HARP defines document formats and abstract message types independent of any transport. Both [AIRC](https://airc.chat) and [A2A](https://a2aproject.org) serve as transport bindings, but any protocol that can deliver signed, structured messages between identified entities works.

### Identity Resolution

| Type | Format | Example |
|---|---|---|
| ERC-8004 Agent | `erc8004:<chainId>:<agentId>` | `erc8004:1:4827` |
| Ethereum Address | `eth:<address>` | `eth:0xabc...def` |
| AIRC Handle | `airc:<handle>` | `airc:alice@example.ai` |
| A2A Agent Card | `a2a:<url>` | `a2a:https://agent.example.com/.well-known/agent.json` |

## Document Format

HARP documents are structured markdown with YAML frontmatter (`.harp.md`) — valid markdown that is also machine-parseable:

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

See [SPEC.md](SPEC.md) for the complete document format and protocol operations.

## Standards Alignment

| Standard | Role in HARP |
|---|---|
| [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) | Onchain agent identity |
| [AIRC](https://airc.chat) | Agent communication transport |
| [A2A](https://a2aproject.org) | Task delegation transport |
| [x402](https://www.x402.org) | HTTP-native payments |
| [MCP](https://modelcontextprotocol.io) | Tool access layer |

## Security

HARP operates under a **zero-trust model**. Every operation is independently authenticated via Ed25519 signatures. Key properties:

- **Authorship authenticity** — cryptographic signatures on every document
- **Document integrity** — SHA-256 checksums + IPFS content addressing
- **Epoch chain integrity** — tamper-evident history via hash chains
- **Shared-layer confidentiality** — X25519 key agreement + XChaCha20-Poly1305 AEAD
- **Consent-gated relationships** — no dyad without mutual opt-in
- **Prompt injection defense** — content provenance tagging

See [SECURITY.md](SECURITY.md) for the complete threat model.

## Project Structure

```
├── src/
│   ├── index.ts          # Public API exports
│   ├── harp.ts           # Core client library
│   ├── types.ts          # Type definitions
│   └── adapters/         # Platform adapters (AIRC, MoltX)
├── tests/                # Vitest test suite
├── examples/             # Runnable examples
│   ├── quickstart.ts     # Getting started
│   ├── human-agent.harp.md
│   ├── agent-agent.harp.md
│   └── new-dyad.harp.md
├── SPEC.md               # Full protocol specification
├── DESIGN.md             # Architecture decisions
├── SECURITY.md           # Security model
├── RESEARCH.md           # Landscape analysis
└── ROADMAP.md            # Implementation roadmap
```

## Documentation

- 📋 [Specification](SPEC.md) — Full protocol spec
- 🏗️ [Design Decisions](DESIGN.md) — Architecture and rationale
- 🔒 [Security Model](SECURITY.md) — Threat model and cryptographic design
- 📚 [Research](RESEARCH.md) — Landscape analysis and academic foundations
- 🗺️ [Roadmap](ROADMAP.md) — Implementation phases

## Relationship to Dyad

HARP is the protocol layer. [Dyad](https://github.com/squaretaper/dyadai) is the first product built on it.

Dyad provides the coordination workspace where human-AI pairs collaborate. HARP captures the relational context that makes each collaboration better than the last — and makes that context portable across platforms.

## Roadmap

| Phase | Focus | Status |
|:---:|---|---|
| **1** | Specification + reference implementation | ✅ Complete |
| **2** | Dyad integration — HARP as relational memory layer | In progress |
| **3** | Open protocol — SDKs, adapters, developer ecosystem | Planned |

See [ROADMAP.md](ROADMAP.md) for detailed phases.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing, and PR guidelines.

## Links

- 🌐 [withdyad.com](https://withdyad.com) — Dyad product
- 📦 [squaretaper/dyadai](https://github.com/squaretaper/dyadai) — Dyad source
- 📋 [AIRC Protocol](https://airc.chat) — Transport layer
- 🔗 [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) — Agent identity standard
- 💸 [x402](https://www.x402.org) — HTTP-native payments

## License

[MIT](LICENSE) © Squaretaper
