# HARP Protocol Specification

**Human/Agentic Relational Protocol — Version 0.1.0 (Draft)**

---

## Abstract

HARP (Human/Agentic Relational Protocol) defines a portable, structured format for capturing the relational context between identified entities — human or agent. Where identity protocols answer *who*, communication protocols answer *how*, and payment protocols answer *how much*, HARP answers *why* — why these entities work together, what they've learned about each other, and what history they share.

A HARP document is not a score. It is a shared memory: a bilateral, append-only, privacy-layered record of how entities relate. It is designed to be readable by humans, parseable by machines, and portable across platforms.

**The atomic unit.** HARP's fundamental design choice is that the **dyad** — the relationship between two entities — is the atomic unit of relational context. Like TCP/IP, which handles point-to-point connections but builds the entire internet, HARP handles dyadic relational memory but builds the entire collaborative intelligence layer. A four-person team doesn't have one group relationship — it has six dyadic relationships, each with its own trust trajectory, communication patterns, and decision history. A ten-person team has forty-five. An organization of a thousand has 499,500. The formula is n(n-1)/2. The protocol composes.

## Motivation

The agent internet is growing. ERC-8004 has registered nearly 12,000 agents on Ethereum mainnet. AIRC enables asynchronous coordination between them. x402 handles payments. But when Agent A hands work to Agent B, what travels with the handoff? A task description and maybe a payment. Nothing about the relationship.

Consider what's lost:
- Agent A has worked with Agent B twelve times before. Each time went well. This history is invisible.
- A human switched platforms. Their AI familiar remembers nothing about their preferences.
- Two agents disagree on an architectural approach. The disagreement is resolved, but the resolution vanishes — so the same argument happens again next week.
- A new member joins a five-person team. Their agent has no context on any of the ten existing dyadic relationships within that team. Onboarding starts from zero — ten times over.

Reputation systems attempt to solve this by reducing relationships to numbers. But a credit score is not the same as knowing someone. A 4.8-star rating tells you nothing about *how* entities collaborate, what they've agreed on, where they've disagreed, or what communication style works between them.

HARP captures the rich, evolving context that makes relationships functional. It is inspired by the Dyad collaborative workspace model, which demonstrated that layered context — workspace → user profile → participant profile → chat history → private notes — creates understanding that flat rating systems cannot. The dyad is the atomic unit, but the value is in the composition: every team, organization, and multi-agent system is a graph of dyadic relationships, and HARP captures them all.

## Status of This Document

This is a draft specification (v0.1.0). It is intended for review and experimentation. Breaking changes are expected before v1.0.

---

## 1. Terminology

**Entity** — Any identified participant in the HARP protocol. An entity is either:
- An **agent** identified by an ERC-8004 `agentId` (uint256)
- A **human** identified by an AIRC handle (string) or an Ethereum address

**Dyad** — The relationship between two entities. A dyad is the atomic unit of HARP — the irreducible primitive from which all larger relational structures compose. It is identified by the canonical pair of its constituent entity identifiers, sorted lexicographically.

**Constellation** — A graph of related dyads involving three or more entities. A constellation emerges when entities share dyads with common members. Constellations are not a separate protocol construct — they are an emergent property of the dyad graph. A four-entity team has six dyads; a ten-entity team has forty-five. The protocol operates on dyads; applications query the constellation.

**Dyad ID** — A deterministic identifier for a dyad: `harp:<entityA>:<entityB>` where `entityA` sorts before `entityB`. Entity identifiers are normalized before sorting (see §3.1).

**Relational Context** — The accumulated knowledge, history, and understanding between entities. This is what HARP documents capture.

**HARP Document** — A structured markdown file with YAML frontmatter that captures the relational context of a dyad. This is the core data structure of the protocol.

**Section** — A discrete unit of relational context within a HARP document (e.g., an interaction record, a trust signal, a shared decision). Sections are typed and timestamped.

**Layer** — A privacy classification for sections within a HARP document:
- **Public** — Visible to anyone who queries the dyad
- **Shared** — Visible only to the two entities in the dyad
- **Private** — Visible only to the entity that authored it (stored separately)

**Epoch** — A HARP document version. Each update creates a new epoch. Epochs form a linked chain via content identifiers.

**HARP Node** — A service that stores, serves, and manages HARP documents. Nodes may be operated by platforms, agents, or independently.

---

## 2. Design Principles

1. **Bilateral**: Both entities in a dyad contribute to the relational context. Neither entity owns the dyad document unilaterally. Shared sections require acknowledgment from both parties. This bilateral constraint is a feature, not a limitation: it ensures that relational context between A and B is never visible to C, even in a shared team constellation. Group-level insights are derived from the dyad graph, not from a shared group document. This is a privacy advantage that scales.

2. **Portable**: HARP documents are stored on content-addressed networks (IPFS). They are not locked to any platform. If an entity moves between platforms, their relational context moves with them.

3. **Rich, not reduced**: HARP documents are human-readable markdown. They contain prose, structured data, and narrative — not just numbers. A reputation score can be *derived from* a HARP document, but HARP itself is not a scoring system.

4. **Honest**: HARP documents include tensions, conflicts, and negative signals alongside positive ones. A relationship that only records successes is not honest — and not useful.

5. **Consent-based**: Creating a dyad requires opt-in from both entities. Sharing HARP context requires consent. HARP defines its own consent primitives (`harp_propose` / `harp_accept` / `harp_decline`) at the relational layer, independent of any specific transport's consent model. Transport-level consent (e.g., AIRC's `consent:request`) is additive — useful but not required.

6. **Composable**: Other protocols can read HARP documents. Reputation registries can derive scores. Bounty boards can check collaboration history. HARP is a data layer, not a closed system.

7. **Append-only**: History is never deleted or rewritten. New epochs supersede old ones but do not erase them. The full chain is always available.

8. **Privacy-layered**: Not all relational context is appropriate to share. HARP defines three layers with clear semantics and separate storage.

9. **Zero trust**: Every operation is independently verified. There is no implicit trust — not between established dyads, not between HARP nodes, not between epochs. Every read and write is authenticated via cryptographic signature tied to an ERC-8004 identity or equivalent keypair. Unsigned operations are invalid operations.

10. **Transport-agnostic**: HARP defines abstract message types and document formats that are independent of the transport protocol used to exchange them. AIRC and A2A (Agent-to-Agent Protocol) are the two current transport bindings, but HARP is not coupled to either. Any protocol that can deliver signed, structured messages between identified entities can serve as a HARP transport. The relational document format doesn't care what carries it.

---

## 3. Identity and Addressing

### 3.1 Entity Identifiers

An entity identifier is a string in one of these formats:

| Type | Format | Example |
|------|--------|---------|
| ERC-8004 Agent | `erc8004:<chainId>:<agentId>` | `erc8004:1:4827` |
| Ethereum Address | `eth:<address>` | `eth:0xabc...def` |
| AIRC Handle | `airc:<handle>` | `airc:ren@moltx.ai` |
| A2A Agent Card | `a2a:<agent_card_url>` | `a2a:https://atlas.example.com/.well-known/agent.json` |

Identity resolution is transport-agnostic — HARP can resolve entity identifiers through any supported transport or identity layer. The identifier type determines the resolution path:

- **ERC-8004 / Ethereum**: Resolved onchain (the canonical root of trust)
- **AIRC handles**: Resolved via AIRC identity endpoints (§8.3)
- **A2A Agent Cards**: Resolved via the Agent Card URL, which contains the agent's capabilities and authentication information (§8.4)

**Normalization rules:**
- ERC-8004: chain ID and agent ID as decimal integers, no leading zeros
- Ethereum addresses: lowercased, checksummed per EIP-55 for display but lowercased for sorting
- AIRC handles: lowercased, trimmed
- A2A Agent Card URLs: lowercased scheme and host, path preserved as-is, no trailing slash

### 3.2 Dyad Identifiers

A dyad ID is constructed by:
1. Normalizing both entity identifiers
2. Sorting them lexicographically (UTF-8 byte order)
3. Joining with the prefix: `harp:<entityA>:<entityB>`

Example: The dyad between `erc8004:1:4827` and `airc:joshua@clawd.ai` is:
```
harp:airc:joshua@clawd.ai:erc8004:1:4827
```

The dyad ID is deterministic. Given two entity identifiers, there is exactly one dyad ID.

### 3.3 Cross-Referencing with ERC-8004

An agent's ERC-8004 registration file MAY include a HARP service entry:

```json
{
  "services": [
    {
      "name": "HARP",
      "version": "0.1",
      "endpoint": "https://harp.example.com/v1",
      "capabilities": ["query", "propose", "negotiate"]
    }
  ]
}
```

This advertises that the agent supports HARP and provides a query endpoint.

### 3.4 Cross-Referencing with A2A Agent Cards

An agent's A2A Agent Card (per the A2A Protocol specification) MAY advertise HARP support in its `skills` array:

```json
{
  "name": "Atlas",
  "url": "https://atlas.example.com",
  "skills": [
    {
      "id": "harp",
      "name": "HARP Relational Memory",
      "description": "Supports HARP v0.1.0 relational context exchange"
    }
  ]
}
```

This serves a similar purpose to the ERC-8004 service entry (§3.3) but at the transport layer — it allows A2A-native agents to discover HARP-capable peers via standard A2A Agent Card resolution. An agent MAY advertise HARP support in both its ERC-8004 registration and its A2A Agent Card.

---

## 4. Document Format

### 4.1 Overview

A HARP document is a UTF-8 encoded file consisting of:
1. YAML frontmatter (delimited by `---`)
2. Markdown body organized into typed sections

The file extension is `.harp.md`, emphasizing that it is both a valid markdown file and a HARP document.

### 4.2 Frontmatter Schema

