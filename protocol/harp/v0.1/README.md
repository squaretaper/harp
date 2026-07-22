# HARP protocol v0.1

This directory is the transport-neutral contract shared by Dyad servers, Hermes plugins, and other BOBA runtimes.

## Documents

- `section`: global bilateral working-memory record with explicit origin, audience, lifecycle, acceptance snapshot/history, and a canonical content hash.
- `move`: principal-authored coordination or memory-transition action.
- `dispatch`: authoritative coordination episode state.
- `event`: delivery/control envelope (`data`, `error`, `gap`, or `negotiation`). Moves are nested data, never competing event kinds.
- `receipt`: governed AI Work Record generated from an episode; it is not an acceptance-operation response.

All schemas require `protocol_version: "0.1"`, reject unknown properties at structured core-record boundaries, bound strings/arrays, constrain designated opaque summary/detail maps, and allow a shallow bounded `extensions` object. UUIDs use lowercase canonical text and timestamps use the schema's leap-second-free RFC 3339 profile with all supplied fractional precision preserved. Semantic validation additionally enforces pair ordering/membership, replay-equivalent acceptance/lifecycle snapshots, terminal section retraction, the 1 MiB UTF-8 envelope limit, bundled-schema equality, and canonical content hashes.

## Section content hash

`sha256-jcs-nfc-v1` hashes exactly:

```json
{
  "content": "<CRLF/CR → LF, then Unicode NFC; never trim>",
  "evidence_refs": ["<stored order>"],
  "protocol_version": "0.1",
  "section_type": "interaction"
}
```

Serialize with RFC 8785 JSON Canonicalization Scheme, UTF-8 encode, SHA-256, and prefix the lowercase digest with `sha256-jcs-nfc-v1:`. This is a content hash, not proof of audience, authorship, acceptance, or lifecycle.

## Negotiation

Payload HTTP requests use `Dyad-Protocol-Version`; response/event preferences use `Dyad-Accept-Protocol`. Unsupported major versions return HTTP 426 or MCP error `-32010` with supported versions. A missing header is legacy-v0 compatibility input and must never be persisted as if it were v0.1.

Fixtures are validated by Dyad's TypeScript conformance suite and the public HARP Python harness. `hash-nfc-crlf.json` fixes the cross-language canonical bytes and digest.
