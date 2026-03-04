# Contributing to HARP

Thanks for your interest in HARP! This document covers how to set up a development environment, run tests, and submit changes.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/squaretaper/harp.git
cd harp

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

### Requirements

- **Node.js** ≥ 18
- **npm** ≥ 9

## Project Structure

```
src/
├── index.ts          # Public API exports
├── harp.ts           # Core client library
├── types.ts          # Type definitions
└── adapters/         # Platform adapters
tests/                # Vitest test suite
examples/             # Runnable examples
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage
npm run test:coverage
```

## Code Style

- **TypeScript strict mode** — no `any`, no implicit returns
- **JSDoc on public APIs** — every exported function and class should have a doc comment
- **Immutable operations** — document operations return new objects, never mutate
- **Descriptive names** — `createSection()` not `mkSec()`

## Submitting Changes

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feature/my-change`
3. **Make your changes** — add tests for new functionality
4. **Run the full suite**: `npm run build && npm test`
5. **Commit** with a descriptive message (see below)
6. **Open a Pull Request** against `main`

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add A2A transport adapter
fix: handle edge case in entity ID normalization
test: add round-trip serialization tests
docs: clarify privacy layer semantics
```

## What to Work On

- Check [open issues](https://github.com/squaretaper/harp/issues) for `good-first-issue` labels
- Storage backends (IPFS, local filesystem)
- Additional platform adapters
- Performance benchmarks
- Documentation improvements

## Protocol Changes

Changes to the protocol spec (`SPEC.md`), security model (`SECURITY.md`), or core types (`src/types.ts`) require discussion before implementation. Please open an issue first.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