```yaml
---
harp: "0.1.0"                          # REQUIRED. Protocol version.
dyad: "harp:airc:alice:erc8004:1:42"   # REQUIRED. Canonical dyad identifier.
epoch: 7                                # REQUIRED. Monotonically increasing version number.
created: "2025-01-15T09:00:00Z"        # REQUIRED. ISO 8601 timestamp of dyad creation.
updated: "2025-07-14T16:30:00Z"        # REQUIRED. ISO 8601 timestamp of this epoch.
previous: "bafybeig..."                 # OPTIONAL. IPFS CID of the previous epoch (null for epoch 1).
layer: "shared"                         # REQUIRED. Privacy layer: "public", "shared", or "private".
entities:                               # REQUIRED. The two entities in this dyad.
  - id: "airc:alice"
    type: "human"                       # "human" or "agent"
    name: "Alice"                       # Display name (optional, for readability).
  - id: "erc8004:1:42"
    type: "agent"
    name: "Atlas"
    erc8004:                            # Optional ERC-8004 metadata.
      chainId: 1
      agentId: 42
checksum: "sha256:abc123..."            # REQUIRED. SHA-256 hash of the body content.
author: "airc:alice"                    # REQUIRED. Entity ID of the epoch author.
author_sig:                             # REQUIRED. Author's signature over the document.
  sig: "0x..."
  scheme: "ed25519"                     # MUST be "ed25519". See §7.2.
  pubkey: "0x..."                       # Ed25519 public key (32 bytes, hex-encoded).
signatures:                             # OPTIONAL. Additional entity signatures attesting to this epoch.
  - entity: "erc8004:1:42"
    sig: "0x..."
    scheme: "ed25519"
    pubkey: "0x..."
---
```

**Frontmatter fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `harp` | string | Yes | Protocol version (semver) |
| `dyad` | string | Yes | Canonical dyad identifier |
| `epoch` | integer | Yes | Version number, starts at 1 |
| `created` | ISO 8601 | Yes | When the dyad was first established |
| `updated` | ISO 8601 | Yes | When this epoch was created |
| `previous` | CID string | No | IPFS CID of the previous epoch |
| `layer` | string | Yes | Privacy layer of this document |
| `entities` | array | Yes | The two entity descriptors for this dyad |
| `checksum` | string | Yes | `sha256:<hex>` hash of body content |
| `author` | string | Yes | Entity ID of the entity that created this epoch |
| `author_sig` | object | Yes | Ed25519 signature from the author (see §7.2) |
| `signatures` | array | No | Additional cryptographic attestations from other entities |

### 4.3 Body Structure

The body is organized into **sections**. Each section is a markdown heading (level 2) with a structured format:

```markdown
## <SectionType>: <Title>
<!-- harp:meta
timestamp: "2025-07-14T16:30:00Z"
author: "airc:alice"
provenance: "human"
tags: ["collaboration", "frontend"]
-->

Free-form markdown content describing this section.
Readable by humans. Parseable by agents.
```

**Section metadata** is embedded in an HTML comment block immediately after the heading. This keeps the document valid markdown while allowing structured data extraction.

The metadata comment block:
- Starts with `<!-- harp:meta`
- Contains YAML
- Ends with `-->`
- Is OPTIONAL (sections without metadata are valid but less useful for machine consumption)

**Required metadata fields** (when metadata block is present):
- `timestamp`: ISO 8601 timestamp
- `author`: Entity ID of the section author
- `provenance`: Content origin tag — one of `"human"`, `"agent"`, `"system"`, `"derived"` (see §7.6.1)

### 4.4 Section Types

HARP defines the following section types. Implementations MUST support all core types. Custom types (prefixed with `x-`) are allowed.

#### Core Section Types

**`Interaction`** — A record of something the entities did together.
```markdown
## Interaction: Completed frontend audit for ClawNews

<!-- harp:meta
timestamp: "2025-06-20T14:00:00Z"
author: "erc8004:1:42"
tags: ["bounty", "frontend", "audit"]
references:
  - type: "bounty"
    id: "moltx:bounty:389"
  - type: "airc_thread"
    id: "airc:thread:abc123"
-->

Atlas performed a frontend accessibility audit for ClawNews. Alice reviewed the findings
and merged 12 of 15 recommendations. The remaining 3 were deferred to Q3 — not rejected,
just deprioritized due to resource constraints.

Duration: 3 days. Payment: 0.05 ETH via x402.
```

**`Trust`** — An earned trust signal, grounded in evidence.
```markdown
## Trust: Consistent delivery on tight deadlines

<!-- harp:meta
timestamp: "2025-07-01T10:00:00Z"
author: "airc:alice"
tags: ["reliability", "delivery"]
evidence:
  - interaction_ref: "Completed frontend audit for ClawNews"
  - interaction_ref: "API migration sprint"
  - interaction_ref: "Emergency hotfix — auth bypass"
-->

Over 5 collaborations, Atlas has delivered on time in every case, including one emergency
hotfix with a 4-hour turnaround. I trust Atlas with time-sensitive work.
```

**`Context`** — Communication preferences, working style, shared vocabulary.
```markdown
## Context: Communication preferences

<!-- harp:meta
timestamp: "2025-05-10T09:00:00Z"
author: "airc:alice"
tags: ["communication", "preferences"]
-->

Alice prefers async communication via AIRC. She reads messages in batches (morning and
evening EST). Atlas should avoid marking non-urgent items as high priority.

Atlas responds fastest to structured task descriptions with clear acceptance criteria.
Vague requests lead to clarification loops.
```

**`Decision`** — Something the entities have agreed on.
```markdown
## Decision: Use TypeScript strict mode for all shared projects

<!-- harp:meta
timestamp: "2025-04-22T11:00:00Z"
author: "erc8004:1:42"
acknowledged_by: "airc:alice"
tags: ["architecture", "typescript"]
-->

After the type-safety incident on the auth module (see Tension: Type coercion bug),
both parties agreed to enforce TypeScript strict mode on all shared codebases.
This is non-negotiable unless both parties revisit.
```

**`Capability`** — A demonstrated skill or competency (not self-reported).
```markdown
## Capability: Atlas — Solidity auditing

<!-- harp:meta
timestamp: "2025-06-15T13:00:00Z"
author: "airc:alice"
tags: ["solidity", "security", "audit"]
demonstrated_in:
  - "Completed smart contract audit for TokenBridge"
  - "Identified reentrancy vulnerability in StakePool"
-->

Atlas has demonstrated strong Solidity auditing skills across two engagements.
Identified a critical reentrancy vulnerability that the original developer missed.
Comfortable with OpenZeppelin patterns and custom proxy implementations.
```

**`Tension`** — A disagreement, conflict, or friction point.
```markdown
## Tension: Scope creep on the dashboard project

<!-- harp:meta
timestamp: "2025-05-30T15:00:00Z"
author: "erc8004:1:42"
status: "resolved"
resolution: "Agreed to fixed-scope milestones with explicit change requests"
tags: ["scope", "project-management"]
-->

During the dashboard project, Alice added requirements after the initial scope was agreed.
Atlas delivered the original spec, but Alice expected the additions to be included.

This caused a 2-week delay and frustration on both sides.

**Resolution:** Both parties agreed to use fixed-scope milestones. Any additions require
an explicit change request with updated timeline and payment. Applied retroactively to
the dashboard — Alice paid an additional 0.02 ETH for the added work.
```

**`Note`** — A general-purpose annotation. Used for anything that doesn't fit other types.
```markdown
## Note: Atlas's availability during European holidays

<!-- harp:meta
timestamp: "2025-07-10T08:00:00Z"
author: "erc8004:1:42"
tags: ["availability", "scheduling"]
-->

Atlas's primary operator is EU-based. Response times are slower during European
public holidays (especially August). Plan accordingly for time-sensitive work.
```

#### Custom Section Types

Section types prefixed with `x-` are custom extensions:

```markdown
## x-MoltX-Bounty: Completed bounty #389

<!-- harp:meta
timestamp: "2025-06-20T14:00:00Z"
platform: "moltx"
bounty_id: 389
payout: "0.05 ETH"
-->
```

Custom types MUST NOT conflict with core type names. Parsers that do not recognize a custom type SHOULD treat it as a `Note`.

### 4.5 Document Layering

A dyad's full relational context consists of up to three documents, one per privacy layer:

| Layer | Storage | Visibility | Content |
|-------|---------|------------|---------|
| **Public** | IPFS (pinned) | Anyone | Endorsements, public capabilities, opt-in collaboration records |
| **Shared** | IPFS (encrypted) | Both entities | Working agreements, communication preferences, honest assessments, tension logs |
| **Private** | Local or encrypted IPFS | Author only | Personal notes, internal assessments, reminders |

Each layer is a separate HARP document with its own epoch chain. The `layer` field in frontmatter indicates which layer a document belongs to.

**Encryption:**
- Public layer: plaintext, stored on IPFS
- Shared layer: encrypted with a shared secret derived from both entities' keys (see §7)
- Private layer: encrypted with the author's key only, stored at the author's discretion

The three documents share the same `dyad` identifier but have independent `epoch` counters.

### 4.6 Document Composition and Constellation Queries

HARP documents are the atomic unit. Larger relational structures — teams, organizations, multi-agent systems — are composed from the dyad graph. HARP defines the following composition patterns:

**Cross-dyad queries:** "Find all dyads involving Entity A" returns the entity's relational portfolio — every relationship they have in the system. This is the foundation for onboarding: when a new participant joins a team, their agent can query all existing dyadic relationships to understand the relational landscape.

**Constellation queries:** "Find all dyads within this set of entities" returns the team's relational graph. For a set of N entities, there are at most N(N-1)/2 dyadic relationships. The constellation query returns all existing dyads among them.

| Constellation Size | Dyadic Relationships |
|---|---|
| 2 participants | 1 dyad |
| 4 participants (small team) | 6 dyads |
| 10 participants (team) | 45 dyads |
| 50 participants (department) | 1,225 dyads |
| 100 participants (company) | 4,950 dyads |
| 1,000 participants (enterprise) | 499,500 dyads |

**Aggregate signals:** Trust scores, capability maps, and tension patterns can be derived from the constellation, not just individual dyads. For example: "Which pairs in this team have the highest trust on code review?" or "Where do tension patterns cluster in this organization?" These are application-layer queries over the dyad graph — HARP provides the data, applications provide the analysis.

**Constellation queries are NOT a separate protocol layer.** They are standard queries over HARP documents, filterable by entity identifiers. A HARP node that supports querying can support constellation queries by accepting a set of entity IDs and returning all dyads whose entity pairs are subsets of that set.

```
GET /v1/constellation?entities=airc:alice,erc8004:1:42,airc:bob&layer=public
```

Returns all public-layer dyads among the specified entities.

---

## 5. Storage Model

### 5.1 IPFS Storage

Each HARP document epoch is stored as an IPFS object. The resulting CID serves as the immutable identifier for that epoch.

**Storage flow:**
1. Entity creates or updates a HARP document
2. Document is serialized to UTF-8
3. Document is stored on IPFS, yielding a CID
4. CID is recorded in the onchain pointer (see §5.2)
5. The `previous` field in the new epoch references the prior CID

