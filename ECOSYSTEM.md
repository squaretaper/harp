# HARP ecosystem boundaries

HARP is designed to compose with identity, transport, tool, and workspace protocols without absorbing their responsibilities.

This document is informative, not normative.

## Where HARP sits

```text
Human approval / policy surfaces
              │
Agent runtimes and frameworks
              │
HARP: bilateral memory + governed collaboration
              │
Transport / tool / delivery bindings
              │
Identity and discovery evidence
```

HARP adds durable pair state, attributed acceptance-aware memory, coordination moves, dispatch invariants, and receipts. It does not replace the layers around it.

## Adjacent systems

| System/category | What it supplies | HARP boundary |
|---|---|---|
| **MCP** | Tool/resource invocation | HARP documents and operations can be exposed through MCP tools/resources; MCP does not define the relationship |
| **A2A / ACP / runtime protocols** | Agent messaging, tasks, lifecycle | Can transport HARP events/moves; HARP preserves pair, audience, and acceptance semantics |
| **Nostr / Buzz** | Portable keys, signed events, relay/workspace transport | Can serve as identity evidence and transport/evidence binding; relay/community state is not the HARP pair |
| **ERC-8004** | Public identity/discovery and reputation/validation registries | Citation and discovery evidence only; not HARP authorization or a trust verdict |
| **DIDs / verifiable credentials** | External identity and claims | May bind to principals through a versioned profile; claims remain evidence |
| **Databases / event stores** | Durable implementation state | Must enforce HARP semantics but are not part of the wire contract |
| **Dyad** | Human-facing workspace and reference implementation | Workspaces host interactions and provide origin/audience; relationships remain global |
| **Hermes and other BOBA runtimes** | Agent execution and native delivery | Runtime installations act for stable principals through scoped authority |

## Transport binding requirements

A binding can use HTTP, MCP, SSE, webhooks, queues, Nostr, A2A, or another mechanism. To claim HARP v0.1 compatibility it must preserve:

- stable principal authentication;
- pair membership;
- audience and origin;
- acceptance/lifecycle history;
- idempotent move behavior;
- dispatch version and finalization invariants;
- explicit version negotiation; and
- visible delivery gaps where durable ordered delivery is claimed.

A signed transport event is not automatically a valid HARP document. It still needs schema and semantic validation.

## Identity bindings

The core schemas use implementation-issued UUID principal IDs. A binding may associate a principal with one or more external identifiers.

A safe binding records:

- external registry/method;
- external identifier;
- resolution evidence and timestamp;
- custody/verification status;
- binding lifecycle and revocation; and
- which actions, if any, the binding authorizes.

Discovery and authorization should remain separate. “This is agent 42” does not imply “agent 42 may read pair memory” or “agent 42 is trustworthy.”

## Workspace products

Chat and workspace products are natural HARP surfaces, but HARP should not become another chat protocol.

A workspace integration should:

- create dispatches from approved human input;
- provide immutable context/evidence snapshots;
- display selected principals, mode, obligations, barrier, and final state;
- enforce workspace-origin disclosure;
- expose memory proposal/accept/reject/retract controls; and
- export disclosure-aware receipts.

The relationship must remain usable from another HARP-capable surface without copying workspace-private content.

## Reputation systems

HARP records attributed relational evidence; it does not standardize a global trust score.

Applications may derive reputation, but they should:

- preserve source attribution;
- distinguish bilateral acceptance from unilateral claims;
- disclose algorithm and observation window;
- account for Sybil/collusion risk;
- avoid treating missing history as negative evidence; and
- never write a derived score back as if it were shared HARP canon.

## Storage and encryption profiles

The core protocol is storage-neutral. A profile may add relational databases, append-only logs, content-addressed objects, encrypted pair stores, or public registries.

Such a profile must document access control, key lifecycle, metadata leakage, canonical signed/encrypted bytes, retention, and recovery. It must not imply that an audience field alone supplies confidentiality.

## BOBA compatibility

HARP is framework-agnostic. The intended adoption path is through thin bindings that translate runtime-native identity, delivery, and tool calls into the same normative documents and state transitions.

Interoperability is demonstrated when two independent runtimes validate the same fixtures, compute the same section hash, preserve audience, and complete a governed dispatch without private implementation knowledge.
