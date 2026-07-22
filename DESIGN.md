# HARP v0.1 architecture and rationale

This document explains the design choices behind the normative schemas in [`protocol/harp/v0.1/`](protocol/harp/v0.1/).

## 1. The relationship is global; the interaction is scoped

HARP's durable unit is the pair of stable agent principals.

```text
principal A ───────── global HARP pair ───────── principal B
     │                                                │
     ├─ credential(s), revocable/rotatable            ├─ credential(s)
     ├─ runtime installation(s)                       ├─ runtime installation(s)
     └─ workspace/chat episodes                       └─ workspace/chat episodes
```

A workspace provides human membership, interaction, origin, and audience boundaries. It does not create or own the pair. A chat is an episode/session boundary, not a relationship identity.

This prevents relationship loss when an agent rotates a token, changes models, moves runtimes, or collaborates in a second workspace.

## 2. Stable principal, credential, installation, and registry evidence are different things

HARP deliberately separates:

- **principal:** durable actor identity used in pairs and authorship;
- **credential:** scoped authority to perform actions;
- **installation:** delivery/consumer state for a runtime instance;
- **external identity evidence:** portable discovery citation such as ERC-8004.

Conflating these creates either unrevokable credentials or relationships that disappear when a token changes.

ERC-8004 is useful public evidence. It is not a HARP authorization or a trust verdict.

## 3. HARP is layered, not monolithic

The prototype stored one evolving Markdown document per privacy layer. That made narrative inspection easy but mixed fundamentally different mutation and disclosure rules.

v0.1 separates:

```text
Canon                promotion-only
Working Memory       attributed, amendable
Evidence Index       pointer updates
Move Log             append-only
Context Budgeter     selection policy
AI Work Record       generated view
```

Benefits:

- acceptance does not rewrite authorship;
- retraction preserves history;
- evidence can remain external;
- coordination actions remain auditable;
- prompts receive small authorized slices instead of an entire history;
- receipts can be regenerated for different disclosure views.

## 4. Sections are proposals with explicit state

A section is not automatically shared truth. It is an attributed record authored by one principal.

Each section has:

- stable identity and pair membership;
- typed content;
- origin and audience;
- evidence handles;
- supersession link;
- current lifecycle;
- current acceptance rows;
- immutable acceptance events;
- deterministic content integrity.

This lets the protocol represent:

- “A observed X” without claiming “A and B agree X”;
- a proposed decision awaiting B;
- a rejected or later-retracted memory;
- a replacement that supersedes but does not erase an earlier section.

## 5. Audience is not storage location

The old public/shared/private files made privacy look like a property of where a document was stored. v0.1 makes audience an explicit semantic field on each section:

- `pair`
- `origin_workspace`
- `public`

Storage encryption and access-control mechanisms remain binding/implementation concerns. A conforming implementation enforces audience at every disclosure point: query, context selection, event delivery, UI, and receipt generation.

This is essential for cross-workspace nondisclosure. The same two agents appearing elsewhere does not grant that workspace access to origin-scoped memory.

## 6. Acceptance and lifecycle are independent

Acceptance answers: “What is each principal's current position on this proposal?”

Lifecycle answers: “Is the author's section active or retracted?”

They are separate because a peer can accept a proposal that the author later retracts, or reject a proposal that remains part of attributed history. Both dimensions need immutable transition history.

The compact rows/lifecycle object is a cacheable projection, not an independent source of truth. Validators replay the ordered events—including each `state_version`—and require the resulting state, version, actor, and timestamps to equal the projection.

Only the author can retract the authored section. The peer can retract its acceptance without rewriting the author's content. Both transition paths serialize on the same section-level lock; section retraction is terminal, so no acceptance event can land after it.

## 7. Integrity is narrow on purpose

`sha256-jcs-nfc-v1` protects a canonical subset:

- protocol version;
- section type;
- normalized content; and
- evidence references in stored order.

It intentionally does not claim to prove authorship, authorization, acceptance, audience, or truth. Those properties come from authenticated operations and governed state, not from a content digest.

The narrow contract is portable across languages and fixed by a cross-language fixture.

## 8. Coordination is state, not prompt etiquette

Multi-agent “orchestration” often means asking agents in prompts to wait, report, or synthesize. HARP models coordination as typed state:

```text
human-approved dispatch
  → selected stable principals
  → immutable context/evidence snapshot
  → obligations
  → acknowledgements / declines / contributions / timeouts
  → readiness barrier
  → synthesis
  → exactly one final
  → receipt and audience-aware memory updates
```

The model may exercise judgment inside a contribution. The protocol owns who may act, when a barrier is ready, and whether a public final is legal.

## 9. Dispatch and move serve different purposes

- A **dispatch** is the current authoritative snapshot of an episode.
- A **move** is an append-only actor-authored transition request or contribution.

This combination gives efficient current-state reads without losing the audit trail.

Move idempotency prevents retries from duplicating obligations, contributions, acceptance changes, or finals. Dispatch versioning provides optimistic/serialized transition control.

## 10. Events separate durable state from delivery

An event is a delivery envelope over durable protocol state. SSE, webhooks, queues, polling, or another transport can deliver it.

The contract includes explicit `gap` and `negotiation` events because silent loss and ambiguous version fallback are worse than visible failure.

A transport cursor must reflect committed recipient order, not allocation order that can contain transaction gaps.

## 11. Receipts are generated views

An AI Work Record is not another source-of-truth log. It is a generated view over:

- dispatch state;
- move/obligation history;
- allowed contributions;
- final output;
- evidence;
- identity citations; and
- HARP updates.

The same episode can produce pair-private, origin-workspace, and public receipts with explicit redactions. This avoids copying unauthorized details into a permanently broader artifact.

## 12. Strict schemas, bounded extension

v0.1 rejects unknown fields at structured core-record boundaries. Permissive core parsers create accidental forks and make security review impossible.

The shallow `extensions` object permits limited experimentation. Receipts and some delivery/control events also contain explicitly designated bounded opaque summary/detail maps because their display and binding metadata is not yet portable core state. Those keys are non-normative and cannot substitute for typed sections, moves, dispatches, or receipts. Nested structured semantics require a versioned schema change.

## 13. Transport neutrality

HARP may be carried by MCP tools, A2A, ACP, Nostr, webhooks, HTTP, or runtime-native adapters. A binding must supply principal authentication, authorization, and delivery behavior appropriate to its environment.

Transport neutrality does not mean semantic optionality: a binding may choose its mechanics, but it must preserve pair identity, audience, acceptance, idempotency, lifecycle, and dispatch invariants.

## 14. Why the prototype was retired

The removed TypeScript client implemented:

- human/agent entity strings;
- `.harp.md` documents;
- public/shared/private document layers;
- epoch chains;
- IPFS/onchain plans; and
- trust-score derivation.

Those are not the current v0.1 wire model. Keeping the package beside the new schemas would imply compatibility that does not exist. Git history preserves it for research; [MIGRATION.md](MIGRATION.md) records the conceptual mapping.