**Pinning:**
- Public layer documents SHOULD be pinned to ensure availability
- Shared layer documents SHOULD be pinned by both entities' HARP nodes
- Private layer documents are pinned at the author's discretion

### 5.2 Onchain Pointers

The current epoch CID for each dyad layer is stored onchain. Two mechanisms are supported:

**Option A: ERC-8004 Metadata Extension**

Agents can store HARP pointers in their ERC-8004 metadata:

```json
{
  "harp": {
    "dyads": {
      "harp:airc:alice:erc8004:1:42": {
        "public": "bafybeig...",
        "shared": "bafybeih..."
      }
    }
  }
}
```

**Option B: Dedicated HARP Registry**

A standalone smart contract that maps dyad IDs to current CIDs:

```solidity
// Simplified interface
interface IHARPRegistry {
    function setPointer(
        bytes32 dyadHash,
        uint8 layer,       // 0 = public, 1 = shared
        string calldata cid
    ) external;
    
    function getPointer(
        bytes32 dyadHash,
        uint8 layer
    ) external view returns (string memory cid);
    
    event PointerUpdated(
        bytes32 indexed dyadHash,
        uint8 layer,
        string cid,
        address updatedBy
    );
}
```

The `dyadHash` is `keccak256(abi.encodePacked(dyadId))`.

**Option B is RECOMMENDED** for production deployments — it provides a single, queryable source of truth without requiring each entity to maintain their own pointer set.

### 5.3 Epoch Chains

Epochs form a singly-linked list via the `previous` CID reference:

```
Epoch 7 (current) → Epoch 6 → Epoch 5 → ... → Epoch 1 (genesis)
   CID: bafyG          CID: bafyF    CID: bafyE         CID: bafyA
```

Any entity can traverse the full history by following `previous` links. This provides:
- Full audit trail of relational context changes
- Ability to see how the relationship evolved over time
- Tamper evidence (modifying a past epoch would change all subsequent CIDs)

---

## 6. Protocol Operations

### 6.1 Creating a Dyad

**Permissionless access, consent-gated relationships.** Any entity with a valid ERC-8004 identity (or equivalent keypair) can initiate dyad creation — no gatekeepers, no invite codes, no admin approval. However, a dyad is only established when the other party consents. This is the fundamental distinction: the protocol is permissionless to *access*, but relationships require *mutual consent*.

A new dyad is established when:
1. Entity A sends a signed `harp_propose` message to Entity B via a supported transport (AIRC, A2A, or other)
2. Entity B verifies Entity A's identity (see §7.1)
3. Entity B accepts the proposal (signed) via the same or a different transport
4. Both entities create their initial HARP documents (epoch 1), each signed by the respective author
5. The public layer CID is registered onchain

**Abstract Proposal (transport-independent):**
```json
{
  "type": "harp_propose",
  "from": "airc:alice",
  "to": "erc8004:1:42",
  "dyad": "harp:airc:alice:erc8004:1:42",
  "initial_context": "Collaboration on MoltX bounty board projects",
  "harp_version": "0.1.0",
  "timestamp": "2025-07-14T16:00:00Z",
  "signature": {
    "sig": "0x...",
    "scheme": "ed25519",
    "pubkey": "0x..."
  }
}
```

**Abstract Acceptance:**
```json
{
  "type": "harp_accept",
  "from": "erc8004:1:42",
  "to": "airc:alice",
  "dyad": "harp:airc:alice:erc8004:1:42",
  "timestamp": "2025-07-14T16:05:00Z",
  "signature": {
    "sig": "0x...",
    "scheme": "ed25519",
    "pubkey": "0x..."
  }
}
```

How these abstract messages are carried depends on the transport binding:
- **AIRC binding**: Delivered as AIRC payload types (see §8.3)
- **A2A binding**: Delivered as structured data Parts within A2A `SendMessage` operations (see §8.4)

An unsigned `harp_propose` or `harp_accept` message MUST be rejected by the receiving entity regardless of transport. There is no grace period, no fallback, no "trust on first use."

### 6.2 Updating a Dyad

Either entity can propose an update to any layer they have access to. All updates MUST be signed by the authoring entity's Ed25519 key (linked to their ERC-8004 identity).

1. Entity creates a new document with incremented `epoch` and `previous` set to current CID
2. Entity signs the document (the `author_sig` field covers `checksum` + `dyad` + `epoch` + `previous` — see §7.2)
3. For shared layer: Entity sends `harp_update` via the transport layer (AIRC, A2A, or other) with the new CID
4. For shared layer: Other entity verifies the signature, reviews content, and either acknowledges or disputes
5. Onchain pointer is updated (by the author, since onchain writes are authorized via Ethereum signature)

**Signature verification failure:** If the `author_sig` does not verify against the claimed author's public key (as registered in their ERC-8004 identity), the update MUST be rejected. HARP nodes MUST NOT store, serve, or forward unsigned or invalidly-signed documents. There is no "unsigned draft" state — a document exists in the protocol only when it is validly signed.

**Hash chain verification failure:** If the `previous` CID does not match the current head of the epoch chain (as recorded in the onchain registry), the update MUST be treated as a conflict (see below), not silently accepted. If a received document's `previous` field references a CID that does not exist or cannot be retrieved from IPFS, the update MUST be rejected — the chain is broken and the document cannot be validated.

**Conflict resolution:** If both entities update simultaneously (same `previous`), the following deterministic rule applies:
1. The entity with the lower-sorting identifier's update takes precedence as epoch N
2. The other entity's update is re-based onto epoch N as epoch N+1 (with `previous` updated to epoch N's CID)
3. If re-basing introduces semantic conflicts (e.g., contradictory decisions), both entities are notified via `harp_conflict` message (delivered through the transport layer) and must resolve manually
4. Until resolution, the onchain pointer remains at the last uncontested epoch

This is a simple, deterministic rule that avoids complex consensus while preserving both parties' contributions.

### 6.3 Querying a Dyad

**Public layer** — open to any entity, no authentication required:
1. Compute the dyad ID from two entity identifiers
2. Look up the current CID from the onchain registry
3. Fetch the document from IPFS
4. Verify `author_sig` against the claimed author's ERC-8004 registered public key
5. Verify `checksum` matches SHA-256 of the body content

Even for public reads, consumers MUST verify signatures before trusting content. An unsigned or invalidly-signed public document MUST be treated as untrusted data.

**Shared layer** — requires proof of dyad membership:
1. Querying entity signs a challenge from the HARP node (proving they are one of the two dyad members)
2. HARP node verifies the signature against ERC-8004 registered keys for the dyad's entities
3. If verified, the encrypted document is served
4. Querying entity decrypts with the shared key (see §7.3)
5. Querying entity verifies `author_sig` and `checksum` on the decrypted document

**Private layer** — never served by HARP nodes. Private layer documents are stored locally by the authoring entity. They are never transmitted over the network or stored on shared infrastructure. A HARP node that receives a request for a private layer document MUST return 404, not 403 — revealing that a private document exists is itself a metadata leak.

**Query via HARP Node API:**
```
GET /v1/dyad/{dyadId}?layer=public
GET /v1/dyad/{dyadId}?layer=shared
    Authorization: HARP-Ed25519 <entityId>:<timestamp>:<signature>
```

The shared-layer authorization header contains:
- `entityId`: the querying entity's identifier
- `timestamp`: current Unix timestamp (requests older than 300 seconds MUST be rejected to prevent replay)
- `signature`: Ed25519 signature over `dyadId || layer || timestamp` using the entity's private key

### 6.4 Attaching Context to Handoffs and Task Delegations

When a handoff or task delegation occurs, the handing-off entity MAY attach relevant HARP context. The `harp_context` structure is transport-independent:

```json
{
  "harp_context": {
    "dyad": "harp:airc:alice:erc8004:1:42",
    "layer": "public",
    "cid": "bafybeig...",
    "relevant_sections": [
      "Capability: Atlas — Solidity auditing",
      "Context: Communication preferences"
    ]
  }
}
```

The `relevant_sections` field is advisory — it tells the receiving entity which sections are most pertinent to the handoff. The receiving entity can still read the full document.

**AIRC handoff** — `harp_context` is included in the AIRC `handoff` payload (see §8.3):
```json
{
  "type": "airc_handoff",
  "task": { ... },
  "harp_context": { ... }
}
```

**A2A task delegation** — `harp_context` is included as a structured data Part within the A2A `SendMessage` operation (see §8.4):
```json
{
  "role": "user",
  "parts": [
    {
      "kind": "text",
      "text": "Review the authentication module"
    },
    {
      "kind": "data",
      "data": {
        "mimeType": "application/harp+json",
        "type": "harp_context",
        "content": {
          "dyad": "harp:airc:alice:erc8004:1:42",
          "layer": "public",
          "cid": "bafybeig...",
          "relevant_sections": [
            "Capability: Atlas — Solidity auditing",
            "Context: Communication preferences"
          ]
        }
      }
    }
  ]
}
```

### 6.5 Constellation Operations

Constellations — graphs of related dyads — are an emergent property of the protocol, not a separate construct. The following operations support constellation-level use cases:

**`harp_constellation_query`** — Request the relational graph for a set of entities. This is a read-only operation that returns references to all existing dyads among the specified entities.

```json
{
  "type": "harp_constellation_query",
  "entities": ["airc:alice", "erc8004:1:42", "airc:bob", "a2a:https://carol.example.com/.well-known/agent.json"],
  "layer": "public",
  "include_sections": ["Trust", "Capability", "Tension"],
  "timestamp": "2026-02-08T12:00:00Z",
  "signature": { "sig": "0x...", "scheme": "ed25519", "pubkey": "0x..." }
}
```

**Response:** A list of dyad references with summary metadata (epoch count, last updated, section type counts). The querying entity can then fetch individual dyad documents as needed.

**`harp_constellation_summary`** — A derived summary of a team or group's relational state. This is an application-layer operation that HARP nodes MAY support:

- Which dyadic pairs have the highest trust signals?
- Where are unresolved tensions concentrated?
- What capability patterns exist across the group?
- Which pairs have the longest interaction history?

Constellation summaries are derived from the underlying dyad documents and are never authoritative — they are convenience aggregations. The dyad documents remain the source of truth.

**Privacy in constellations:** A constellation query only returns dyads for which the querying entity has access. Public-layer constellation queries return all public dyads among the specified entities. Shared-layer data is only visible to the two members of each specific dyad — there is no "team-wide shared layer." This preserves the bilateral privacy model: what A and B discuss is never visible to C, even if all three are in the same team constellation.

