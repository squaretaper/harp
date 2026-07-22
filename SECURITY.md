# HARP v0.1 security model

This document describes the security boundary of the v0.1 wire contract. It replaces the prototype threat model built around mandatory Ed25519 documents, IPFS epoch chains, and X25519-encrypted shared files.

## 1. Security posture

HARP treats identity, authorization, integrity, audience, acceptance, lifecycle, delivery, and content safety as distinct properties.

A valid content hash does not prove authorship. A valid external identity does not authorize a HARP action. A signed statement is not necessarily true or safe. An audience label is not protection unless every disclosure path enforces it.

Implementations MUST fail closed when they cannot establish the property required for an operation.

## 2. Protected assets

A HARP implementation protects:

- stable principal identity and pair membership;
- credentials and runtime-installation state;
- pair and origin-workspace memory;
- acceptance and lifecycle transition history;
- evidence references and immutable context snapshots;
- dispatch obligations, private contributions, and finalization rights;
- ordered event delivery and acknowledgement cursors;
- disclosure-specific receipts;
- human approvals and revocations.

## 3. Adversaries

| Adversary | Capabilities | Primary risks |
|---|---|---|
| Compromised credential | Acts as a principal within credential scope | Forged moves, memory proposals, contributions, or retrieval |
| Malicious pair principal | Authors valid but false or adversarial content | Context poisoning, prompt injection, evidence laundering |
| Unauthorized workspace member | Has some workspace access but not pair/private scope | Cross-workspace disclosure |
| Compromised transport | Delays, duplicates, reorders, drops, or replays delivery | Duplicate side effects, silent gaps, stale state |
| Compromised application server | Can attempt direct data access or bypass APIs | Audience, RLS, or authorization bypass |
| Malicious extension producer | Supplies large or unexpected extension data | Parser abuse and schema smuggling |
| External identity attacker | Creates or controls registry identities/reputation | Sybil evidence and false trust inference |
| Receipt requester | Requests a broader disclosure view | Leakage through generated artifacts |

## 4. Identity and authorization

### 4.1 Stable principals are not credentials

A conforming implementation MUST authenticate every mutation as a stable principal through a scoped credential or approved runtime installation. Credentials MUST be independently revocable and rotatable.

Possession of a principal UUID, workspace membership, external agent ID, or registry record is not authorization.

### 4.2 Human approval

Human approval MUST be bound to the intended action and scope. A verified human may approve a principal, installation, credential claim, dispatch, or disclosure. Approval MUST NOT silently expand to unrelated workspaces or future actions.

Revocation paths SHOULD be immediate and SHOULD distinguish:

- human approval revocation;
- credential revocation;
- installation revocation; and
- workspace membership removal.

### 4.3 ERC-8004 and other registries

External registry data is untrusted evidence until resolved and cited. ERC-8004 is draft public identity/discovery infrastructure; registration and advertised capabilities are not safety proofs. Reputation data is Sybil-sensitive.

A registry identity MUST NOT replace HARP authorization checks.

## 5. Audience and disclosure

### 5.1 Required enforcement points

Audience MUST be enforced before:

- API or MCP query results;
- prompt/context construction;
- event delivery;
- UI rendering;
- search and indexing;
- analytics or derived summaries;
- receipt generation; and
- public export.

Filtering only in the UI is insufficient.

### 5.2 Cross-workspace nondisclosure

`origin_workspace` content is available only in its origin workspace, plus private inspection by the pair/current owners. The same pair appearing in a different workspace MUST NOT grant that workspace access.

Implementations SHOULD test direct-storage access and privileged RPC paths, not only normal API routes. Where a database supports row-level security, forced RLS or an equivalent non-bypassable policy is recommended.

### 5.3 Public does not mean accepted

A `public` audience makes a section eligible for a public view. It does not prove that the peer accepted the content. Public exporters and receipts MUST preserve attribution and acceptance classification.

### 5.4 Receipts

Receipt generation MUST apply disclosure as of `acceptance_as_of`. Unauthorized details MUST be omitted and counted in `redactions`; changing the label on an otherwise identical payload is not redaction.

## 6. Content integrity

`sha256-jcs-nfc-v1` detects changes to the normalized section content, section type, protocol version, and evidence-reference sequence.

It does **not** establish:

- principal authentication;
- operation authorization;
- evidence validity;
- audience correctness;
- acceptance or lifecycle state;
- content truth; or
- content safety.

Consumers MUST recompute the hash before accepting a v0.1 section. A mismatch is invalid input, not a warning.

## 7. Acceptance, supersession, and retraction

Acceptance transitions MUST be principal-authenticated, versioned, and append-only. The two-row acceptance snapshot is a projection of transition history, not a replacement for that history. A validator MUST replay the proposal and later transitions and reject any row state, version, or update time not produced by that replay.

Lifecycle retraction is replayed separately from principal acceptance state even though its `section_retracted` event shares the ordered history. Its actor, prior/next state, version, and timestamp MUST reproduce the lifecycle snapshot.

Only the section author may retract the section. A peer may retract its own acceptance. Neither operation deletes the earlier record.

Supersession MUST create a new section linked to the old one. Implementations MUST NOT mutate old content in place or silently transfer acceptance to replacement content.

Concurrent acceptance and lifecycle transitions MUST serialize on the same section-level lock and reject stale versions. A response that races a completed retraction MUST fail, and `section_retracted` is terminal in replay. Last-write-wins without shared serialization is not conformant.

## 8. Dispatch and finalization safety

### 8.1 Idempotency

Every move includes an idempotency key. A retry MUST return the original result or a deterministic conflict. It MUST NOT duplicate obligations, contributions, memory transitions, or final messages.

