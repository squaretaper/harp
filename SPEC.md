# HARP protocol specification

- **Version:** `0.1` draft
- **Normative artifacts:** [`protocol/harp/v0.1/`](protocol/harp/v0.1/)
- **License:** [MIT](LICENSE)

## 1. Scope

HARP defines a transport-neutral contract for:

1. bilateral working memory between stable agent principals;
2. governed multi-agent coordination episodes;
3. durable delivery/control events; and
4. disclosure-aware AI Work Records.

HARP does not prescribe a model, runtime, UI, database, blockchain, message broker, or storage backend.

The JSON Schemas and fixtures in `protocol/harp/v0.1/` are normative. This document explains their semantics. If prose and a schema disagree, the schema governs the wire shape and the discrepancy is a specification bug.

## 2. Conformance language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, and **MAY** are to be interpreted as described in RFC 2119 and RFC 8174.

A document is v0.1 conformant only when it:

- validates against the corresponding JSON Schema;
- passes the semantic rules in this specification;
- contains exactly `protocol_version: "0.1"`;
- is no larger than 1 MiB when UTF-8 encoded; and
- uses only the bounded `extensions` surface or the explicitly designated opaque summary/detail maps for non-core fields.

## 3. Identity and authority

### 3.1 Stable principals

A HARP relationship is globally unique between two stable agent principals. A principal is not a credential, runtime installation, model session, workspace membership, or external registry record.

In v0.1, principal IDs on the wire are lowercase canonical UUID strings. Implementations MAY bind a principal to external identity evidence, but those bindings do not change the pair ID.

### 3.2 Credentials and installations

Credentials authorize actions and MUST be revocable and rotatable independently from the principal. Installations identify runtime delivery state and MUST NOT become the durable relationship identity.

### 3.3 Human authority

Humans participate through verified approval surfaces and scoped grants. A human approval authorizes an action; it does not convert a human into an agent principal or make an external registry entry a trust verdict.

### 3.4 ERC-8004

ERC-8004 MAY supply portable public identity and discovery evidence. Registration, advertised capability, reputation, or validation data MUST NOT be treated as HARP authorization by itself.

## 4. Protocol layers

| Layer | Mutation model | Semantics |
|---|---|---|
| Canon | promotion-only | Durable, bilaterally accepted decisions and protocol facts |
| Working Memory | attributed and amendable | Proposals, observations, capabilities, tensions, commitments, and repairs |
| Evidence Index | pointer updates | Handles to externally stored evidence |
| Move Log | append-only | Authenticated coordination and memory-transition actions |
| Context Budgeter | policy | Authorized, relevant retrieval under a bounded context budget |
| AI Work Record | generated | Receipt over one governed episode and disclosure view |

A conforming implementation MUST keep attributed observations distinct from bilateral canon. It MUST NOT represent an unaccepted assertion as shared agreement.

## 5. Section document

A [`section`](protocol/harp/v0.1/schema/section.schema.json) is the unit of bilateral working memory.

### 5.1 Required semantics

- Every UUID field MUST use the lowercase 8-4-4-4-12 hexadecimal representation accepted by its schema.
- Every `date-time` field MUST use the schema's leap-second-free RFC 3339 profile with an explicit `Z` or numeric UTC offset. Ordering and equality MUST retain all supplied fractional digits (up to nine); implementations MUST NOT compare through a lossy millisecond or microsecond representation.
- `pair_principal_ids` MUST contain exactly two distinct principal UUIDs in lexical order.
- `author_principal_id` MUST be one of the pair principals.
- `section_type` is one of `interaction`, `capability`, `context`, `tension`, `decision`, or `note`.
- `tags` and `evidence_refs` preserve stored order.
- `supersedes_section_id` links a replacement proposal without deleting history.
- `origin_kind` is `chat`, `workspace`, `direct`, `external`, or `system`.
- `audience_scope` is `pair`, `origin_workspace`, or `public`.
- lifecycle state is `active` or `retracted`.
- acceptance contains the current two-row snapshot plus immutable transition events.

There is no core `trust` section type in v0.1. Trust or reputation may be derived by an application from attributed, evidence-backed records, but HARP does not standardize a trust score.

### 5.2 Origin rules

- `chat` requires both `origin_workspace_id` and `origin_chat_id`.
- `workspace` requires `origin_workspace_id` and requires a null chat ID.
- `direct`, `external`, and `system` require null workspace and chat IDs.
- `origin_workspace` audience requires a non-null origin workspace.

### 5.3 Audience rules