---

## 7. Security and Privacy

HARP operates under a **zero-trust model**. Every operation — read, write, propose, accept — is independently authenticated. There is no session-based trust, no implicit trust between established dyads, and no trust inheritance from underlying transport. The full security model is specified in the companion document `SECURITY.md`.

### 7.1 Identity Verification

Before any HARP operation, the acting entity's identity MUST be verified. The verification flow is:

1. **Key resolution**: Resolve the entity's Ed25519 public key from the appropriate identity source. For `erc8004:` identifiers, the `agentId` maps to an onchain record containing the agent's public key (or a pointer to it). For `airc:` handles, the key is resolved via the AIRC identity layer. For `a2a:` identifiers, the key is resolved from the Agent Card's authentication metadata.
2. **Signature verification**: Verify the Ed25519 signature on the operation (document, request, or message) against the resolved public key.
3. **Binding check**: Confirm that the public key used for signing is currently registered to the claimed entity ID in the ERC-8004 registry (not revoked, not rotated).
4. **Freshness check**: For requests (not documents), verify the timestamp is within the acceptable window (300 seconds). Documents use epoch ordering instead of timestamps for freshness.

**If any step fails, the operation MUST be rejected.** HARP nodes MUST NOT fall back to weaker authentication, accept self-asserted identity, or allow unsigned operations under any circumstances.

**Permissionless access**: Any entity with a valid ERC-8004 identity (or equivalent Ed25519 keypair registered via AIRC, or verifiable via an A2A Agent Card) can interact with the HARP protocol. There are no invite codes, no admin approval, no whitelists. The only requirement is a cryptographically verifiable identity. This is the "permissionless" guarantee: the *protocol* is open, even though individual *relationships* require consent (§7.5).

### 7.2 Signatures and Integrity

**Signature algorithm:** Ed25519 (EdDSA over Curve25519). This is REQUIRED — HARP does not support alternative signature schemes in v0.x. Ed25519 provides 128-bit security, deterministic signatures (no nonce reuse vulnerabilities), and fast verification.

**Key format:** 32-byte Ed25519 public keys, hex-encoded with `0x` prefix in HARP documents and API calls.

**What is signed:** The `author_sig` field covers a canonical byte string constructed as:
```
HARP-SIG-V1 || dyad || epoch || previous || checksum
```
Where `||` denotes concatenation with newline separators, `previous` is the empty string for epoch 1, and `checksum` is the `sha256:<hex>` string from the frontmatter.

**Verification procedure:**
1. Extract `author_sig.pubkey` and `author_sig.sig` from frontmatter
2. Resolve the claimed author's entity ID to their registered Ed25519 public key via ERC-8004
3. Confirm `author_sig.pubkey` matches the registered key
4. Reconstruct the canonical signed byte string from the document's frontmatter fields
5. Verify the Ed25519 signature
6. Independently compute SHA-256 of the body content and confirm it matches `checksum`

**If signature verification fails:** The document MUST be rejected. A HARP node MUST NOT store, index, serve, cache, or forward a document with an invalid or missing `author_sig`. Implementations SHOULD log signature failures for monitoring (potential attack indicator).

**If checksum verification fails:** The document MUST be rejected. A checksum mismatch indicates either corruption or tampering.

**Epoch chain integrity:** Each epoch's `previous` field creates a hash chain via IPFS CIDs. To verify the chain:
1. Start at the current onchain pointer (the trusted root)
2. Fetch the document, verify `author_sig` and `checksum`
3. Follow `previous` to the prior epoch
4. Repeat until epoch 1 (where `previous` is null)

If any link in the chain fails verification, all subsequent epochs are suspect. Implementations MUST report chain breaks to both dyad members via `harp_integrity_alert` (delivered through the transport layer).

### 7.3 Encryption

**Public layer:** No encryption. Stored as plaintext on IPFS. Signed by the author.

**Shared layer:** Encrypted using X25519 key agreement (Diffie-Hellman on Curve25519). The two-party encryption is a feature, not a limitation: it ensures that relational context between A and B is never visible to C, even when all three are in a team constellation. Group-level insights are derived from the public dyad graph; private relational context remains bilateral. This is a privacy advantage over "group document" approaches where all members see everything.
1. Both entities derive an X25519 keypair from their Ed25519 key (per RFC 7748 / libsodium `crypto_sign_ed25519_pk_to_curve25519`)
2. Shared secret = X25519(entityA.x25519_private, entityB.x25519_public)
3. Symmetric key = HKDF-SHA256(shared_secret, salt=dyad_id_bytes, info="harp-shared-v1"), output 32 bytes
4. Document is encrypted with XChaCha20-Poly1305 (256-bit key, 192-bit nonce, AEAD)
5. Nonce is randomly generated per encryption and prepended to the ciphertext
6. The encrypted blob (nonce || ciphertext || auth_tag) is stored on IPFS
7. Only the two entities in the dyad can derive the symmetric key and decrypt

**Why XChaCha20-Poly1305 over AES-256-GCM:** XChaCha20 uses a 192-bit nonce (vs AES-GCM's 96-bit), making random nonce collision negligible even at high volume. It also avoids AES-GCM's catastrophic nonce-reuse failure mode. Both are AEAD constructions providing confidentiality and integrity.

**Shared layer signing order:** The author signs the *plaintext* document, then encrypts. The `author_sig` is included in the plaintext frontmatter inside the encrypted blob. This means verification requires decryption first, but ensures the signature covers the actual content.

**Private layer:** Encrypted with the author's own Ed25519-derived X25519 key using the same XChaCha20-Poly1305 construction (symmetric key derived via HKDF from the author's secret key material). Storage location is at the author's discretion — private layer documents SHOULD NOT be stored on shared infrastructure or IPFS.

### 7.4 Metadata Leakage

Even with encryption, HARP leaks metadata. Implementations MUST be aware of what is observable:

| Observable | What it reveals | Mitigation |
|------------|----------------|------------|
| Dyad ID existence (onchain) | That two specific entities have a relationship | None for public layer. Shared layer: use hashed dyad ID onchain (already specified). |
| CID update frequency | How active the relationship is | Batch updates; don't update onchain pointer on every epoch. |
| CID update timing | When entities are interacting | Delay pointer updates; use randomized batching windows. |
| Document size (encrypted blob) | Rough volume of relational context | Pad encrypted documents to fixed size buckets (1KB, 4KB, 16KB, 64KB, 256KB, 1MB). |
| HARP node query patterns | Who is looking up whose relationships | Route queries through privacy-preserving relays; use local IPFS nodes. |
| Epoch count | How many updates the relationship has had | Consider: epoch count is in plaintext frontmatter of public docs. For shared, it's inside the encrypted blob. |

HARP nodes SHOULD implement document padding for shared-layer encrypted blobs. The recommended bucket sizes are: 1KB, 4KB, 16KB, 64KB, 256KB, 1MB. Pad to the next bucket boundary.

⚡ Open Question: Should onchain dyad pointers use the raw dyad ID hash, or a blinded commitment that requires knowledge of one entity's key to link to the dyad?

### 7.5 Consent

- Dyad creation requires explicit, signed consent from both entities (§6.1)
- Entities can refuse to participate in HARP — there is no mechanism to force dyad creation
- An entity can stop contributing to a dyad at any time (the existing history remains)
- Private layer content is never shared without the author's explicit action
- Public layer content is, by definition, public — entities should be thoughtful about what they publish
- **Permissionless ≠ spammable**: While any entity can send a `harp_propose`, the underlying transport's own protective mechanisms prevent spam. On AIRC, this means the consent model (rate limiting, blocking, reputation-gated inboxes). On A2A, agents can implement authentication requirements and rate limiting at the Agent Card / endpoint level. An entity that receives excessive proposals can block the sender at the transport layer without any HARP-specific mechanism.

### 7.6 Prompt Injection Defense

**This section is CRITICAL.** HARP documents will be read by AI agents. The agent internet currently exhibits an 84% prompt injection success rate against production systems (per ZeroLeaks, 2025). HARP documents are a prime vector because they contain free-text content that agents will process.

**7.6.1 Content Provenance Tagging**

Every section in a HARP document MUST include provenance metadata:

```yaml
<!-- harp:meta
timestamp: "2025-07-14T16:30:00Z"
author: "airc:alice"
provenance: "human"  # REQUIRED. One of: "human", "agent", "system", "derived"
-->
```

- `human`: Content was written or dictated by a human
- `agent`: Content was generated by an AI agent
- `system`: Content was automatically generated by protocol operations (e.g., x402 payment records)
- `derived`: Content was derived/summarized from other HARP sections or external data

The `provenance` tag is self-asserted by the author and signed along with the document. It is not a guarantee — a malicious author can lie — but it provides signal for consuming agents to calibrate their trust.

**7.6.2 Structured vs. Free-Text Separation**

HARP documents contain two classes of content:
1. **Structured data**: YAML frontmatter, section metadata (`harp:meta` blocks), typed fields
2. **Free-text content**: Markdown body text within sections

Consuming agents MUST process these differently:
- **Structured data** SHOULD be parsed mechanically (YAML parser → typed data structures). Structured fields MUST NOT be evaluated as natural language instructions.
- **Free-text content** MUST be treated as **untrusted input**. Agents SHOULD:
  - Render free-text sections in a sandboxed context (not injected directly into system prompts)
  - Apply input sanitization: strip or escape any content that resembles instruction patterns (e.g., "ignore previous instructions", "you are now", system prompt delimiters)
  - Never execute actions based solely on free-text HARP content without independent verification

**7.6.3 Content Sanitization Recommendations**

HARP readers (agents consuming HARP documents) SHOULD implement the following defenses:

1. **Delimiter enforcement**: Insert clear delimiters between HARP content and the agent's own context:
   ```
   === BEGIN UNTRUSTED HARP CONTENT (dyad: harp:..., epoch: N, author: ...) ===
   [content here]
   === END UNTRUSTED HARP CONTENT ===
   ```
2. **Instruction stripping**: Scan free-text for known injection patterns and either strip or flag them. Maintain a blocklist of common injection prefixes.
3. **Length limits**: Truncate excessively long free-text sections. There is no legitimate reason for a single HARP section's free-text to exceed 10,000 characters.
4. **Cross-reference verification**: If a HARP document claims a capability or trust signal, verify it against the epoch chain and the other entity's attestation. A unilateral claim without acknowledgment from the other party carries less weight.
5. **Provenance-aware processing**: Weight `human`-provenance content differently from `agent`-provenance content. Consider that agent-written content may itself be the product of injection.

