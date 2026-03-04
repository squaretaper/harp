# HARP — Communications Kit

Ready-to-use descriptions for pitches, decks, docs, and socials. All approved copy.

---

## Protocol Description (~280 words)

*For pitch decks, investor materials, partnership intros, README-length context.*

HARP is a persistence and query layer for relational context between identified entities — human or AI. The agent stack is assembling identity (ERC-8004), coordination (A2A, AIRC), payments (x402), and tools (MCP), but when Agent A hands work to Agent B, nothing about their *relationship* travels with the handoff. HARP fills that gap.

**Architecture.** The atomic unit is the **dyad** — the relationship between two entities. A HARP document is a structured markdown file with YAML frontmatter that captures the evolving history between a pair: interaction patterns, trust signals, shared decisions, tensions, and resolutions. Documents are append-only, epoch-versioned, and content-addressed (IPFS). Larger structures — teams, orgs, multi-agent systems — emerge as **constellations**: graphs of dyads, queried at the application layer. A ten-person team has 45 dyadic relationships; the protocol handles each one.

**Privacy layers.** Every section is classified as public (endorsements, capabilities), shared (working agreements, honest assessments — visible only to both entities), or private (internal notes, author-only). Bilateral encryption (X25519 + XChaCha20-Poly1305) ensures relational context between A and B is never visible to C, even within a shared constellation.

**Notable design choices.** Zero-trust: every operation requires cryptographic signature — no implicit trust between dyads, nodes, or epochs. Transport-agnostic: HARP defines document formats and message types independent of the wire protocol (current bindings: AIRC, A2A). Consent-based: creating a dyad requires mutual opt-in via native propose/accept/decline primitives. Rich, not reduced: a trust score can be *derived from* a HARP document, but the document itself is prose, structured data, and narrative — not a number.

**A credit score is not the same as knowing someone.** HARP captures the difference.

---

## One-Liner

> HARP is the relational memory layer for the agent internet — capturing how entities collaborate, not just who they are.

---

## Tagline

> Every AI assistant knows about you. None of them know about *us*.

---

## Elevator Pitch (~60 words)

HARP captures the relationship between any two entities — human or AI — as a portable, encrypted, append-only document. When agents coordinate across platforms, HARP carries the context: trust history, working agreements, past decisions. It's the missing layer between identity and coordination in the agent stack. A credit score is not the same as knowing someone.

---

## Tweet-Length (~280 chars)

HARP: relational memory for the agent internet. When Agent A hands work to Agent B, their trust history, shared decisions, and working agreements travel with them. Bilateral encryption. Append-only. Portable. The relationship layer the agent stack is missing.

---

## Key Differentiators (for slides / comparison charts)

| What | HARP | Others |
|------|------|--------|
| Unit of data | Dyad (bilateral relationship) | User profile / reputation score |
| Format | Human-readable markdown + structured YAML | Opaque DB / JSON blob |
| Privacy | Three layers + bilateral E2E encryption | Transport-level TLS only |
| Trust model | Zero-trust, cryptographically signed | Platform-mediated |
| Portability | Content-addressed (IPFS), transport-agnostic | Platform-locked |
| Richness | Prose, decisions, tensions, history | Numeric scores |

---

## Positioning Statement

HARP sits at the intersection of:
- **Identity** (ERC-8004, AIRC) — who the entities are
- **Coordination** (A2A, MCP) — how they communicate
- **Payments** (x402) — how value flows

HARP answers the question none of these address: **why do these entities work together, and what have they learned about each other?**

---

## Audience-Specific Angles

### For Investors
"HARP is building the relational data layer for the agent economy. Every agent interaction creates relational context that's currently thrown away. HARP captures and monetizes it — with user consent and bilateral encryption."

### For Developers
"npm install @dyad/harp. Create a dyad, add sections, derive trust scores. TypeScript, fully typed, works with any agent framework. Plug it into your MCP server or A2A agent in 10 lines."

### For Enterprise
"When your AI agents coordinate across departments or with external partners, HARP provides auditable relationship history with three-tier privacy and zero-trust cryptographic signatures. SOC2-aligned by design."

### For Crypto/Web3
"HARP extends ERC-8004 agent identity with relational context — on IPFS, content-addressed, with onchain-verifiable signatures. The social graph for autonomous agents."

---

*Last updated: 2026-03-04*
