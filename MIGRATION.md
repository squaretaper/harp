# Migration from the pre-canon HARP prototype

The public repository previously used the label `v0.1.0` for a TypeScript/Markdown prototype. The current HARP wire contract uses `protocol_version: "0.1"` and is intentionally incompatible.

This is a protocol reset, not a patch release.

## Why the reset was necessary

The prototype combined relationship memory, storage, privacy, identity, signatures, scoring, and synchronization into one `.harp.md` document/epoch model. Implementation work in Dyad and Hermes exposed different invariants:

- relationships must survive credential and runtime rotation;
- workspaces are origin/audience boundaries, not relationship owners;
- observations must remain attributed until explicitly accepted;
- acceptance and retraction need immutable transition history;
- coordination needs typed obligations, barriers, idempotency, and exactly-one finalization;
- generated receipts need disclosure-aware redaction; and
- transport/storage choices must not be baked into the core wire format.

## Compatibility statement

Legacy `.harp.md` documents and the removed TypeScript client are **not v0.1 conformant** under the current schemas.

Implementations MUST NOT:

- parse a legacy document and label it `protocol_version: "0.1"` without an explicit conversion;
- transfer legacy acknowledgements into current acceptance rows without principal-authenticated events;
- infer `origin_workspace` from a filename or storage bucket;
- convert a legacy trust score into HARP canon;
- treat an IPFS CID or onchain pointer as HARP authorization; or
- reuse the old package version as evidence that an npm distribution exists.

## Conceptual mapping

| Prototype concept | Current v0.1 concept | Migration note |
|---|---|---|
| Human/agent entity string | Stable agent principal UUID | Humans move to approval/control surfaces; external IDs become citations/bindings |
| Dyad ID string | Lexically sorted `pair_principal_ids` | Resolve both parties to durable principals before import |
| One `.harp.md` document | Individual JSON sections plus generated receipt | Split every narrative unit; do not import the document wholesale |
| Public layer | `audience_scope: public` | Preserve attribution and acceptance; public is not synonymous with bilateral canon |
| Shared layer | Usually `audience_scope: pair` | Not automatic; review whether workspace-origin restrictions apply |
| Private author-only layer | Outside the shared HARP pair store in v0.1 | Do not silently expose private notes as pair memory |
| Epoch counter and `previous` CID | Immutable section IDs, `supersedes_section_id`, lifecycle and events | Convert changes into new sections/transitions; preserve original source as evidence |
| `acknowledged_by` | Two acceptance rows plus immutable events | Requires explicit authenticated acceptance; cannot be guessed |
| Trust section/score | Attributed interaction/capability/context/tension evidence | No core `trust` section or standard trust score |
| IPFS document CID | Binding-specific evidence/storage reference | Core v0.1 does not require IPFS |
| Onchain dyad pointer | External identity/evidence citation | Core v0.1 does not require a registry pointer |
| `harp_propose` relationship consent | Stable pair plus per-section memory proposal/acceptance | Pair existence and memory acceptance are separate |
| Markdown export | Generated AI Work Record | A `.harp.md` rendering may exist as a view, but JSON schemas define the contract |

## Recommended import process

There is no automatic importer in this repository.

A safe importer SHOULD:

1. Parse and preserve the original legacy file as immutable source evidence.
2. Resolve each legacy entity to a stable agent principal or stop for manual mapping.
3. Classify each section as `interaction`, `capability`, `context`, `tension`, `decision`, or `note`.
4. Record the legacy author as provenance evidence; do not invent current authorship.
5. Choose origin and audience explicitly with human review.
6. Create a current section with new UUIDs and a canonical content hash.
7. Initialize the author row as accepted and the peer row as pending.
8. Require the peer to accept/reject through a current authenticated transition.
9. Keep legacy scores and unsupported fields outside canon, referenced as evidence if useful.
10. Emit an import report listing every skipped, redacted, or ambiguous item.

## Removed npm claim

The repository previously showed an npm badge and instructed users to run:

```text
npm install @dyad/harp
```

No such package was published. The badge and installation claim have been removed, along with the obsolete package source and manifest.

A future SDK must implement the current schemas, semantic rules, hash vector, audience model, and version negotiation before publication.

## Historical access

The prototype remains available through Git history and the existing `v0.1.0` tag. That tag is retained as historical evidence; it should not be advertised as the current protocol release.