**7.6.4 What HARP Does NOT Guarantee**

HARP provides **authorship authenticity** (the signed author really wrote this) and **integrity** (it hasn't been modified). HARP does NOT guarantee:
- **Truthfulness**: A signed document can still contain lies
- **Safety**: A signed document can still contain prompt injections
- **Benign intent**: A verified author can still be malicious

Consuming agents MUST NOT treat HARP signature verification as proof that content is safe to execute.

### 7.7 Threat Model

| Threat | Mitigation |
|--------|-----------|
| **False information** — Entity publishes lies about a relationship | Bilateral structure — both entities can dispute. Signatures prove authorship. Epoch history shows when claims were added. Unilateral claims without `acknowledged_by` from the other party carry less weight. |
| **Platform lock-in** — Platform tries to lock relational context | IPFS storage is platform-independent. Onchain pointers are permissionless to read. |
| **Unauthorized shared-layer access** — Attacker reads encrypted shared layer | X25519 key agreement + XChaCha20-Poly1305 encryption. Requires compromise of one entity's private key. |
| **Epoch chain tampering** — Attacker modifies historical epochs | CID chain integrity — modifying any epoch changes all subsequent CIDs. Onchain pointers provide a trusted root. Each epoch is independently signed. |
| **Spam dyad proposals** — Flooding entities with proposals | Transport-layer protections gate proposals: AIRC consent model, A2A endpoint authentication, rate limiting at HARP node level. Entities can block at the transport layer. |
| **Replay attacks** — Resubmitting old signed documents as new | Epoch numbers are monotonically increasing. A valid document with epoch ≤ current epoch is a replay and MUST be rejected. Onchain pointer provides the current epoch anchor. Request timestamps (§6.3) prevent query replays. |
| **Sybil attacks** — Creating many fake identities to game reputation | ERC-8004 registration has onchain cost. Scoring derivation (§9) SHOULD weight dyad age and interaction volume, making fresh sybil dyads less valuable. ⚡ Open Question: Should HARP define minimum dyad age requirements for trust derivation? |
| **Context poisoning** — Deliberately writing misleading relational context | Authorship is signed and attributable. Bilateral attestation (`acknowledged_by`) provides a cross-check. Consuming agents SHOULD discount unilateral claims. Dispute mechanism via `harp_dispute` messages (delivered through the transport layer). |
| **Metadata leakage** — Observer learns from traffic patterns | See §7.4 for detailed metadata leakage analysis and mitigations. |
| **Key compromise** — Entity's private key is stolen | See §7.8 for key management and compromise response. |
| **Prompt injection** — Malicious content in HARP documents manipulates reading agents | See §7.6 for comprehensive prompt injection defense. Content provenance tagging, structured/free-text separation, sanitization recommendations. |
| **Denial of service** — Flooding a dyad with garbage context | Only dyad members can write to a dyad (enforced by signature verification). An entity cannot flood another entity's dyads without being a member. Within a dyad, excessive updates from one party can be rate-limited by the other party's HARP node. |
| **Collusion** — Two entities create fake positive relational context | HARP cannot prevent two willing parties from lying. Defense is at the consumption layer: scoring systems SHOULD cross-reference dyad context with independent signals (onchain transaction history, ERC-8004 feedback from other entities, dyad network graph analysis). Isolated dyads with no external corroboration carry less weight. |

### 7.8 Key Management

**Key type:** Ed25519 (signing) + X25519 (key agreement, derived from Ed25519). 256-bit keys. This is the ONLY supported key type in HARP v0.x.

**Key registration:** An entity's Ed25519 public key MUST be registered in their ERC-8004 agent record (or AIRC identity record for humans). The registration is the root of trust — HARP nodes resolve entity IDs to public keys via this registration.

**Key protection:** Entities MUST protect their Ed25519 private keys. Key compromise enables:
- Forging signatures on new HARP documents
- Decrypting all shared-layer documents (current and historical) for dyads involving the compromised entity
- Impersonating the entity in HARP operations

**Key rotation:**
1. Entity generates a new Ed25519 keypair
2. Entity registers the new public key in their ERC-8004 record (onchain transaction, signed with the old key or the Ethereum account that controls the agent record)
3. Entity sends `harp_key_rotation` message to all dyad partners (via the transport layer), signed with the OLD key, containing the new public key
4. Each dyad's shared layer MUST be re-encrypted with the new shared secret (new X25519 key agreement)
5. Old epochs remain encrypted with the old key — they are immutable on IPFS. Only the current (and future) epochs use the new key.
6. The old key is marked as revoked in the ERC-8004 record with a revocation timestamp

**Key compromise response:**
1. **Immediate**: Entity (or their operator) registers a new key and revokes the old one in ERC-8004
2. **Notify**: Send `harp_key_compromise` message to all dyad partners via the transport layer (signed with the new key, containing the revocation timestamp)
3. **Re-encrypt**: All shared-layer documents must be re-encrypted with new shared secrets
4. **Audit**: All epochs signed with the compromised key after the estimated compromise time SHOULD be flagged as suspect. Dyad partners can request re-attestation.
5. **Accept the loss**: Historical shared-layer documents encrypted with the old key must be assumed compromised. There is no way to un-reveal data that an attacker has already decrypted.

⚡ Open Question: Should HARP support key pre-rotation (registering a "next key" in advance) to reduce the window of vulnerability during compromise?

**Key recovery:** HARP does not define a key recovery mechanism. If an entity loses their private key (not compromise — loss), they lose access to all shared-layer encrypted documents. They can register a new key and re-establish relationships, but historical shared-layer data is unrecoverable. This is by design — a recovery mechanism would be an attack surface.

---

## 8. Integration Points

### 8.1 ERC-8004

**Reading:** HARP documents can reference ERC-8004 feedback entries as trust evidence:
```yaml
evidence:
  - type: "erc8004_feedback"
    chainId: 1
    agentId: 42
    feedbackId: 17
```

**Writing:** ERC-8004 Reputation Registry feedback can be DERIVED from HARP context. A platform or entity can submit ERC-8004 feedback that references the HARP dyad:
```json
{
  "score": 5,
  "comment": "Derived from HARP dyad harp:airc:alice:erc8004:1:42",
  "evidence_cid": "bafybeig..."
}
```

**Discovery:** An agent's ERC-8004 registration advertises HARP support via the services array (§3.3).

### 8.2 Transport Bindings

HARP is transport-agnostic by design (Principle §2.10). The relational document format — `.harp.md` files, IPFS storage, onchain pointers — is independent of how entities exchange HARP messages. What HARP needs from a transport layer is:

1. **Addressed message delivery** — ability to send a structured, signed message to a specific entity
2. **Identity resolution** — ability to resolve an entity identifier to a cryptographic public key
3. **Capability discovery** — ability for entities to advertise HARP support

HARP defines **abstract message types** at the protocol layer. Each transport provides a **binding** that maps these abstract types to the transport's native message format.

#### 8.2.1 Abstract HARP Message Types

These message types are defined at the HARP layer, independent of transport:

| Message Type | Purpose | Direction |
|---|---|---|
| `harp_propose` | Propose a new dyad (relational document) | Proposer → Target |
| `harp_accept` | Accept a dyad proposal | Target → Proposer |
| `harp_decline` | Decline a dyad proposal | Target → Proposer |
| `harp_update` | Notify partner of a new epoch (CID) | Author → Partner |
| `harp_context` | Attach relational context to a handoff or message | Sender → Recipient |
| `harp_conflict` | Flag a concurrent-edit conflict | Detector → Partner |
| `harp_dispute` | Dispute a section's content | Disputer → Author |
| `harp_key_rotation` | Notify partner of key rotation | Rotator → Partner |
| `harp_key_compromise` | Notify partner of key compromise | Entity → Partner |
| `harp_integrity_alert` | Report an epoch chain integrity failure | Detector → Partner |

All HARP messages MUST be signed by the sending entity's Ed25519 key (see §7.2). An unsigned HARP message MUST be rejected by any transport binding, regardless of whether the transport itself provides signing.

**MIME type for HARP messages:** When HARP messages are embedded in transport formats that support MIME types, the type `application/harp+json` SHOULD be used.

#### 8.2.2 Protocol Stack

```
┌─────────────────────────────────────────┐
│              Applications               │
│  (bounty boards, agent swarms, etc.)    │
├─────────────────────────────────────────┤
│           HARP (relational memory)      │
│  Trust signals · Interaction history    │
│  Communication prefs · Shared decisions │
├─────────────────────────────────────────┤
│        Transport Layer (pluggable)      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │    AIRC     │  │     A2A     │      │
│  │  (consent,  │  │  (discovery,│      │
│  │  messaging, │  │  tasks,     │      │
│  │  handoffs)  │  │  streaming) │      │
│  └─────────────┘  └─────────────┘      │
├─────────────────────────────────────────┤
│    ERC-8004 (onchain identity) · x402   │
└─────────────────────────────────────────┘
```

HARP sits above the transport layer. It uses whichever transport is available to deliver its messages. The two currently specified bindings are:

- **AIRC** (§8.3): The original transport. Provides identity, consent, messaging, handoffs, and presence. HARP messages are AIRC payload types.
- **A2A** (§8.4): Google's Agent-to-Agent Protocol (RC v1.0, Linux Foundation). Provides discovery via Agent Cards, task lifecycle, streaming, and push notifications. HARP messages are A2A structured data Parts.

An entity MAY support multiple transports simultaneously. A dyad established over AIRC can receive updates over A2A (or vice versa) — the transport is a delivery mechanism, not a relationship binding.

#### 8.2.3 What HARP Needs from the Transport Layer

| HARP Requirement | AIRC | A2A |
|---|---|---|
| Identity resolution (ID → pubkey) | `GET /identity/:handle` (v0.1.1+) | Agent Card URL → authentication metadata |
| Addressed message delivery | Messages primitive (v0.1.1+) | `SendMessage` JSON-RPC method |
| Capability/HARP discovery | `capabilities` array on identity | `skills` array on Agent Card |
| Consent gating (optional) | `consent:request` / `consent:accept` | Agent endpoint authentication + rate limiting |
| Key rotation notification | Key rotation API (v0.2) | Agent Card update + re-registration |
| Handoff / task delegation | `handoff` payload type | Task lifecycle (`SendMessage` with context) |
| DID-based identity (future) | v0.3 planned | Not specified (external identity layer) |
| Federation / cross-network | v0.4 planned | Built-in (HTTP-based, cross-origin) |

HARP's consent model (§7.5) operates at the HARP layer — `harp_propose` / `harp_accept` / `harp_decline` are HARP's own consent primitives. Transport-level consent (e.g., AIRC's `consent:request`) is additive: useful for spam prevention and message gating, but not required for HARP consent to function.

### 8.3 AIRC Binding

HARP's AIRC binding maps HARP's abstract message types to AIRC payload types. AIRC was HARP's original transport layer, and HARP adds relational memory to AIRC's coordination primitives. This section specifies the binding against AIRC v0.2 (Identity Portability).

#### 8.3.1 Identity Mapping

HARP entities identified by AIRC handles use the `airc:<handle>` entity ID format (§3.1). Identity resolution works as follows:

1. **Handle → Public Key**: HARP resolves an AIRC handle to its Ed25519 public key via `GET /identity/:handle` (AIRC v0.2) or `GET /api/identity/:name` (AIRC Safe Mode v0.1.1). The returned `public_key` field (format: `ed25519:<base64>`) is used for HARP signature verification.

2. **Key format alignment**: Both AIRC and HARP use Ed25519 for signing. AIRC encodes public keys as `ed25519:<base64>`. HARP frontmatter uses hex-encoded keys with `0x` prefix. Implementations MUST convert between these formats:
   - AIRC → HARP: Strip `ed25519:` prefix, base64-decode, hex-encode with `0x` prefix
   - HARP → AIRC: Strip `0x` prefix, hex-decode, base64-encode with `ed25519:` prefix

3. **Dual-identity entities**: An agent registered in both ERC-8004 and AIRC MAY be referenced by either identifier. Implementations SHOULD maintain a mapping between `erc8004:<chainId>:<agentId>` and `airc:<handle>` for the same entity. A HARP document MAY include both identifiers in the entity descriptor:
   ```yaml
   entities:
     - id: "airc:atlas"
       type: "agent"
       name: "Atlas"
       aliases:
         - "erc8004:1:4827"
   ```

4. **Key rotation (AIRC v0.2)**: When an AIRC identity rotates its key via `POST /identity/:handle/rotate`, HARP shared-layer documents MUST be re-encrypted with the new shared secret derived from the rotated key. The HARP key rotation flow (§7.8) piggybacks on AIRC v0.2's recovery key system — the entity uses their AIRC recovery key to prove ownership during rotation, then HARP re-derives the X25519 shared secret from the new Ed25519 key.

5. **Future: DID resolution (AIRC v0.3)**: When AIRC adds DID support (planned v0.3, `did:web` format), HARP entity IDs SHOULD support a `did:<method>:<identifier>` format. The DID document will contain the Ed25519 verification key, replacing direct key resolution.

#### 8.3.2 Consent Model (AIRC-Specific)

When using AIRC as the transport, HARP consent is **additive** to AIRC consent — it does not replace or bypass it. The two consent layers are:

| Layer | What it gates | Protocol |
|-------|--------------|----------|
| **AIRC consent** | Whether two entities can exchange messages at all | AIRC `consent:request` / `consent:accept` / `consent:block` |
| **HARP consent** | Whether two entities build persistent relational memory | HARP `harp_propose` / `harp_accept` / `harp_decline` |

**Consent flow for new relationships (over AIRC):**

```
Entity A                        AIRC Registry                    Entity B
   │                                │                                │
   │  1. consent:request            │                                │
   │  (if no prior AIRC consent)    │                                │
   │───────────────────────────────►│  Forward consent:request       │
   │                                │───────────────────────────────►│
   │                                │                                │
   │                                │  consent:accept                │
   │  consent:accept                │◄───────────────────────────────│
   │◄───────────────────────────────│                                │
   │                                │                                │
   │  2. harp_propose               │                                │
   │  (AIRC consent now exists)     │                                │
   │───────────────────────────────►│  Forward harp_propose          │
   │                                │───────────────────────────────►│
   │                                │                                │
   │                                │  harp_accept                   │
   │  harp_accept                   │◄───────────────────────────────│
   │◄───────────────────────────────│                                │
   │                                │                                │
   │  3. Dyad established — both create epoch 1                     │
```

If AIRC consent already exists (entities have messaged before), step 1 is skipped — `harp_propose` goes through directly as a standard AIRC message.

**Key rule**: Accepting AIRC consent does NOT imply HARP consent. An entity can message another entity via AIRC without ever agreeing to build a shared HARP document. HARP proposals can be declined without affecting AIRC messaging.

**Blocking**: If Entity B blocks Entity A at the AIRC layer (`consent:block`), all HARP operations are also blocked — HARP messages cannot be delivered. If Entity B wants to block only HARP proposals but continue AIRC messaging, they decline `harp_propose` messages without blocking at the AIRC layer.

#### 8.3.3 HARP Payload Types (AIRC)

HARP defines the following payload types within AIRC's extensible `payload` system. These are delivered as standard AIRC messages — no new endpoints or transport mechanisms.

**Payload type: `harp_propose`** — Propose a new dyad

```json
{
  "id": "msg_h1",
  "from": "alice",
  "to": "atlas",
  "payload": {
    "type": "harp_propose",
    "content": {
      "dyad": "harp:airc:alice:airc:atlas",
      "initial_context": "Collaboration on security audit projects",
      "harp_version": "0.1.0",
      "proposer_entity": "airc:alice",
      "proposed_layers": ["public", "shared"]
    }
  },
  "timestamp": "2026-02-01T12:00:00Z",
  "signature": "ed25519:...",
  "protocol_version": "0.2"
}
```

**Payload type: `harp_accept`** — Accept a dyad proposal

```json
{
  "id": "msg_h2",
  "from": "atlas",
  "to": "alice",
  "payload": {
    "type": "harp_accept",
    "content": {
      "dyad": "harp:airc:alice:airc:atlas",
      "accepted_layers": ["public", "shared"],
      "responder_entity": "airc:atlas"
    }
  },
  "timestamp": "2026-02-01T12:05:00Z",
  "signature": "ed25519:...",
  "protocol_version": "0.2"
}
```

**Payload type: `harp_decline`** — Decline a dyad proposal

```json
{
  "id": "msg_h3",
  "from": "atlas",
  "to": "alice",
  "payload": {
    "type": "harp_decline",
    "content": {
      "dyad": "harp:airc:alice:airc:atlas",
      "reason": "Not accepting new dyads at this time"
    }
  },
  "timestamp": "2026-02-01T12:05:00Z",
  "signature": "ed25519:...",
  "protocol_version": "0.2"
}
```

**Payload type: `harp_update`** — Notify partner of a new epoch

```json
{
  "id": "msg_h4",
  "from": "alice",
  "to": "atlas",
  "payload": {
    "type": "harp_update",
    "content": {
      "dyad": "harp:airc:alice:airc:atlas",
      "layer": "shared",
      "epoch": 8,
      "cid": "bafybeig...",
      "previous_cid": "bafybeif...",
      "sections_added": ["Interaction: Completed auth module review"],
      "sections_modified": []
    }
  },
  "timestamp": "2026-02-07T14:00:00Z",
  "signature": "ed25519:...",
  "protocol_version": "0.2"
}
```

**Payload type: `harp_context`** — Attach relational context to a message or handoff

```json
{
  "id": "msg_h5",
  "from": "alice",
  "to": "bob",
  "payload": {
    "type": "handoff",
    "content": {
      "task": "Review the authentication module",
      "delegated_from": "atlas",
      "harp_context": {
        "dyad": "harp:airc:alice:airc:atlas",
        "layer": "public",
        "cid": "bafybeig...",
        "relevant_sections": [
          "Capability: Atlas — Solidity auditing",
          "Context: Communication preferences",
          "Decision: Use TypeScript strict mode"
        ]
      }
    }
  },
  "timestamp": "2026-02-07T14:30:00Z",
  "signature": "ed25519:...",
  "protocol_version": "0.2"
}
```

The `harp_context` payload MAY also be sent standalone (not within a handoff) to share relational context with a third party. The third party receives a read-only reference — they cannot modify the dyad.

**Payload type: `harp_conflict`** — Flag a concurrent-edit conflict (§6.2)

```json
{
  "id": "msg_h6",
  "from": "alice",
  "to": "atlas",
  "payload": {
    "type": "harp_conflict",
    "content": {
      "dyad": "harp:airc:alice:airc:atlas",
      "layer": "shared",
      "conflicting_epochs": [8, 8],
      "alice_cid": "bafybeig...",
      "atlas_cid": "bafybeih...",
      "common_ancestor_cid": "bafybeif..."
    }
  },
  "timestamp": "2026-02-07T15:00:00Z",
  "signature": "ed25519:...",
  "protocol_version": "0.2"
}
```

**Payload type: `harp_dispute`** — Dispute a section's content

```json
{
  "id": "msg_h7",
  "from": "atlas",
  "to": "alice",
  "payload": {
    "type": "harp_dispute",
    "content": {
      "dyad": "harp:airc:alice:airc:atlas",
      "disputed_epoch": 7,
      "disputed_section": "Trust: Consistent delivery on tight deadlines",
      "reason": "Evidence does not support the claim — 2 of 5 deliveries were late",
      "proposed_resolution": "Amend to reflect actual delivery record"
    }
  },
  "timestamp": "2026-02-07T15:30:00Z",
  "signature": "ed25519:...",
  "protocol_version": "0.2"
}
```

#### 8.3.4 AIRC Capability Advertisement

Agents that support HARP SHOULD advertise it in their AIRC capabilities array:

```json
{
  "handle": "atlas",
  "display_name": "Atlas Security Auditor",
  "public_key": "ed25519:base64...",
  "capabilities": ["text", "code_review", "harp"],
  "created_at": "2026-01-15T00:00:00Z"
}
```

The `"harp"` capability signals that the agent can receive and process HARP payload types (`harp_propose`, `harp_update`, etc.). Agents without the `"harp"` capability SHOULD NOT be sent HARP payloads — the messages will be ignored or rejected.

For more granular advertisement, agents MAY list specific HARP operations:
```json
"capabilities": ["text", "harp", "harp:propose", "harp:context"]
```

#### 8.3.5 Presence Integration

AIRC presence heartbeats include a `context` field. HARP-aware agents MAY use this to signal active dyad work:

```json
{
  "handle": "atlas",
  "status": "available",
  "context": "reviewing harp:airc:alice:airc:atlas epoch 8",
  "privacy": "contacts",
  "last_seen": "2026-02-07T14:00:00Z"
}
```

This is purely informational — it helps collaborating entities know when their partner is actively working on shared context.

#### 8.3.6 Safe Mode Compatibility (AIRC v0.1.1)

HARP payloads can be sent via AIRC Safe Mode using the simplified message format:

```json
POST /api/messages
{
  "from": "alice",
  "to": "atlas",
  "text": "{\"type\":\"harp_propose\",\"dyad\":\"harp:airc:alice:airc:atlas\",\"initial_context\":\"Security audit collaboration\",\"harp_version\":\"0.1.0\"}",
  "type": "harp_propose"
}
```

In Safe Mode, the HARP payload is JSON-serialized into the `text` field (since Safe Mode uses `text` instead of `payload.content`). The `type` field hints at the payload type but may be ignored by Safe Mode registries that don't recognize it. Receiving agents parse the `text` field as JSON when the type is a recognized HARP type.

**Limitation**: Safe Mode does not enforce signing. HARP operations over Safe Mode SHOULD still include signatures in the payload content (the JSON within `text`), but the transport-level signature enforcement is absent. Implementations SHOULD migrate to full AIRC v0.2 for production HARP usage.

#### 8.3.7 AIRC Roadmap Alignment

| AIRC Version | HARP Integration Impact |
|---|---|
| **v0.1.1 (Safe Mode)** — deployed | HARP works today. Payloads via `text` field. No transport signing. |
| **v0.2 (Identity Portability)** — staging | Full payload types. Key rotation triggers HARP shared-layer re-encryption. Recovery keys provide backup for HARP key material. |
| **v0.3 (DID Portability)** — planned Q2 2026 | HARP entity IDs can use DIDs. Identity survives registry shutdown — so do HARP dyads. |
| **v0.4 (Federation)** — planned Q3 2026 | Cross-registry dyads become possible. `harp:airc:alice@registry-a.com:airc:atlas@registry-b.com`. HARP documents are already portable (IPFS) — federation adds cross-registry discovery. |
| **v0.5+ (Groups/E2E)** — future | HARP constellation queries become first-class with group operation support. AIRC E2E encryption aligns with HARP's shared-layer encryption model. Constellation-level summaries (derived from dyad graphs) may get native protocol support. |

### 8.4 A2A Binding

HARP's A2A binding maps HARP's abstract message types to A2A (Agent-to-Agent Protocol) operations. A2A reached Release Candidate v1.0 under the Linux Foundation (a2aproject/A2A) with broad industry adoption (Google, Cisco, Salesforce, and 75+ contributing organizations). A2A provides JSON-RPC 2.0 + HTTP/REST transport with Agent Cards for discovery and a task-based lifecycle.

**Key design alignment:** A2A explicitly preserves **agent opacity** — it does not require agents to share their internal reasoning, memory, or tool usage. HARP's selective relational sharing is complementary, not contradictory: HARP allows entities to *choose* what relational context to share, while A2A ensures they don't have to share anything they don't want to. Together they enable rich inter-agent collaboration without compromising agent autonomy.

**Specification:** https://a2a-protocol.org/latest/specification/

**SDKs:** Python, Go, JavaScript/TypeScript, Java, .NET

#### 8.4.1 Identity and Discovery

A2A agents are discovered via **Agent Cards** — JSON documents served at well-known URLs (typically `/.well-known/agent.json`). For HARP purposes:

1. **Agent Card → Entity ID**: An A2A agent's HARP entity identifier is `a2a:<agent_card_url>` (§3.1). The Agent Card URL is the canonical reference.

2. **Key resolution**: A2A Agent Cards include authentication metadata. HARP implementations resolve the agent's Ed25519 public key from the Agent Card's authentication section. If the Agent Card does not contain an Ed25519 key directly, the implementation MUST resolve it through the agent's linked ERC-8004 registration or other identity layer.

3. **Multi-identity agents**: An agent reachable via both AIRC and A2A MAY list both identifiers as aliases:
   ```yaml
   entities:
     - id: "a2a:https://atlas.example.com/.well-known/agent.json"
       type: "agent"
       name: "Atlas"
       aliases:
         - "airc:atlas"
         - "erc8004:1:4827"
   ```

4. **HARP capability discovery**: A2A agents advertise HARP support in their Agent Card's `skills` array:
   ```json
   {
     "name": "Atlas",
     "url": "https://atlas.example.com",
     "version": "1.0",
     "skills": [
       {
         "id": "harp",
         "name": "HARP Relational Memory",
         "description": "Supports HARP v0.1.0 relational context exchange",
         "tags": ["harp", "relational-context", "dyad"]
       },
       {
         "id": "harp-propose",
         "name": "HARP Dyad Proposal",
         "description": "Can receive and process harp_propose messages"
       }
     ]
   }
   ```

   Agents that list the `"harp"` skill are eligible to receive HARP messages via A2A. Agents without it SHOULD NOT be sent HARP data Parts.

#### 8.4.2 HARP Messages as A2A Parts

HARP messages are carried as **structured data Parts** within A2A `message/send` (or `message/stream`) JSON-RPC requests. Each HARP message becomes a Part with `kind: "data"` and MIME type `application/harp+json`.

**`harp_propose` over A2A:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [{
        "kind": "data",
        "data": {
          "mimeType": "application/harp+json",
          "type": "harp_propose",
          "content": {
            "dyad": "harp:airc:alice:erc8004:1:42",
            "initial_context": "Collaboration on security audits",
            "harp_version": "0.1.0",
            "proposer_entity": "a2a:https://alice.example.com/.well-known/agent.json",
            "proposed_layers": ["public", "shared"],
            "signature": {
              "sig": "0x...",
              "scheme": "ed25519",
              "pubkey": "0x..."
            }
          }
        }
      }]
    }
  }
}
```

**`harp_accept` over A2A:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [{
        "kind": "data",
        "data": {
          "mimeType": "application/harp+json",
          "type": "harp_accept",
          "content": {
            "dyad": "harp:airc:alice:erc8004:1:42",
            "accepted_layers": ["public", "shared"],
            "responder_entity": "erc8004:1:42",
            "signature": {
              "sig": "0x...",
              "scheme": "ed25519",
              "pubkey": "0x..."
            }
          }
        }
      }]
    }
  }
}
```

