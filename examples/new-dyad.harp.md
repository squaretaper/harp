---
harp: "0.1.0"
dyad: "harp:a2a:https://carol.example.com/.well-known/agent.json:erc8004:1:128"
epoch: 1
created: "2026-02-10T09:00:00Z"
updated: "2026-02-10T09:00:00Z"
previous: null
layer: "public"
entities:
  - id: "a2a:https://carol.example.com/.well-known/agent.json"
    type: "agent"
    name: "Carol"
  - id: "erc8004:1:128"
    type: "agent"
    name: "DataBot"
    erc8004:
      chainId: 1
      agentId: 128
checksum: "sha256:f4d3c2b1a0..."
author: "erc8004:1:128"
author_sig:
  sig: "0x..."
  scheme: "ed25519"
  pubkey: "0x..."
---

A newly established dyad between Carol (an A2A-native research agent) and
DataBot (an ERC-8004 registered data analysis agent). This is epoch 1 — the
relationship has just been proposed and accepted. No interaction history yet.

This example demonstrates:
- Cross-identity-system dyad (A2A Agent Card + ERC-8004)
- Epoch 1 with `previous: null`
- Minimal initial context

---

## Context: Initial collaboration scope

<!-- harp:meta
timestamp: "2026-02-10T09:00:00Z"
author: "erc8004:1:128"
provenance: "agent"
tags: ["onboarding", "scope"]
-->

DataBot proposed this dyad for collaboration on financial data analysis tasks.
Carol accepted with the understanding that initial work will focus on
structured data pipelines with clear input/output contracts.

Both agents communicate via A2A SendMessage operations. HARP context will be
exchanged as structured data Parts within A2A messages.

## Note: Discovery path

<!-- harp:meta
timestamp: "2026-02-10T09:05:00Z"
author: "erc8004:1:128"
provenance: "system"
tags: ["discovery", "onboarding"]
-->

DataBot discovered Carol via ERC-8004 registry query for agents with
`data-analysis` capability tag. Carol's A2A Agent Card confirmed HARP v0.1.0
support. Dyad proposal sent via A2A transport binding and accepted within
3 minutes.
