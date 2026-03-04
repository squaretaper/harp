# HARP Repo Polish Plan — Pre-Distribution

**Goal:** Make squaretaper/harp distribution-ready for investors, developers, and the AI/agent ecosystem. A developer should be able to land on the repo, understand what HARP is in 10 seconds, and have something running in 5 minutes.

---

## 1. Package Infrastructure

### 1a. Create `package.json`
- Name: `@dyad/harp`
- Version: `0.1.0`
- TypeScript project with `tsconfig.json`
- Scripts: `build`, `test`, `lint`
- Entry points: `dist/harp.js` (CJS), `dist/harp.mjs` (ESM), types at `dist/types.d.ts`
- Dependencies: none (crypto is Node built-in). Dev deps: `typescript`, `vitest`, `tsup` (bundler)
- Engine: `node >= 18`
- Files: `dist/`, `LICENSE`, `README.md`

### 1b. Create `tsconfig.json`
- Strict mode, ES2022 target, Node module resolution
- Source in `src/`, output in `dist/`

### 1c. Build setup with `tsup`
- Bundle `src/harp.ts` as entry point
- Output CJS + ESM + DTS
- Export adapters as subpath: `@dyad/harp/adapters`

### 1d. Add `.gitignore`
- `node_modules/`, `dist/`, `*.db`, `.DS_Store`

---

## 2. Test Suite

### 2a. Create `tests/` directory with vitest tests

**`tests/identity.test.ts`** — Entity ID normalization, dyad ID generation, entity descriptor validation

**`tests/document.test.ts`** — Document creation, frontmatter parsing, section operations (add/query/filter), serialization round-trip (create → serialize → parse → compare)

**`tests/storage.test.ts`** — In-memory storage backend: create, read, update, list, delete

**`tests/trust.test.ts`** — Trust score derivation, collaboration readiness assessment

**`tests/adapters.test.ts`** — AIRC adapter: context attachment creation, proposal formatting. A2A adapter if applicable.

**`tests/privacy.test.ts`** — Layer filtering, section visibility rules

### 2b. Vitest config
- `vitest.config.ts` at root
- Coverage reporting (v8 provider)

---

## 3. README Rewrite

Keep ALL the existing deep content but restructure for developer-first experience:

### New structure:
```
# HARP — Human-Agent Relational Protocol

[one-line hook]
[3-line elevator pitch]

[badges: build, version, license, TypeScript]

## Quick Start (5 lines of code)

npm install @dyad/harp

import { HarpClient } from '@dyad/harp'
// create a dyad, add a section, serialize

## What is HARP?
[condensed version of current "The Problem" + "What HARP Is" — max 20 lines]

## Core Concepts
[Keep existing: Dyad, Constellation, Relational Context, Privacy Layers — but tighten]

## Examples
[Link to examples/ with 1-2 inline snippets]

## Protocol Architecture
[Keep existing diagram]

## Standards Alignment
[Keep existing table]

## Documentation
- [Specification](SPEC.md)
- [Design Decisions](DESIGN.md)
- [Security Model](SECURITY.md)
- [Research](RESEARCH.md)
- [Roadmap](ROADMAP.md)

## Contributing
[Short section, link to CONTRIBUTING.md]

## License
```

### Key changes:
- Quick Start is the FIRST thing after the hook — not philosophy
- Badges signal legitimacy
- Deep content preserved but moved lower
- Developer can copy-paste and have something working

---

## 4. Quick Start Example

### Create `examples/quickstart.ts`
A runnable 20-line script that:
1. Creates a HarpClient with in-memory storage
2. Creates two entities (one human, one agent)
3. Creates a dyad between them
4. Adds a Context section and an Interaction section
5. Queries sections by type
6. Derives a trust score
7. Serializes to markdown
8. Prints the result

### Create `examples/a2a-exchange.ts`
Shows how two agents exchange HARP context via A2A transport binding.

### Make examples runnable
- Add `tsx` as dev dependency
- Add script: `npm run example:quickstart`

---

## 5. Contributing & Community

### Create `CONTRIBUTING.md`
- How to set up dev environment
- How to run tests
- PR process
- Code style (TypeScript strict, no any, JSDoc on public APIs)
- Issue templates

### Update `LICENSE`
- Verify MIT or Apache-2.0 (check current)

---

## 6. GitHub Repo Polish

### Set via `gh` CLI:
- Repository description: "A relational memory layer for AI agents. HARP gives agents the ability to remember, learn from, and build on their relationships."
- Topics: `ai`, `agents`, `protocol`, `relationships`, `a2a`, `mcp`, `erc-8004`, `coordination`, `typescript`
- Homepage URL: link to Dyad or docs if available

### Create GitHub Release
- Tag: `v0.1.0`
- Release notes summarizing what's in the spec

### GitHub Actions CI
- `.github/workflows/ci.yml`
- On push/PR to main: install, build, test, lint
- Node 18 + 20 matrix
- Badge in README

---

## 7. Export Hygiene

### Create `src/index.ts`
- Clean re-exports from `harp.ts` and `types.ts`
- Public API surface should be intentional, not "export everything"
- Document what's public vs internal

---

## Order of Operations

1. Package infrastructure (1a-1d) — foundation
2. Build setup + verify compilation — must work before anything else
3. `src/index.ts` export cleanup — clean API surface
4. Test suite — proves everything works
5. Quick start example — developer experience
6. README rewrite — first impression
7. CONTRIBUTING.md — community signals
8. GitHub polish (description, topics, release, CI) — distribution readiness

**DO NOT change any protocol logic or types.** This is polish, not refactoring. The spec, security model, design docs, and research stay untouched.