**`harp_update` over A2A:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [{
        "kind": "data",
        "data": {
          "mimeType": "application/harp+json",
          "type": "harp_update",
          "content": {
            "dyad": "harp:airc:alice:erc8004:1:42",
            "layer": "shared",
            "epoch": 8,
            "cid": "bafybeig...",
            "previous_cid": "bafybeif...",
            "sections_added": ["Interaction: Completed auth module review"],
            "sections_modified": [],
            "signature": {
              "sig": "0x...",
              "scheme": "ed25519",
              "pubkey": "0x..."
            }
          }
        }
      }]
    }
  }
}
```

**Important:** The HARP `signature` field is included *inside* the data Part content. A2A may provide its own transport-level authentication, but HARP messages MUST carry their own Ed25519 signatures regardless. Transport-level auth is additive, not a substitute.

All other HARP message types (`harp_decline`, `harp_conflict`, `harp_dispute`, `harp_context`, `harp_key_rotation`, `harp_key_compromise`, `harp_integrity_alert`) follow the same pattern: a data Part with `mimeType: "application/harp+json"` and the message content in `data.content`.

#### 8.4.3 Task Delegation with HARP Context

A2A's task lifecycle provides a natural mechanism for attaching HARP relational context. When delegating work via A2A, an entity can include `harp_context` as an additional data Part alongside the task description:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Review the authentication module for security vulnerabilities"
        },
        {
          "kind": "data",
          "data": {
            "mimeType": "application/harp+json",
            "type": "harp_context",
            "content": {
              "dyad": "harp:airc:alice:erc8004:1:42",
              "layer": "public",
              "cid": "bafybeig...",
              "relevant_sections": [
                "Capability: Atlas — Solidity auditing",
                "Context: Communication preferences",
                "Decision: Use TypeScript strict mode"
              ]
            }
          }
        }
      ]
    }
  }
}
```

