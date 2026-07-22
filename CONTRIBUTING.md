# Contributing to HARP

HARP v0.1 is a draft wire contract. Contributions should improve interoperability, clarity, and fail-closed behavior without making unimplemented distribution claims.

## Setup

Requirements:

- Python 3.11+
- Git

```bash
git clone https://github.com/squaretaper/harp.git
cd harp
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
python scripts/validate_protocol.py
```

The validator checks:

- every JSON Schema is itself valid Draft 2020-12;
- valid fixtures pass their schemas and semantic rules;
- each negative fixture fails for its intended schema or semantic reason;
- event-bundled dispatch and move schemas are identical to the standalone schemas;
- lowercase canonical UUID and exact, up-to-nine-digit leap-second-free timestamp handling;
- replay-equivalent acceptance/lifecycle rows, versions, actors, and times, including terminal retraction;
- duplicate JSON members and non-standard/non-finite JSON numbers are rejected;
- the canonical NFC/CRLF hash vector;
- the 1 MiB fixture envelope bound; and
- relative Markdown links.

## Repository structure

```text
protocol/harp/v0.1/
├── README.md
├── schema/
│   ├── section.schema.json
│   ├── move.schema.json
│   ├── dispatch.schema.json
│   ├── event.schema.json
│   └── receipt.schema.json
└── fixtures/
    ├── valid-*.json
    ├── invalid-audience.json
    └── hash-nfc-crlf.json
scripts/
└── validate_protocol.py
SPEC.md
DESIGN.md
SECURITY.md
MIGRATION.md
ECOSYSTEM.md
ROADMAP.md
```

## Source of truth

The files under `protocol/harp/v0.1/` are normative. Explanatory docs must agree with those files.

When changing a wire document:

1. update its JSON Schema;
2. update or add positive and negative fixtures;
3. update semantic validation if JSON Schema cannot express the rule;
4. update `SPEC.md` and migration notes if behavior changed;
5. run the validator; and
6. explain compatibility impact in the pull request.

Do not change only prose when the intended behavior is a wire-format change.

## Compatibility

Before v1.0, breaking changes are allowed but must be explicit. A breaking change requires one of:

- a new protocol version directory; or
- an unreleased-draft reset with a clear migration note.

Never silently broaden v0.1 parsing to accept unknown core fields or move kinds. Open data is limited to the bounded `extensions` object and the explicitly documented opaque summary/detail maps. Opaque-map keys do not create portable core semantics.

## Security review checklist

For every protocol change, ask:

- Does this change principal authentication or authorization?
- Can it leak pair or origin-workspace data through query, context, events, UI, or receipts?
- Can retries duplicate a side effect?
- Can stale versions win a race?
- Can a transport gap become silent?
- Can two public finals be produced?
- Does it expand untrusted prompt content or evidence dereferencing?
- Are size, depth, and cardinality bounded?
- Does the fixture suite include a failure case?

See [SECURITY.md](SECURITY.md).

## Pull requests

1. Create a branch from `main`.
2. Keep each change narrow and reviewable.
3. Run `python scripts/validate_protocol.py`.
4. Include the compatibility and security impact in the PR description.
5. Link any issue or implementation change that motivated the protocol change.

Suggested commit prefixes:

```text
spec: add a v0.1 negative receipt fixture
docs: clarify origin-workspace disclosure
security: reject duplicate acceptance principals
ci: validate schema formats
```

## SDK and package claims

Do not add installation instructions for a package that has not been published and independently install-tested from the public registry.

An SDK belongs in this repository only if it implements the current wire contract and passes all normative fixtures. Binding-specific clients should normally live in their implementation repositories.

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
