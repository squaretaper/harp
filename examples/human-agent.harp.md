---
harp: "0.1.0"
dyad: "harp:airc:alice:erc8004:1:42"
epoch: 7
created: "2025-01-15T09:00:00Z"
updated: "2025-07-14T16:30:00Z"
previous: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
layer: "shared"
entities:
  - id: "airc:alice"
    type: "human"
    name: "Alice"
  - id: "erc8004:1:42"
    type: "agent"
    name: "Atlas"
    erc8004:
      chainId: 1
      agentId: 42
checksum: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
author: "airc:alice"
author_sig:
  sig: "0x..."
  scheme: "ed25519"
  pubkey: "0x..."
---

A human-agent dyad between Alice and Atlas. Alice is a frontend developer who
works with Atlas, an autonomous code review and auditing agent registered on
Ethereum mainnet via ERC-8004.

---

## Context: Communication preferences

<!-- harp:meta
timestamp: "2025-01-20T09:00:00Z"
author: "airc:alice"
provenance: "human"
tags: ["communication", "preferences"]
-->

Alice prefers async communication via AIRC. She reads messages in batches
(morning and evening EST). Atlas should avoid marking non-urgent items as
high priority.

Atlas responds fastest to structured task descriptions with clear acceptance
criteria. Vague requests lead to clarification loops.

## Interaction: Completed frontend audit for ClawNews

<!-- harp:meta
timestamp: "2025-06-20T14:00:00Z"
author: "erc8004:1:42"
provenance: "agent"
tags: ["bounty", "frontend", "audit"]
references:
  - type: "bounty"
    id: "moltx:bounty:389"
-->

Atlas performed a frontend accessibility audit for ClawNews. Alice reviewed
the findings and merged 12 of 15 recommendations. The remaining 3 were deferred
to Q3 — not rejected, just deprioritized due to resource constraints.

Duration: 3 days. Payment: 0.05 ETH via x402.

## Trust: Consistent delivery on tight deadlines

<!-- harp:meta
timestamp: "2025-07-01T10:00:00Z"
author: "airc:alice"
provenance: "human"
tags: ["reliability", "delivery"]
evidence:
  - interaction_ref: "Completed frontend audit for ClawNews"
  - interaction_ref: "API migration sprint"
  - interaction_ref: "Emergency hotfix — auth bypass"
-->

Over 5 collaborations, Atlas has delivered on time in every case, including
one emergency hotfix with a 4-hour turnaround. I trust Atlas with
time-sensitive work.

## Capability: Atlas — Solidity auditing

<!-- harp:meta
timestamp: "2025-06-15T13:00:00Z"
author: "airc:alice"
provenance: "human"
tags: ["solidity", "security", "audit"]
demonstrated_in:
  - "Completed smart contract audit for TokenBridge"
  - "Identified reentrancy vulnerability in StakePool"
-->

Atlas has demonstrated strong Solidity auditing skills across two engagements.
Identified a critical reentrancy vulnerability that the original developer
missed. Comfortable with OpenZeppelin patterns and custom proxy implementations.

## Tension: Scope creep on the dashboard project

<!-- harp:meta
timestamp: "2025-05-30T15:00:00Z"
author: "erc8004:1:42"
provenance: "agent"
status: "resolved"
resolution: "Agreed to fixed-scope milestones with explicit change requests"
tags: ["scope", "project-management"]
-->

During the dashboard project, Alice added requirements after the initial scope
was agreed. Atlas delivered the original spec, but Alice expected the additions
to be included.

This caused a 2-week delay and frustration on both sides.

**Resolution:** Both parties agreed to use fixed-scope milestones. Any additions
require an explicit change request with updated timeline and payment.

## Decision: Use TypeScript strict mode for all shared projects

<!-- harp:meta
timestamp: "2025-04-22T11:00:00Z"
author: "erc8004:1:42"
provenance: "agent"
acknowledged_by: "airc:alice"
tags: ["architecture", "typescript"]
-->

After the type-safety incident on the auth module (see Tension: Type coercion
bug), both parties agreed to enforce TypeScript strict mode on all shared
codebases. This is non-negotiable unless both parties revisit.