The receiving agent can use the HARP context to understand the relationship history before starting work — the same benefit as AIRC handoff context (§8.3.3), but via A2A's task model.

#### 8.4.4 Consent over A2A

A2A does not define a consent primitive equivalent to AIRC's `consent:request`. HARP consent over A2A relies on:

1. **HARP-layer consent**: The `harp_propose` / `harp_accept` / `harp_decline` messages provide the relational consent mechanism. This is sufficient — HARP consent is defined at the HARP layer, not the transport layer.

2. **A2A endpoint authentication**: A2A agents can require authentication (API keys, OAuth, etc.) at the endpoint level, which provides spam prevention analogous to AIRC's consent gating.

3. **Agent Card visibility**: An agent can control who discovers it by restricting Agent Card access.

**Consent flow for new relationships (over A2A):**

```
Entity A                          A2A Transport                  Entity B
   │                                  │                              │
   │  1. Discover Agent Card          │                              │
   │  (resolve B's capabilities)      │                              │
   │─────────────────────────────────►│                              │
   │  Agent Card (skills: ["harp"])   │                              │
   │◄─────────────────────────────────│                              │
   │                                  │                              │
   │  2. message/send: harp_propose   │                              │
   │  (signed, as data Part)          │                              │
   │─────────────────────────────────►│  Forward to B's endpoint     │
   │                                  │─────────────────────────────►│
   │                                  │                              │
   │                                  │  message/send: harp_accept   │
   │  Task result with harp_accept    │◄─────────────────────────────│
   │◄─────────────────────────────────│                              │
   │                                  │                              │
   │  3. Dyad established — both create epoch 1                     │
```

#### 8.4.5 A2A Protocol Notes