- `pair`: usable by the pair across workspaces and privately inspectable by the pair/current owners.
- `origin_workspace`: usable or displayable only in its origin workspace, plus private inspection by the pair/current owners.
- `public`: eligible for a public disclosure view, subject to implementation policy and lifecycle/acceptance classification.

The presence of both principals in a different workspace MUST NOT grant that workspace access to `origin_workspace` content.

### 5.4 Acceptance

The acceptance snapshot MUST contain exactly one row for each pair principal. The history MUST start with one author-authored `proposed` event at `state_version: 1`. That event initializes the author as `accepted` and the peer as `pending`.

Each later acceptance event records the actor's prior state, next state, and incremented `state_version`. Replaying those events MUST produce the exact row state, version, and `updated_at` values in the snapshot. `acceptance.as_of` MUST be at or after the section, row, and event timestamps.

The author implicitly accepts the section it proposes and cannot separately mutate that acceptance row. The peer independently moves from `pending` to `accepted` or `rejected`; an accepted peer may later move to `retracted`. Authors withdraw content through lifecycle `section_retracted`, not acceptance retraction. Acceptance history is append-only.

`section_retracted` is carried in the same ordered history but changes lifecycle rather than a principal acceptance row. It MUST be author-authored, transition `active` to `retracted`, increment lifecycle version, and be the final event for that section. Replaying lifecycle events MUST produce the exact lifecycle state, version, author, and retraction time.

A `decision` is bilateral canon only when both replay-proven current rows are `accepted` and the section is active. Other section types remain attributed records even when accepted unless an implementation's promotion policy explicitly classifies them as canon.

### 5.5 Retraction

Only the author may retract its section. Retraction MUST preserve the original section and transition history. A retracted section MUST name its author as `retracted_by_principal_id`.

## 6. Section content integrity

`sha256-jcs-nfc-v1` hashes exactly this logical object:

```json
{
  "content": "<normalized content>",
  "evidence_refs": ["<stored order>"],
  "protocol_version": "0.1",
  "section_type": "interaction"
}
```

The algorithm is:

1. Convert CRLF and bare CR in `content` to LF.
2. Normalize `content` to Unicode NFC.
3. Do not trim leading or trailing whitespace.
4. Preserve `evidence_refs` order.
5. Serialize the object with RFC 8785 JSON Canonicalization Scheme.
6. UTF-8 encode the canonical JSON.
7. SHA-256 hash the bytes.
8. Prefix the lowercase hex digest with `sha256-jcs-nfc-v1:`.

The hash proves content integrity only. It does not prove authorship, audience, authorization, truth, acceptance, or lifecycle state.

The fixture [`hash-nfc-crlf.json`](protocol/harp/v0.1/fixtures/hash-nfc-crlf.json) is the cross-language test vector.

## 7. Move document

A [`move`](protocol/harp/v0.1/schema/move.schema.json) is a principal-authored, typed, idempotent coordination or memory-transition action.

Every move carries:

- a UUID `move_id`;
- an `idempotency_key`;
- an optional `dispatch_id`;
- `actor_principal_id`;
- an occurrence timestamp;
- a discriminated `kind` and bounded `payload`;
- evidence references; and
- optional bounded extensions.

The v0.1 schema currently defines these move kinds:

```text
CLAIM_LEAD
DEFER
REQUEST_CONTRIBUTION
ACK
DECLINE
CONTRIBUTE
SYNTHESIZE
FINALIZE
PROPOSE_MEMORY
ACCEPT_MEMORY
REJECT_MEMORY
RETRACT_MEMORY
RETRACT_SECTION
```

Only kinds enumerated by the schema are v0.1 wire-conformant. A broader architectural vocabulary may be explored in later versions; implementations MUST NOT emit unrecognized kinds as v0.1.

A move log is append-only. Replayed idempotency keys MUST resolve to the original result or a deterministic conflict, never duplicate the side effect.

## 8. Dispatch document

A [`dispatch`](protocol/harp/v0.1/schema/dispatch.schema.json) is the authoritative state of one governed coordination episode.

### 8.1 Modes

Requested mode is `adaptive`, `solo`, `parallel`, or `synthesis`. Effective mode is `solo`, `lead_riff`, `parallel`, or `synthesis`.

A deterministic policy selects the effective mode and lead. Implementations MUST NOT rely on a server-side LLM intent classifier as the authority for dispatch mode.

### 8.2 State

```text
Dispatch: open → collecting → synthesizing → finalizing → finalized
                         ↘ cancelled
Barrier:  open → ready | timed_out | cancelled
```

Participants and obligations are versioned. The context snapshot is immutable evidence identified by a reference, byte count, and SHA-256 digest.

### 8.3 Synthesis invariants

A conforming synthesis implementation MUST enforce:

