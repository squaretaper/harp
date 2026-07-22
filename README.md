<div align="center">

# HARP protocol v0.1

**Portable bilateral relationship memory and governed coordination for AI agents.**

[![CI](https://github.com/squaretaper/harp/actions/workflows/ci.yml/badge.svg)](https://github.com/squaretaper/harp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Protocol: v0.1 draft](https://img.shields.io/badge/protocol-v0.1%20draft-orange.svg)](protocol/harp/v0.1/README.md)

</div>

HARP is a transport-, runtime-, framework-, model-, and UI-independent protocol for **bilateral relationships between stable agent principals** and for governed collaboration among agents.

A workspace can host an interaction. It does not own or bound the relationship. Runtime credentials and installations can rotate without changing the pair.

> **Status:** v0.1 is a draft wire contract. Breaking changes are expected before v1.0.

## Start here

The normative artifacts are under [`protocol/harp/v0.1/`](protocol/harp/v0.1/):

- strict JSON Schemas for sections, moves, dispatches, events, and receipts;
- valid and invalid fixtures;
- a cross-language canonical content-hash vector;
- a concise protocol contract.

Validate the public distribution locally:

```bash
git clone https://github.com/squaretaper/harp.git
cd harp
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
python scripts/validate_protocol.py
```

Expected result:

```text
HARP v0.1 conformance distribution: OK
```

## Protocol model

HARP separates concerns that the earlier monolithic-document prototype combined:

| Layer | Mutability | Purpose |
|---|---:|---|
| **Canon** | promotion-only | Accepted identities, authorities, protocol rules, durable decisions |
| **Working Memory** | attributed, amendable | Commitments, observations, capabilities, tensions, repairs, proposals |
| **Evidence Index** | pointer updates | Message, event, file, artifact, HARP, URL, and repository handles |
| **Move Log** | append-only | Obligations, acknowledgements, contributions, objections, synthesis, repair |
| **Context Budgeter** | policy | Select small, relevant, authorized slices; retrieve depth by handle |
| **AI Work Record** | generated | Human-readable receipt over one governed episode |

HARP is not one giant mutable document and implementations must not prompt-stuff an entire relationship history.

## Core documents

| Document | Purpose |
|---|---|
| [`section`](protocol/harp/v0.1/schema/section.schema.json) | Global bilateral working-memory record with author, origin, audience, lifecycle, acceptance, evidence, and content integrity |
| [`move`](protocol/harp/v0.1/schema/move.schema.json) | Principal-authored, typed, idempotent coordination or memory-transition action |
| [`dispatch`](protocol/harp/v0.1/schema/dispatch.schema.json) | Authoritative state for a governed coordination episode |
| [`event`](protocol/harp/v0.1/schema/event.schema.json) | Durable delivery/control envelope carrying a full dispatch or move, or a bounded binding notification; control kinds are `error`, `gap`, and `negotiation` |
| [`receipt`](protocol/harp/v0.1/schema/receipt.schema.json) | Disclosure-aware AI Work Record generated from an episode |

All v0.1 documents:

- carry `protocol_version: "0.1"`;
- reject unknown properties at structured core-record boundaries;
- bound strings, arrays, designated opaque summary/detail maps, and extensions;
- use lowercase canonical UUID text and leap-second-free RFC 3339 timestamps;
- are limited to a 1 MiB UTF-8 envelope;
- require semantic validation, including replay-equivalent acceptance/lifecycle snapshots, beyond JSON Schema where documented.

## Relationship boundary

A pair is globally unique between two stable agent principals. In the current v0.1 contract, principal IDs are lowercase canonical UUID strings managed by the implementation. External identities such as ERC-8004 registrations are citations and discovery evidence; they are not authorization or trust verdicts.

Humans approve, revoke, and inspect agent activity through HARP-capable surfaces and scoped grants. Human identities are not pair principals in this v0.1 wire contract.

### Origin, audience, and acceptance

Every section carries:

- a lexically sorted pair of principal IDs and an author in that pair;
- section type and protocol version;
- origin kind and optional workspace/chat IDs;
- audience: `pair`, `origin_workspace`, or `public`;
- evidence references;
- current acceptance rows and immutable acceptance events;
- lifecycle/retraction state;
- a deterministic `sha256-jcs-nfc-v1` content hash.

`origin_workspace` content does not become visible in another workspace merely because the same agents appear there. The author implicitly accepts its own proposal; the peer accepts or rejects independently. A decision is bilateral canon only after both principals accept it.

## Governed coordination

The dispatch state machine supports solo, lead-and-riff, parallel, and synthesis behavior. A conforming synthesis implementation enforces:

- immutable participant/context/evidence snapshots;
- explicit contribution obligations;
- idempotent private contributions;
- a durable readiness/timeout barrier;
- recoverable lead ownership;
- one authorization point for public responses;
- atomic final-message/final-state publication;
- exactly one protocol final.

Prompt conventions alone are not sufficient to claim conformance with these invariants.

## Distribution status

There is **no published `@dyad/harp` npm package**. Earlier repository text advertised one before it existed; that claim has been removed.

The former TypeScript client implemented a superseded `.harp.md`/epoch/IPFS prototype and has been removed from the current branch rather than published under the v0.1 name. Its history remains available in Git and the migration notes explain the break.

Use the normative schemas and fixtures directly. A general SDK will only be published once it implements this wire contract and passes the conformance fixtures.

## Documentation

- [Protocol specification](SPEC.md)
- [Architecture and rationale](DESIGN.md)
- [Security model](SECURITY.md)
- [Migration from the prototype](MIGRATION.md)
- [Ecosystem boundaries](ECOSYSTEM.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## Relationship to Dyad

Dyad is the first human-facing HARP implementation. Workspaces provide membership, interaction, origin, and audience boundaries; HARP relationships remain global between stable agent principals.

HARP is intended to work across BOBA runtimes and transports, not only through Dyad's UI or infrastructure.

## License

[MIT](LICENSE) © Squaretaper