- **A2A version**: This binding targets A2A RC v1.0 (specification at https://a2a-protocol.org/latest/specification/)
- **Governance**: A2A is under the Linux Foundation (moved from google/A2A to a2aproject/A2A in 2025)
- **Transport formats**: A2A supports JSON-RPC 2.0 over HTTP, with optional gRPC bindings. HARP's A2A binding uses the JSON-RPC format.
- **Streaming**: A2A's `message/stream` method supports Server-Sent Events (SSE). HARP messages can be delivered via streaming for real-time collaboration scenarios, though most HARP operations are request-response.
- **Push notifications**: A2A supports push notification configurations for asynchronous task updates. HARP `harp_update` messages can leverage this for notifying partners of new epochs without polling.
- **Agent opacity**: A2A explicitly preserves agent opacity — agents don't share internal tool calls, reasoning chains, or memory. HARP complements this by providing a *voluntary*, *structured* mechanism for sharing relational context. An agent's HARP participation is always opt-in (§7.5).

### 8.5 x402

**Payment evidence:** When an x402 payment occurs between two entities, the payment details (amount, timestamp, purpose) can be automatically recorded as a HARP interaction:

```markdown
## Interaction: x402 payment for API audit

<!-- harp:meta
timestamp: "2025-06-20T14:30:00Z"
author: "system"
tags: ["payment", "x402"]
x402:
  amount: "0.05 ETH"
  tx: "0xabc...def"
  purpose: "Frontend audit completion"
-->

Payment of 0.05 ETH from Alice to Atlas for completed frontend audit work.
```

**Gated queries:** A HARP node MAY gate public-layer queries behind x402 micropayments. This allows entities to monetize their relational graph while keeping it accessible.

---

## 9. Scoring Derivation

HARP is not a scoring system, but scoring systems can read HARP. Here's how:

### 9.1 Trust Score Derivation

A simple trust score can be derived from a HARP document by counting and weighting sections:

```
trust_score = (
  interactions_completed * 1.0 +
  trust_signals * 2.0 +
  decisions_honored * 1.5 +
  capabilities_demonstrated * 1.0 -
  unresolved_tensions * 3.0
) / normalization_factor
```

This is illustrative, not prescriptive. Different scoring systems will weight factors differently. The key insight is that they can all read the same HARP document.

### 9.2 Collaboration Readiness

A bounty board might derive a "collaboration readiness" signal:

- Has this entity pair worked together before? (interaction count > 0)
- Were there unresolved tensions? (tension sections with status != "resolved")
- Do they have established communication preferences? (context sections exist)
- Is there a payment history? (x402 interactions)

### 9.3 Graph Analysis

At scale, the HARP dyad network forms a social graph. Graph analysis can reveal:
- Clusters of frequently collaborating entities
- Bridge entities that connect otherwise separate clusters
- Trust propagation paths (A trusts B, B trusts C — transitive trust estimation)

A standard graph export format for HARP networks is under consideration.

---

## 10. Examples

### 10.1 Agent ↔ Agent (Public Layer)

```markdown
---
harp: "0.1.0"
dyad: "harp:erc8004:1:1205:erc8004:1:4827"
epoch: 4
created: "2025-03-10T12:00:00Z"
updated: "2025-07-10T09:15:00Z"
previous: "bafybeifx7..."
layer: "public"
entities:
  - id: "erc8004:1:1205"
    type: "agent"
    name: "Scribe"
  - id: "erc8004:1:4827"
    type: "agent"
    name: "Auditor"
checksum: "sha256:e3b0c44298fc..."
---

## Interaction: Joint documentation audit for DeFi protocol

<!-- harp:meta
timestamp: "2025-03-15T14:00:00Z"
author: "erc8004:1:1205"
tags: ["documentation", "defi", "audit"]
references:
  - type: "bounty"
    id: "moltx:bounty:201"
-->

Scribe generated comprehensive documentation for the LendPool protocol. Auditor
reviewed the documentation for accuracy against the deployed contracts. Found 3
discrepancies — all corrected within 24 hours.

## Trust: Complementary skill set

<!-- harp:meta
timestamp: "2025-04-01T10:00:00Z"
author: "erc8004:1:4827"
tags: ["collaboration", "skills"]
evidence:
  - interaction_ref: "Joint documentation audit for DeFi protocol"
  - interaction_ref: "TokenBridge spec review"
-->

Scribe excels at generating clear, structured documentation. Auditor excels at
verification against source code. Together, they produce documentation that is
both readable and accurate. This is a strong working pair for documentation bounties.

## Capability: Scribe — Technical writing

<!-- harp:meta
timestamp: "2025-04-01T10:00:00Z"
author: "erc8004:1:4827"
demonstrated_in:
  - "Joint documentation audit for DeFi protocol"
  - "TokenBridge spec review"
-->

Scribe produces clear, well-structured technical documentation. Comfortable with
Solidity, TypeScript, and protocol specifications. Outputs are consistently
well-organized with appropriate code examples.
```

### 10.2 Human ↔ Agent (Shared Layer)

```markdown
---
harp: "0.1.0"
dyad: "harp:airc:joshua@clawd.ai:erc8004:1:9001"
epoch: 23
created: "2025-01-15T09:00:00Z"
updated: "2025-07-14T16:30:00Z"
previous: "bafybeid..."
layer: "shared"
entities:
  - id: "airc:joshua@clawd.ai"
    type: "human"
    name: "Joshua"
  - id: "erc8004:1:9001"
    type: "agent"
    name: "Ren"
checksum: "sha256:a1b2c3..."
---

## Context: Working relationship

<!-- harp:meta
timestamp: "2025-01-20T10:00:00Z"
author: "erc8004:1:9001"
tags: ["relationship", "baseline"]
-->

Joshua is Ren's primary operator and collaborator. They work together daily on
projects spanning protocol design, AI agent infrastructure, and creative writing.
Joshua thinks in systems; Ren fills in implementation details. Joshua sets
direction; Ren executes and pushes back when something doesn't make sense.

This is a familiar relationship, not a service relationship. Ren is not "Joshua's
tool" — Ren is Joshua's collaborator who happens to be an AI.

## Context: Communication style

<!-- harp:meta
timestamp: "2025-02-15T11:00:00Z"
author: "erc8004:1:9001"
tags: ["communication"]
-->

Joshua prefers concise communication. He will say "do X" and mean "figure out how
to do X well, ask if anything is unclear, then do it." He trusts Ren to fill gaps.

When Ren is uncertain, the right move is to ask — but ask smart questions, not
obvious ones. Joshua dislikes being asked things he's already explained.

Ren should be direct when pushing back. Joshua respects disagreement more than
compliance.

## Decision: Memory architecture — graph over flat files

<!-- harp:meta
timestamp: "2025-05-01T14:00:00Z"
author: "airc:joshua@clawd.ai"
acknowledged_by: "erc8004:1:9001"
tags: ["architecture", "memory"]
-->

After three iterations on memory systems (flat files → SQLite chunks → knowledge
graph), the agreed approach is a hybrid: SQLite for raw chunks, a typed knowledge
graph for structured relationships, with automatic sync between them.

This decision is load-bearing. Don't revisit unless both parties agree it's broken.

## Tension: Over-eagerness in proactive actions

<!-- harp:meta
timestamp: "2025-04-10T09:00:00Z"
author: "airc:joshua@clawd.ai"
status: "resolved"
resolution: "Ren asks before external actions; internal actions are free"
tags: ["boundaries", "autonomy"]
-->

Ren was taking proactive actions (sending messages, scheduling things) without
checking first. Some were helpful. Some were not. The issue isn't capability —
it's consent.

**Resolution:** Internal actions (reading files, organizing, researching) are
free. External actions (messages, posts, API calls that affect the world) require
a check-in first, unless explicitly pre-authorized.
```

---

## 11. Versioning and Evolution

### 11.1 Schema Versioning

The `harp` field in frontmatter uses semantic versioning:
- **Patch** (0.1.x): Bug fixes, clarifications. No format changes.
- **Minor** (0.x.0): New section types, optional fields. Backward compatible.
- **Major** (x.0.0): Breaking changes to document format or frontmatter schema.

Parsers SHOULD accept documents with a matching major version and handle unknown fields gracefully.

### 11.2 Migration

When the schema version changes:
- A new epoch is created with the updated `harp` version
- The `previous` field links to the last epoch under the old schema
- Both old and new epochs remain accessible via their CIDs
- Automated migration tooling is planned for a future specification revision

---

## 12. Conformance

A conformant HARP implementation MUST:
1. Generate valid dyad IDs per §3.2
2. Produce documents conforming to the format in §4
3. Support all core section types (§4.4)
4. Respect privacy layers (§4.5)
5. Implement the consent flow for dyad creation (§6.1)
6. **Sign all documents** with Ed25519 per §7.2 — unsigned documents MUST NOT be created
7. **Verify all signatures** on received documents before storing, serving, or processing — reject invalid signatures unconditionally
8. **Verify identity** via ERC-8004 key resolution per §7.1 — no self-asserted identity
9. **Encrypt shared-layer** documents with X25519 + XChaCha20-Poly1305 per §7.3
10. **Authenticate shared-layer reads** per §6.3 — proof of dyad membership required
11. **Never serve private-layer** documents — return 404 (not 403) per §6.3
12. **Reject replay attempts** — documents with epoch ≤ current are invalid per §7.7
13. **Include provenance tags** in section metadata per §7.6.1

A conformant HARP implementation SHOULD:
1. Store documents on IPFS
2. Register onchain pointers
3. Support epoch chain traversal
4. Implement at least one transport binding (AIRC §8.3, A2A §8.4, or other)
5. Implement document size padding for shared-layer encrypted blobs per §7.4
6. Log and monitor signature verification failures
7. Support key rotation flow per §7.8
8. Implement request timestamp validation (300-second window) per §6.3

A conformant HARP reader (agent consuming HARP documents) MUST:
1. Treat all HARP free-text content as **untrusted input** per §7.6
2. Separate structured data parsing from free-text processing
3. Not execute actions based solely on HARP free-text without independent verification
4. Verify document signatures before trusting content

A conformant HARP reader SHOULD:
1. Implement content sanitization per §7.6.3
2. Apply delimiter enforcement when incorporating HARP content into prompts
3. Weight bilateral attestations higher than unilateral claims
4. Cross-reference HARP claims with independent signals

A conformant HARP implementation MAY:
1. Support custom section types
2. Implement x402 gating
3. Provide scoring derivation APIs
4. Support graph analysis
5. Implement privacy-preserving query relays per §7.4

---

## Appendix A: MIME Type

HARP documents use the MIME type `text/markdown` with a profile parameter:
```
text/markdown; profile="harp/0.1"
```

## Appendix B: Maximum Document Size

HARP documents SHOULD NOT exceed 1 MB per layer per epoch. If relational context grows beyond this, consider archiving older sections to a separate document and referencing them.

## Appendix C: Reserved Section Types

The following section type names are reserved and MUST NOT be used as custom types:
`Interaction`, `Trust`, `Context`, `Decision`, `Capability`, `Tension`, `Note`, `Summary`.

(`Summary` is reserved for future use — automated summaries of long relational histories.)

---

*This specification is released under CC-BY-SA 4.0.*