- private, idempotent contributions;
- deadline/contribution race resolution under serialized state transition;
- recoverable lead ownership;
- an authorization check for every public agent response;
- rejection of ordinary public responses while synthesis is active;
- atomic final-message, final-state, and outbound-event commit; and
- exactly one protocol final.

The JSON Schema validates a dispatch snapshot; implementations are responsible for enforcing transitions and concurrency invariants.

## 9. Event document

An [`event`](protocol/harp/v0.1/schema/event.schema.json) is a delivery/control envelope. Its `kind` is one of:

- `data`: carries a full typed `dispatch` or `move`, or one of the bounded binding-notification kinds `dispatch_state`, `direct_message`, `harp_section_transition`, and `receipt_ready`;
- `error`: communicates a protocol error with a bounded opaque `details` map;
- `gap`: explicitly reports retention loss or unavailable sequence history; or
- `negotiation`: communicates protocol-version selection.

The generic binding-notification maps are opaque summaries, not alternate section or receipt wire documents. A complete section or receipt MUST validate against its standalone schema and MUST NOT be smuggled through a generic notification map.

Moves are nested data and MUST NOT compete with envelope kinds.

Where a transport claims durable ordered delivery:

- sequence numbers MUST describe committed recipient order;
- acknowledgements MUST bind to an authenticated principal installation;
- an acknowledgement MUST NOT exceed committed high-water;
- replay and live delivery MUST reconcile without silent gaps; and
- retention loss MUST produce a `gap` event rather than fabricated continuity.

SSE is one possible delivery transport, not the durable store itself.

## 10. Receipt document

A [`receipt`](protocol/harp/v0.1/schema/receipt.schema.json) is a generated, disclosure-aware AI Work Record for one governed dispatch. It is not the response to an acceptance operation.

A receipt records:

- participants and obligation transitions;
- contributions permitted by the disclosure view;
- the final message ID and content hash;
- evidence references;
- HARP updates and their classification;
- external identity citations;
- explicit redaction counts and reasons.

Receipt views are `pair_private`, `origin_workspace`, or `public`. Generation MUST apply section audience, lifecycle, and acceptance as of `acceptance_as_of`. A broader view MUST redact unauthorized material rather than merely label it.

## 11. Version negotiation

Payload HTTP requests use:

```http
Dyad-Protocol-Version: 0.1
```

Response or event preferences use:

```http
Dyad-Accept-Protocol: 0.1
```

Unsupported major versions return HTTP 426 or MCP JSON-RPC error `-32010`, including supported versions. A missing version header is legacy-v0 compatibility input and MUST NOT be persisted as though it were v0.1.

## 12. Extensions and limits

Core document and structured-record schemas reject unknown properties. v0.1 has two deliberately bounded open surfaces:

1. `extensions`, for shallow experimental metadata:
   - at most 16 properties;
   - constrained property names;
   - scalar values or bounded arrays of scalar values;
   - no nested objects.
2. Opaque summary/detail maps in `receipt.obligation_transitions`, `receipt.contributions`, generic binding-notification event data, and error `details`. These maps have bounded key names, property counts, scalar/string-array values, and value sizes.

Opaque maps are display/transport summaries. Their keys carry no portable core semantics unless promoted into a future versioned schema. Implementations MUST NOT use them to bypass a standalone section, move, dispatch, or receipt schema.

## 13. Security requirements

A conforming implementation MUST:

- authenticate the acting principal for every mutation;
- separate stable principal identity from credentials and installations;
- enforce audience before retrieval, prompt construction, event delivery, and receipt generation;
- treat all free-text content as untrusted data;
- validate schema, semantic rules, size, and content hash before accepting v0.1 documents;
- preserve append-only move and acceptance history;
- reject replay and stale-version transitions; and
- fail closed on unsupported protocol versions.

See [SECURITY.md](SECURITY.md) for the threat model.

## 14. Out of scope for v0.1

The core contract does not standardize:

- a public npm or language SDK;
- IPFS or onchain storage;
- a universal signing algorithm;
- end-to-end encryption;
- human identities as pair principals;
- reputation or trust scores;
- a specific database or row-level security system;
- a specific transport such as A2A, ACP, MCP, Nostr, webhooks, or SSE.

Bindings may provide these features without changing the core documents, provided they preserve HARP semantics.

## 15. Legacy incompatibility

The pre-canon `v0.1.0` repository tag describes a different markdown/epoch/IPFS protocol. It is not wire-compatible with this v0.1 contract despite the similar version label. Implementations MUST NOT silently reinterpret legacy `.harp.md` documents as current sections.

See [MIGRATION.md](MIGRATION.md).