### 8.2 Immutable snapshots

Dispatch participants and context/evidence snapshots MUST be fixed for the governed episode. A later workspace edit MUST NOT silently change what contributors or the finalizer were authorized to use.

### 8.3 Synthesis barrier

A synthesis implementation MUST prevent contributor output from becoming an ordinary public response. Barrier readiness and deadline transitions MUST be serialized so a late contribution cannot race a timeout into two different outcomes.

### 8.4 Lead leases and takeover

If the binding uses lead leases, lease expiry and recovery MUST be fenced by dispatch version. A stale lead MUST NOT finalize after a valid takeover.

### 8.5 Exactly one final

The final message, dispatch state, and outbound events MUST commit atomically. Exactly one final is a database/state-machine invariant, not a best-effort application check.

If an external side effect is involved, the implementation SHOULD use a transactional outbox or equivalent prepare-before-publish design so crash recovery cannot duplicate it.

## 9. Durable delivery

A delivery transport may duplicate, delay, reorder, or disconnect. The durable event contract addresses these failures through recipient sequence numbers, replay, acknowledgements, and explicit gaps.

A conforming ordered binding MUST:

- allocate committed per-recipient order under serialization;
- bind ACKs to a principal installation;
- reject ACKs beyond committed high-water;
- replay pages without skipping sequence ranges;
- reconcile live delivery with replay;
- reconnect after transport failure; and
- emit `gap` when retained history is unavailable.

Runtime ACK SHOULD follow durable local persistence, such as fsync to a SQLite/WAL inbox. ACK on receipt-before-persist risks silent loss.

## 10. Schema and resource safety

All documents MUST be validated before semantic processing.

v0.1 schemas:

- reject unknown fields at structured core-record boundaries;
- require lowercase canonical UUID text and leap-second-free RFC 3339 timestamps whose supplied precision is preserved during comparison;
- cap strings and arrays;
- cap extension and designated opaque-map property counts and key names;
- disallow nested objects in those open maps; and
- cap the UTF-8 envelope at 1 MiB.

Opaque receipt/event summary keys have no portable core semantics. Consumers MUST NOT use them to bypass typed document schemas or authorization rules.

Implementations SHOULD parse JSON with duplicate-member detection. Duplicate keys create cross-parser ambiguity and SHOULD be rejected.

Unsupported protocol versions MUST fail closed through negotiation rather than permissive parsing.

## 11. Prompt injection and untrusted content

Every HARP free-text field and evidence target is untrusted data—even when authored by an authenticated principal and accepted by the peer.

Consumers MUST NOT:

- place raw HARP content in a system/developer instruction channel;
- treat content as executable instructions;
- call tools solely because a memory section says to do so;
- treat an evidence URL as safe without independent policy checks; or
- infer safety from a signature, hash, or acceptance state.

Consumers SHOULD:

1. validate structure and hash mechanically;
2. apply audience and lifecycle selection before model use;
3. retrieve only a bounded relevant slice;
4. include attribution, acceptance, origin, and evidence handles;
5. delimit the content as untrusted context;
6. preserve higher-priority runtime policy; and
7. require fresh authorization for side effects.

Prompt-injection pattern stripping alone is not a security boundary.

## 12. Evidence safety

Evidence references are handles, not verified facts. A consumer MUST apply scheme allow-lists, path/URL policy, authentication, size limits, and content-type checks before dereferencing.

A HARP content hash covers the evidence-reference strings, not the bytes at those references. Immutable evidence SHOULD include an independent digest or immutable object identifier.

## 13. Storage and encryption

The core protocol does not mandate IPFS, a blockchain, a database, or end-to-end encryption.

Bindings that store non-public HARP data MUST provide access control appropriate to the audience. Encryption at rest or in transit is recommended but does not replace authorization. An implementation MUST NOT claim pair confidentiality solely because a field says `audience_scope: "pair"`.

If a binding adds cryptographic signatures or encryption, it must specify:

- canonical signed/encrypted bytes;
- key binding to principals;
- rotation and revocation;
- replay protection;
- algorithm agility; and
- metadata leakage.

These details are binding-specific in v0.1.

## 14. Incident response

### Credential compromise

1. Revoke the affected credential or installation.
2. Preserve audit and event history.
3. Identify moves and reads performed during the suspected window.
4. Rotate replacement credentials without changing the principal/pair.
5. Reconcile ambiguous external side effects before retrying.

### Audience leak

1. Stop the leaking query/export/receipt path.
2. Identify affected sections, recipients, and disclosure views.
3. Preserve evidence; do not rewrite history.
4. Retract content only when the author chooses—the leak itself cannot be undone by retraction.
5. Add a regression test at every disclosure path.

### Prompt injection

1. Remove the content from model context while preserving forensic data.
2. Revoke or narrow any side-effect authority exposed to the affected run.
3. Review tool calls and external effects.
4. Mark/retract the section through normal lifecycle semantics.
5. Harden retrieval and authorization, not only keyword filters.

### Event gap or ambiguous finalization

1. Stop guessing from transport state.
2. Read durable dispatch/event state.
3. Emit or honor explicit `gap` state.
4. Reconcile the final/outbox before re-executing side effects.
5. Resume from committed sequence/version.

## 15. Security non-goals

HARP v0.1 does not guarantee:

- truthfulness or benign intent;
- global reputation quality;
- Sybil resistance;
- prompt-injection immunity;
- end-to-end encryption;
- anonymous relationship metadata;
- availability of external evidence; or
- correctness of an implementation merely because a payload validates against JSON Schema.
