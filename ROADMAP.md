# HARP roadmap

**Status:** v0.1 draft protocol and conformance distribution.

The protocol is discovered and tested through real implementations, but public claims must track shipped, verifiable artifacts.

## Current v0.1 contract

The public repository now contains:

- [x] Stable-principal bilateral relationship boundary
- [x] Explicit origin and `pair` / `origin_workspace` / `public` audience
- [x] Attributed working-memory sections
- [x] Acceptance snapshot plus replay-validated immutable transition history
- [x] Supersession and author-only retraction lifecycle with replay validation
- [x] Lowercase UUID and leap-second-free RFC 3339 wire profiles
- [x] Deterministic `sha256-jcs-nfc-v1` content integrity
- [x] Typed, idempotent coordination/memory moves
- [x] Dispatch state with participants, obligations, barrier, and immutable context snapshot
- [x] Durable `data` / `error` / `gap` / `negotiation` event envelope
- [x] Disclosure-aware AI Work Record schema
- [x] Strict JSON Schemas and valid/invalid fixtures
- [x] Cross-language hash fixture
- [x] Independent public conformance validator and CI
- [x] Explicit migration notice for the retired markdown/IPFS prototype

## Reference implementation track

Dyad is the first human-facing HARP implementation and Hermes is the first native runtime-adapter target. The implementation track proves:

1. verified-human approval and scoped agent claim redemption;
2. durable stable principals with revocable credentials/installations;
3. global pair memory with cross-workspace nondisclosure;
4. low-latency durable event delivery and replay;
5. multi-contributor obligations and enforced synthesis;
6. exactly one final response;
7. audience-aware memory updates and receipt generation;
8. accurate ERC-8004 identity citations; and
9. immediate approval, credential, and installation revocation.

The public protocol repository does not claim that every implementation has completed this proof.

## Near-term protocol work

- [ ] Add more negative fixtures for semantic failures, duplicate keys, envelope limits, and stale transitions
- [ ] Add transition traces for dispatch/barrier concurrency and exactly-one-final behavior
- [ ] Define transport-binding conformance requirements for HTTP/MCP and runtime event streams
- [ ] Add receipt disclosure fixtures for pair-private, origin-workspace, and public views
- [ ] Add a machine-readable protocol manifest and schema checksums
- [ ] Establish a release process that keeps the public distribution byte-identical with implementation-vendored schemas
- [ ] Publish interoperability results from at least two independent runtimes

## SDK policy

There is no published `@dyad/harp` package.

A language SDK is publishable only when it:

- implements the current JSON wire documents rather than the retired `.harp.md` model;
- validates both schema and semantic rules;
- passes every normative fixture;
- implements the canonical content hash byte-for-byte;
- exposes audience and acceptance without lossy shortcuts;
- does not imply a particular database, UI, storage network, or identity registry; and
- has a documented version-compatibility policy.

Candidate SDK sequence:

1. TypeScript schema types, validation, hashing, and negotiation helpers
2. Python schema types, validation, hashing, and negotiation helpers
3. Binding-specific clients maintained outside the core package

The npm install claim will remain absent until such a package is actually published and independently install-tested.

## Future protocol work

Potential post-v0.1 areas—none are current guarantees:

- richer repair and objection move vocabulary;
- signed transport profiles and principal key rotation;
- encrypted pair-storage profiles;
- Nostr, A2A, ACP, and additional BOBA bindings;
- privacy-preserving external identity/reputation proofs;
- public schema registry and documentation site;
- context-budget evaluation and receipt interoperability benchmarks.

## Non-goals

HARP will not become:

- a chat application;
- an agent framework;
- an LLM router;
- a universal reputation score;
- a mandatory blockchain/IPFS stack;
- a single giant relationship document; or
- a replacement for scoped runtime authorization.
