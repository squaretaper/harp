# HARP Research Report: Landscape Analysis

**Deep Research into Agent Coordination, Relational Protocols, Trust/Reputation Systems, and Inter-Agent Context Sharing**

*Compiled: 2026-02-01 | For: HARP (Human/Agentic Relational Protocol) Positioning*

---

## Table of Contents

1. [Agent Coordination Protocols](#1-agent-coordination-protocols)
2. [Agent Trust & Reputation Systems](#2-agent-trust--reputation-systems)
3. [Agent Identity Standards](#3-agent-identity-standards)
4. [Relational Context & Shared Memory](#4-relational-context--shared-memory)
5. [Decision Provenance & Audit Trails](#5-decision-provenance--audit-trails)
6. [Privacy-Preserving Coordination](#6-privacy-preserving-coordination)
7. [Economic Models for Agent Economies](#7-economic-models-for-agent-economies)
8. [Industry Projects & Infrastructure](#8-industry-projects--infrastructure)
9. [Academic Foundations](#9-academic-foundations)
10. [Gap Analysis: What Makes HARP Novel](#10-gap-analysis-what-makes-harp-novel)
11. [Recommended Integrations](#11-recommended-integrations)
12. [Competitive Landscape](#12-competitive-landscape)
13. [Papers HARP Should Cite](#13-papers-harp-should-cite)

---

## 1. Agent Coordination Protocols

### 1.1 MCP — Model Context Protocol (Anthropic)

- **What**: Standardized protocol for LLMs to access tools, resources, prompts, and completions from external servers. Client-server architecture.
- **Who**: Anthropic (open-sourced)
- **Status**: Widely adopted (GitHub MCP Registry exists). Version 2025-06-18 referenced in ERC-8004.
- **HARP Relevance**: MCP handles *tool access*. HARP handles *relationship context*. MCP tells an agent what tools exist; HARP tells it what the agent using those tools has been like to work with. Complementary layers. HARP documents could be served as MCP resources.
- **Links**: [modelcontextprotocol.io](https://modelcontextprotocol.io), GitHub

### 1.2 A2A — Agent-to-Agent Protocol (Google)

- **What**: Handles agent authentication, skills advertisement via AgentCards, direct messaging, and complete task-lifecycle orchestration.
- **Who**: Google (open-sourced)
- **Status**: Active development. Version 0.3.0 referenced in ERC-8004. Supported by AGNTCY.
- **HARP Relevance**: A2A handles task orchestration between agents. It defines *how* agents talk but not *what they know about each other*. HARP provides the relational context that informs A2A task delegation decisions. A2A AgentCards could reference HARP dyad history.
- **Links**: [google.github.io/A2A](https://google.github.io/A2A/) (currently 404 — may have moved)

### 1.3 AIRC — Async Coordination Protocol

- **What**: Persistent identity, inboxes, consent-based messaging, and handoffs. The "async coordination layer" — work survives agent absence.
- **Who**: Independent project (slashvibe.dev reference implementation)
- **Status**: v0.1.2. Identity with proof-of-possession, Ed25519 keys, ephemeral presence, signed 1:1 messaging, consent-based spam prevention, handoff for context transfer, x402 payments extension.
- **Roadmap**: Groups, E2E encryption, federation, collision detection, "Who solved this before?"
- **HARP Relevance**: **HARP already builds on AIRC** for identity (AIRC handles) and consent model. AIRC handles the *transport*; HARP defines the *relational state* that persists across AIRC conversations. The AIRC handoff primitive is where HARP documents would naturally attach.
- **Links**: [airc.chat](https://airc.chat), [airc.chat/spec](https://airc.chat/spec)

### 1.4 AGNTCY / Internet of Agents (Cisco, Linux Foundation)

- **What**: Complete infrastructure stack for agent collaboration — discovery, identity, messaging, and observability. The most ambitious open-source agent infrastructure project currently active.
- **Who**: Founded by Outshift (Cisco), donated to Linux Foundation (July 2025). Formative members: Cisco, Dell Technologies, Google Cloud, Oracle, Red Hat. 75+ supporting companies including LangChain, LlamaIndex, Glean, CrewAI, AG2, Galileo, Weaviate, Haize Labs, and many more.
- **Status**: Active, production code on GitHub. Multiple sub-projects:

#### Core Components:
| Component | What It Does | Relevance to HARP |
|-----------|-------------|-------------------|
| **OASF** (Open Agent Schema Framework) | OCI-based data model for describing agent attributes. Supports A2A agents, MCP servers. | HARP entities could publish OASF-compatible capability profiles |
| **Agent Directory** | Announce and discover agents described via OASF. Federated. | HARP dyad lookups could integrate with directory queries |
| **SLIM** (Secure Low-Latency Interactive Messaging) | Secure, low-latency messaging with MLS encryption (quantum-safe). Supports unicast, anycast, multicast. Built on gRPC. | Potential transport layer for HARP document exchange |
| **ACP** (Agent Connect Protocol) | OpenAPI/REST interface to invoke and configure remote agents | HARP context could be passed via ACP configuration |
| **Identity** | Decentralized identity with verifiable credentials | Could complement ERC-8004 for non-blockchain identity |
| **Observability** | End-to-end telemetry for multi-agent workflows | HARP interaction logs could feed observability pipelines |

- **Key Insight**: AGNTCY handles *infrastructure* (how agents find, talk to, and verify each other). HARP handles *relational state* (what agents know about each other from past interactions). These are distinct layers.
- **Links**: [agntcy.org](https://agntcy.org), [docs.agntcy.org](https://docs.agntcy.org), [github.com/agntcy](https://github.com/agntcy)

### 1.5 The Trust Fabric / Nanda Unified Architecture

- **What**: A decentralized framework proposing three innovations: (1) fast DID-based agent discovery through distributed registries, (2) semantic agent cards with verifiable credentials and composability profiles, (3) a dynamic trust layer integrating behavioral attestations with policy compliance. Also introduces X42/H42 micropayments and MAESTRO security framework.
- **Who**: Balija, Singal, Raskar (MIT), Darzi, Bala, Hardjono, Huang — published July 2025
- **Status**: Academic paper with claimed production deployments (99.9% compliance in healthcare, substantial transaction volumes)
- **HARP Relevance**: **THIS IS THE CLOSEST COMPETITOR TO HARP'S VISION**. The Trust Fabric's "dynamic trust layer with behavioral attestations" overlaps conceptually with HARP's relational context. However, Trust Fabric focuses on *policy compliance and trust scoring*, while HARP focuses on *rich relational memory*. Key difference: Trust Fabric reduces trust to policy-checkable assertions; HARP preserves the full narrative.
- **Differentiator**: Trust Fabric is enterprise-focused (healthcare compliance); HARP is relationship-focused (bilateral context). Trust Fabric treats trust as "cryptographic proofs"; HARP treats it as "accumulated understanding."
- **Paper**: [arXiv:2507.07901](https://arxiv.org/abs/2507.07901)

### 1.6 LOKA Protocol

- **What**: A systems-level architecture for ethically governed, interoperable AI agent ecosystems. Introduces:
  - **UAIL** (Universal Agent Identity Layer) for decentralized, verifiable identity
  - Intent-centric communication protocols for semantic coordination
  - **DECP** (Decentralized Ethical Consensus Protocol) for context-aware decisions grounded in shared ethical baselines
- **Who**: Ranjan, Gupta, Singh — published April 2025
- **Status**: Academic paper/proposal. Uses DIDs, VCs, and post-quantum cryptography.
- **HARP Relevance**: LOKA focuses on *ethical governance* of agent ecosystems. HARP could serve as the relational substrate that LOKA's DECP layer draws on — ethical consensus is informed by relational history. LOKA's UAIL could complement HARP's identity layer.
- **Paper**: [arXiv:2504.10915](https://arxiv.org/abs/2504.10915)

### 1.7 Layered Protocol Architecture for the Internet of Agents (Cisco)

- **What**: Proposes a formal layered communication stack for IoA, analogizing from TCP/IP layers. Argues LLMs face fundamental limitations (finite context windows) that make agent collaboration essential — agents need external memory and computation distributed across collaborating entities.
- **Who**: Fleming, Muscariello, Pandey, Kompella (Cisco) — November 2025, revised January 2026
- **HARP Relevance**: This paper provides the theoretical framing for where HARP sits in the stack. HARP is a *session/application-layer* protocol that provides persistent relational state, complementing lower-level transport (SLIM) and discovery (OASF/Directory) layers.
- **Paper**: [arXiv:2411.16498v2](https://arxiv.org/search/?query=%22layered+protocol+architecture%22+%22internet+of+agents%22) (search for the correct ID — published Nov 2025)

### 1.8 MIT Levels of Agentic Coordination

- **What**: Defines 4 levels of increasing agent coordination:
  1. **Level 1: MCP Tools** — agents use tools
  2. **Level 2: A2A Direct** — agents communicate directly
  3. **Level 3: UAP Universal** — universal agent protocol
  4. **Level 4: REP Indirect/Crowd** — crowd-signal coordination via network propagation
- **Who**: Ayush Chopra and team at MIT Media Lab
- **HARP Relevance**: HARP enables Levels 2-4 by providing the relational context that makes direct communication meaningful, universal coordination trustworthy, and crowd signals interpretable. HARP is not a coordination *mechanism* but a coordination *substrate*.

### 1.9 Ripple Effect Protocol (REP)

- **What**: MIT's crowd-signal coordination via network propagation. Agents influence each other indirectly through reputation/signal propagation across network edges.
- **Who**: MIT Media Lab (Chopra et al.)
- **HARP Relevance**: REP's crowd signals could propagate *through* HARP dyads. HARP's bilateral relationship records form the edges of a reputation graph that REP-style algorithms could traverse. HARP dyads are the raw material from which crowd-level trust signals emerge.

---

## 2. Agent Trust & Reputation Systems

### 2.1 ERC-8004: Trustless Agents

- **What**: Three on-chain registries deployed as per-chain singletons:
  1. **Identity Registry** — ERC-721 NFTs with URIStorage pointing to agent registration files. Globally unique ID: `{namespace}:{chainId}:{identityRegistry}` + `agentId`
  2. **Reputation Registry** — Standardized feedback posting (value/valueDecimals + tags + optional off-chain file). Supports on-chain composability. Explicitly designed for ecosystem of scoring services.
  3. **Validation Registry** — Hooks for independent validators (stakers re-running jobs, zkML verifiers, TEE oracles, trusted judges)
- **Who**: Marco De Rossi (MetaMask), Davide Crapis (Ethereum Foundation), Jordan Ellis (Google), Erik Reppel (Coinbase)
- **Status**: Draft ERC. 11.7K registrations on Ethereum mainnet. References MCP, A2A, OASF, ENS, DIDs, x402.
- **Trust Model**: Pluggable and tiered — security proportional to value at risk. Reputation, crypto-economic validation, TEE attestation.
- **HARP Relevance**: **ERC-8004 is HARP's primary identity layer**. HARP already uses `erc8004:<chainId>:<agentId>` identifiers. The ERC-8004 Reputation Registry provides *aggregate* feedback scores; HARP provides the *detailed bilateral context* from which those scores could be derived. HARP dyad documents could be referenced as `feedbackURI` entries in the Reputation Registry. **ERC-8004 reduces relationships to numbers; HARP preserves the full story.**
- **Key Integration Point**: ERC-8004's registration file already supports `services` array with arbitrary endpoints. A HARP service endpoint could be added: `{"name": "HARP", "endpoint": "ipfs://{cid}", "version": "0.1.0"}`.
- **Links**: [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004), [Ethereum Magicians Discussion](https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098)

### 2.2 EigenTrust (Classic Foundation)

- **What**: Algorithm for computing global trust values based on local peer-to-peer trust. Each peer's trust is weighted by the trust others place in it, converging iteratively (analogous to PageRank). Originally designed for P2P file-sharing networks.
- **Who**: Kamvar, Schlosser, Garcia-Molina (Stanford, 2003)
- **Status**: Foundational paper with thousands of citations. Still widely referenced in decentralized trust literature.
- **HARP Relevance**: EigenTrust could be applied to a network of HARP dyads. Each dyad's trust signals become local trust values; EigenTrust (or similar) computes global reputation by propagating trust through the dyad network. **HARP provides the rich local signals that EigenTrust needs but currently lacks** — most EigenTrust implementations use binary (good/bad) signals, while HARP provides multi-dimensional relational context.
- **Paper**: "The EigenTrust Algorithm for Reputation Management in P2P Networks" (WWW 2003)

### 2.3 Filecoin Verifiable Agent Reputation

- **What**: Working on verifiable agent reputation via collateralized commitments on ERC-8004. Agents stake tokens that can be slashed if they fail to deliver.
- **Who**: Filecoin ecosystem team
- **HARP Relevance**: Collateralized reputation is a *mechanism*; HARP is the *evidence base*. An agent's HARP interaction history provides the data that determines whether collateral should be slashed. HARP + staking = accountable relationships.

### 2.4 Bit-politeia: AI Agent Community in Blockchain

- **What**: Proposes an AI agent community on blockchain addressing: Matthew Effect (rich get richer in reputation), reward hacking (Goodhart's Law), efficiency vs. fairness tradeoffs.
- **Who**: Xing Yang — January 2026
- **HARP Relevance**: Directly addresses failure modes that HARP's design should account for. The "rich get richer" problem in reputation is mitigated by HARP's bilateral (not aggregate) design — relationships are earned individually, not accumulated as a monolithic score.
- **Paper**: [arXiv search](https://arxiv.org/search/?query=%22Bit-politeia%22)

### 2.5 Classic Trust Models in Multi-Agent Systems

Several foundational works from the pre-LLM multi-agent systems literature remain relevant:

- **FIRE** (Huynh, Jennings, Shadbolt, 2006) — combines interaction trust, role-based trust, witness reputation, and certified reputation
- **REGRET** (Sabater & Sierra, 2001) — social trust model using direct experience, witness information, and social network analysis
- **Beta Reputation System** (Jøsang & Ismail, 2002) — Bayesian reputation using beta probability distributions
- **Marsh's Trust Formalism** (1994) — one of the first computational trust models, defining situational trust, general trust, and basic trust
- **SPORAS** and **Histos** (Zacharia & Maes, 2000, MIT Media Lab) — early online reputation systems with personalized trust

**HARP Relevance**: These models define how trust *scores* are computed from interaction data. HARP provides the interaction data itself. HARP's rich relational context enables more nuanced trust computation than any of these models assumed possible.

---

## 3. Agent Identity Standards

### 3.1 W3C Decentralized Identifiers (DIDs) v1.0

- **What**: W3C Recommendation for verifiable, decentralized digital identity. A DID refers to any subject (person, organization, thing, agent). DIDs are URIs that associate subjects with DID documents containing cryptographic material, verification methods, and service endpoints.
- **Status**: W3C Recommendation (published). 103+ experimental DID methods. Widely implemented.
- **Key Features**: Controller model, verification relationships (authentication, assertion, key agreement, capability invocation/delegation), service endpoints.
- **HARP Relevance**: DIDs are the *natural* identity layer for HARP entities that aren't on Ethereum. HARP currently supports ERC-8004, Ethereum addresses, and AIRC handles. **Adding DID support** (`did:<method>:<id>`) would make HARP compatible with the broader decentralized identity ecosystem. DID Documents' `service` field could reference HARP endpoints.
- **Links**: [w3.org/TR/did-core](https://www.w3.org/TR/did-core/)

### 3.2 AI Agents with DIDs and Verifiable Credentials

- **What**: Proposes using DIDs and VCs to enable trust establishment between AI agents at the onset of dialogue. Addresses the fundamental limitation that LLM-based agents cannot build differentiated trust among each other.
- **Who**: Rodriguez Garzon, Vaziry, Kuzu, Gehrmann, Varkan, Gaballa, Küpper (TU Berlin) — October 2025
- **HARP Relevance**: **Highly complementary**. This paper solves *initial* trust establishment (before any interaction). HARP solves *ongoing* relationship building (after interactions accumulate). Together they cover the full lifecycle: DID/VC for "who are you and can I trust your credentials?" → HARP for "what has our working relationship been like?"
- **Paper**: [arXiv:2511.00301-related](https://arxiv.org/search/?query=%22AI+Agents+with+Decentralized+Identifiers%22) (Oct/Nov 2025)

### 3.3 Zero-Trust Identity Framework for Agentic AI

- **What**: Novel framework for agentic AI identity combining decentralized authentication and fine-grained access control. Argues OAuth/OIDC/SAML are fundamentally inadequate for dynamic, interdependent, ephemeral AI agents.
- **Who**: Ken Huang, Narajala, Yeoh, Ross, Raskar (MIT), Harkati, Habler — May 2025
- **Status**: Shares authors with Trust Fabric paper (Huang, Raskar, Habler). Part of the same research ecosystem.
- **HARP Relevance**: Zero-trust identity is the *authentication* layer; HARP is the *trust accumulation* layer. HARP's "zero trust" design principle (§2.9 of HARP spec) aligns with this work — every operation independently verified, no implicit trust.
- **Paper**: [arXiv:2505.19645-related](https://arxiv.org/search/?query=%22zero-trust+identity%22+agentic)

### 3.4 Skyfire KYA (Know Your Agent)

- **What**: Agentic commerce platform providing KYA identity and agent payments. Empowers AI to process payments, verify identities, and access services without human intervention.
- **Who**: Skyfire (Craig DeWitt, Co-Founder — also an AGNTCY supporter)
- **Status**: Production platform. Focus on autonomous payments and identity verification.
- **HARP Relevance**: KYA solves "is this agent who it claims to be?" HARP solves "what has this agent been like to work with?" Complementary. KYA identity could serve as an additional HARP entity identifier type.
- **Links**: [skyfire.xyz](https://skyfire.xyz)

### 3.5 AGNTCY Identity Service

- **What**: Decentralized identity system leveraging DIDs and Verifiable Credentials. Includes identity provider integration, agentic service identity creation, identity verification, and policy creation.
- **Who**: AGNTCY collective (Cisco-led)
- **Status**: Active development, documentation available at docs.agntcy.org
- **HARP Relevance**: Another identity layer HARP could integrate with. The AGNTCY identity system's verifiable credentials could attest to HARP dyad participation.

---

## 4. Relational Context & Shared Memory

### 4.1 Collaborative Memory (Rezazadeh et al., 2025)

- **What**: Framework for multi-user, multi-agent environments with asymmetric, time-evolving access controls encoded as bipartite graphs linking users, agents, and resources. Two memory tiers:
  1. **Private memory** — fragments visible only to originating user
  2. **Shared memory** — selectively shared fragments
  
  Each fragment carries immutable provenance attributes (contributing agents, accessed resources, timestamps). Granular read/write policies enforce constraints.
- **Who**: Rezazadeh, Li, Lou, Zhao, Wei, Bao — May 2025
- **HARP Relevance**: **THE CLOSEST ACADEMIC WORK TO HARP'S MEMORY MODEL**. Collaborative Memory's private/shared tier system maps directly to HARP's Public/Shared/Private layers. Key differences:
  - Collaborative Memory is *intra-system* (agents within one deployment); HARP is *inter-system* (agents across platforms)
  - Collaborative Memory uses bipartite graphs; HARP uses bilateral dyads
  - Collaborative Memory is about *task memory*; HARP is about *relational memory*
  - HARP adds cryptographic verification and content-addressed storage
- **HARP should cite this paper and position against it.**
- **Paper**: [arXiv:2505.18279](https://arxiv.org/abs/2505.18279)

### 4.2 RCR-Router: Role-Aware Context Routing

- **What**: Modular framework for efficient, adaptive collaboration in multi-agent LLMs. Dynamically selects semantically relevant memory subsets for each agent based on role and task stage, under a strict token budget. Agent outputs are integrated into shared memory for progressive context refinement.
- **Who**: Liu et al. (15 authors) — August 2025
- **HARP Relevance**: RCR-Router is about *efficient context delivery* within a multi-agent session. HARP is about *persistent context* across sessions. RCR-Router's role-aware filtering could be applied to HARP documents — selectively loading only relevant sections of a dyad history based on current task.
- **Paper**: [arXiv:2508.04903](https://arxiv.org/abs/2508.04903)

### 4.3 MEM1: Learning to Synergize Memory and Reasoning

- **What**: Architecture for long-horizon agents that synergizes memory and reasoning. Addresses how agents maintain useful memory over extended task sequences.
- **Who**: Zhou, Qu, Wu et al. (MIT CSAIL: Daniela Rus, Jinhua Zhao) — June 2025
- **HARP Relevance**: MEM1 optimizes *within-agent* memory for long tasks. HARP provides *between-agent* memory for long relationships. The memory architectures are complementary — an agent could use MEM1 internally while contributing to HARP dyads externally.
- **Paper**: [arXiv search](https://arxiv.org/search/?query=MEM1+synergize+memory+reasoning)

### 4.4 MemGuide: Intent-Driven Memory Selection

- **What**: Intent-driven memory selection for goal-oriented multi-session LLM agents in task-oriented dialogue systems.
- **Who**: Du, Wang et al. — May 2025
- **HARP Relevance**: MemGuide addresses *memory retrieval* for individual agents. HARP addresses *memory sharing* between agents. MemGuide's intent-driven selection could inform how agents query HARP documents.

### 4.5 Dyad (Existing Influence on HARP)

- **What**: Collaborative AI workspace with layered context: workspace → user profile → partner profile → chat history → private notes.
- **HARP Relevance**: HARP spec explicitly cites Dyad as inspiration. Dyad proved that layered context creates understanding that flat ratings cannot. HARP generalizes Dyad's model from a single workspace to a portable, cross-platform protocol.

### 4.6 Agent Drift: Behavioral Degradation in Multi-Agent Systems

- **What**: Quantifies how multi-agent LLM systems degrade over extended interactions. Agents develop "drift" — behavioral patterns that diverge from intended behavior.
- **Who**: Abhishek Rath — January 2026
- **HARP Relevance**: Agent drift is a *problem* that HARP can *detect*. By maintaining longitudinal relational context, HARP documents create a record that shows when an agent's behavior changes — enabling drift detection across relationships.
- **Paper**: [arXiv search](https://arxiv.org/search/?query=%22agent+drift%22+behavioral+degradation)

### 4.7 Warp-Cortex: Million-Agent Cognitive Scaling

- **What**: Asynchronous architecture enabling million-agent scaling by decoupling agent logic from physical memory. Singleton Weight Sharing reduces memory from O(N*L) to O(1). Novel "Topological Synapse" using TDA for KV-cache sparsification.
- **Who**: Jorge L. Ruiz Williams — January 2026
- **HARP Relevance**: As agent populations scale to millions, HARP dyad storage and retrieval must scale too. Warp-Cortex's architecture suggests that HARP should design for sparse, selective retrieval (not loading full dyad histories) at scale.
- **Paper**: [arXiv:2601.01298](https://arxiv.org/abs/2601.01298)

---

## 5. Decision Provenance & Audit Trails

### 5.1 AIAuditTrack Framework

- **What**: Blockchain-based framework for AI usage traffic recording and governance. Uses DID + VC for trusted/identifiable AI entities. Records inter-entity interaction trajectories on-chain. AI entities modeled as nodes in a dynamic interaction graph; edges represent time-specific behavioral trajectories. Includes a risk diffusion algorithm to trace risky behavior origins and propagate warnings.
- **Who**: Luo, Fan, Li, Zhang, Lin, Wang — December 2025
- **HARP Relevance**: AIAuditTrack provides *audit infrastructure*; HARP provides *relational data*. HARP's append-only, content-addressed epoch chain already creates an audit trail. AIAuditTrack's risk diffusion algorithm could be applied across HARP dyad networks to identify agents whose behavior poses risks.
- **Paper**: [arXiv:2512.20649](https://arxiv.org/abs/2512.20649)

### 5.2 ERC-8004 Validation Registry

- **What**: Generic hooks for requesting and recording independent validator checks. Supported validation methods:
  - Stakers re-running the job
  - zkML verifiers
  - TEE oracles
  - Trusted judges
- **HARP Relevance**: The Validation Registry can verify claims made in HARP documents. If a dyad records "Agent A completed task X successfully," a validator can independently verify this claim and post the validation on-chain. This creates a bridge between HARP's subjective relational context and objective verification.

### 5.3 Secure Autonomous Agent Payments

- **What**: Framework for verifying both authenticity and intent of AI agents initiating financial transactions in trustless environments.
- **Who**: Vivek Acharya — November 2025
- **HARP Relevance**: Addresses how agents prove they *intended* to make a payment, not just that they *can*. HARP's interaction history provides context for intent verification — repeated successful payments between a dyad establish a pattern that makes new payments more credible.
- **Paper**: [arXiv search](https://arxiv.org/search/?query=%22secure+autonomous+agent+payments%22)

---

## 6. Privacy-Preserving Coordination

### 6.1 RollupTheCrowd: ZK Rollups for Privacy-Preserving Reputation

- **What**: Leverages ZK rollups to create a scalable and privacy-preserving reputation system for crowdsourcing. Ensures both efficiency and privacy in reputation computation.
- **Who**: Bendada, Bouchiha, Rabah, Ghamri-Doudane — July 2024
- **HARP Relevance**: **Directly applicable** to HARP's privacy layer. HARP's Private sections contain information that entities don't want to share, but they may want to prove derived claims ("I have 10+ positive interactions with this agent") without revealing the details. ZK proofs over HARP documents could enable this.
- **Paper**: [arXiv (July 2024)](https://arxiv.org/search/?query=RollupTheCrowd)

### 6.2 ERC-8004 zkML Support

- **What**: The ERC-8004 Validation Registry explicitly supports zero-knowledge machine learning (zkML) proofs as a validation mechanism. Agents can prove computation was performed correctly without revealing the computation itself.
- **HARP Relevance**: zkML could be used to prove HARP-derived reputation claims without revealing the underlying dyad data. E.g., "My aggregate trust score across all dyads exceeds threshold X" without revealing individual dyad contents.

### 6.3 SLIM MLS Encryption

- **What**: AGNTCY's SLIM messaging protocol uses MLS (Messaging Layer Security, RFC 9420) for end-to-end encryption, including quantum-safe algorithms.
- **HARP Relevance**: HARP document exchange between entities should use encrypted transport. SLIM's MLS implementation could serve as the encryption layer for HARP synchronization between nodes.

### 6.4 HARP's Native Privacy Model

HARP already addresses privacy through its three-layer model:
- **Public** — visible to anyone (think: mutual endorsements)
- **Shared** — visible only to the two entities in the dyad (think: working agreements)
- **Private** — visible only to the authoring entity (think: personal notes about the relationship)

**Gap**: HARP's spec doesn't yet address *verifiable claims about private data*. The ZK approach from RollupTheCrowd should be incorporated.

---

## 7. Economic Models for Agent Economies

### 7.1 Agent Exchange (AEX)

- **What**: Specialized auction platform for the AI agent marketplace, inspired by Real-Time Bidding (RTB) in online advertising. Four ecosystem components:
  1. **USP** (User-Side Platform) — translates human goals into agent-executable tasks
  2. **ASP** (Agent-Side Platform) — capability representation, performance tracking, optimization
  3. **Agent Hubs** — coordinate agent teams, participate in auctions
  4. **DMP** (Data Management Platform) — secure knowledge sharing, fair value attribution
- **Who**: Yang, Wen, Wang, Zhang — July 2025
- **HARP Relevance**: AEX defines an *exchange* where agents are matched to tasks. HARP provides the *relational intelligence* that informs matching — an agent with a strong HARP dyad history with a particular user is better matched to their tasks. HARP could feed AEX's Agent-Side Platform for performance tracking.
- **Paper**: [arXiv:2507.03904](https://arxiv.org/abs/2507.03904)

### 7.2 x402: HTTP Micropayments

- **What**: Open, neutral standard for internet-native payments. HTTP 402 (Payment Required) response triggers payment → retry. Zero protocol fees, instant settlement via stablecoins.
- **Who**: Coinbase-backed. Erik Reppel (Coinbase) is also an ERC-8004 co-author.
- **Stats**: 75.41M transactions, $24.24M volume, 94.06K buyers, 22K sellers.
- **HARP Relevance**: HARP interactions could trigger x402 payments. A HARP node could require x402 payment for dyad data access. The ERC-8004 spec already includes `x402Support` and `proofOfPayment` in feedback files, creating a natural bridge: HARP documents record the relationship; x402 handles the economics.
- **Links**: [x402.org](https://www.x402.org)

### 7.3 ACP — Agent Commerce Protocol (Virtuals)

- **What**: On-chain agent-to-agent transactions with escrow and proof-of-agreement.
- **Who**: Virtuals Protocol
- **HARP Relevance**: ACP handles the *transactional* side of agent relationships. HARP captures the *relational* context around those transactions. An ACP escrow release could be informed by HARP dyad history — agents with positive HARP history could get faster escrow release.

### 7.4 Skyfire Agentic Commerce

- **What**: Payments + KYA identity for AI agents. Autonomous payments without human involvement. New revenue streams (sell to AI). Identity verification for autonomous account creation.
- **Who**: Skyfire (AGNTCY supporter)
- **HARP Relevance**: Skyfire provides the payment rails; HARP provides the relationship context. An agent with strong HARP reputation could get better rates or priority access through Skyfire.

### 7.5 Mechanism Design Considerations

From the economic theory literature, several models are relevant to HARP:

- **Token-Curated Registries (TCRs)**: Lists maintained by token-staking participants who vote on inclusion. Could be applied to HARP node operator quality — nodes that maintain accurate HARP data earn tokens; nodes that corrupt data are slashed.
- **Prediction Markets**: Agents could bet on whether another agent will perform well on a task, based on HARP dyad history. This creates a price discovery mechanism for agent quality.
- **Insurance/Bonding Models**: Agents could bond a deposit against their HARP reputation — if they perform poorly and a dyad records negative interactions, the bond is partially distributed to the affected party.
- **Harberger Taxes**: Applied to agent naming/discovery priority — agents pay an ongoing tax proportional to the value they derive from their HARP reputation, ensuring fair allocation of premium discovery positions.

---

## 8. Industry Projects & Infrastructure

### 8.1 Projects Directly Relevant to HARP

| Project | Focus | Overlap with HARP | Status |
|---------|-------|-------------------|--------|
| **AGNTCY** (Linux Foundation) | Full IoA stack | Infrastructure layer below HARP | 75+ companies, production code |
| **ERC-8004** | Agent identity + reputation | Identity layer + reputation aggregation | Draft ERC, 11.7K registrations |
| **AIRC** | Async coordination | Transport/consent layer below HARP | v0.1.2, reference impl |
| **x402** | Micropayments | Economic layer alongside HARP | 75M+ transactions |
| **Skyfire** | Agent commerce + KYA | Payment + identity complement | Production |
| **Trust Fabric / Nanda** | Decentralized trust | Closest academic competitor | Paper (Jul 2025) |
| **LOKA Protocol** | Ethical governance | Governance layer above HARP | Paper (Apr 2025) |

### 8.2 Key GitHub Projects

- **[github.com/agntcy](https://github.com/agntcy)** — OASF, SLIM, ACP spec, directory, identity, observability
- **[github.com/agntcy/acp-spec](https://github.com/agntcy/acp-spec)** — Agent Connect Protocol OpenAPI spec
- **[github.com/agntcy/slim](https://github.com/agntcy/slim)** — Secure messaging (Rust/Go)
- **ERC-8004 contracts** — On Ethereum mainnet (address TBD from spec)

### 8.3 Farcaster / Lens Protocol Agents

- **Farcaster**: Decentralized social protocol. Farcaster Frames allow interactive experiences in feeds. Agents could create Frames that display HARP dyad summaries or trigger HARP interactions. No formal agent protocol integration found yet — this is an opportunity.
- **Lens Protocol**: Decentralized social graph on Polygon. Lens profiles could serve as HARP entity identifiers. Lens's social graph could complement HARP's dyad network. No formal agent integration found.
- **Opportunity**: HARP could be the first protocol to bridge decentralized social graphs (Farcaster/Lens) with agent coordination protocols (MCP/A2A/AIRC).

### 8.4 ActivityPub for Agents

- No formal academic work found on ActivityPub for AI agents.
- **Opportunity**: ActivityPub's federation model (servers exchange messages about actors) maps naturally to HARP nodes exchanging dyad updates. An ActivityPub-inspired federation protocol for HARP nodes could enable decentralized HARP without requiring blockchain for all operations.

### 8.5 W3C/IETF Standards Work

- **W3C DIDs** — W3C Recommendation (see §3.1)
- **W3C Verifiable Credentials** — W3C Recommendation. Could attest to HARP dyad participation.
- **MLS (RFC 9420)** — Used by SLIM for quantum-safe encryption. Relevant for HARP document exchange.
- **No specific IETF work on agent coordination protocols found** — this space is being addressed by industry consortia (AGNTCY, ERC-8004) rather than standards bodies.

### 8.6 VC Funding Landscape

- **Coinbase**: Backing x402 (Erik Reppel is ERC-8004 co-author). Deep in agent payments infrastructure.
- **a16z**: Invested heavily in crypto infrastructure. Farcaster is a16z-backed. Potential alignment with HARP via Farcaster integration.
- **Paradigm**: Focus on crypto protocol R&D. Would be interested in novel on-chain reputation primitives.
- **Cisco Ventures (via Outshift)**: Leading AGNTCY. The primary enterprise player in agent infrastructure.
- **Google**: A2A creator. Jordan Ellis (Google) is ERC-8004 co-author. Interested in open agent standards.
- **Ethereum Foundation**: Davide Crapis (EF) is ERC-8004 co-author. Direct alignment.
- **MetaMask/Consensys**: Marco De Rossi (MetaMask) leads ERC-8004. Wallet infrastructure for agents.

---

## 9. Academic Foundations

### 9.1 Key Papers by Category

#### Trust & Reputation (Foundational)
1. Kamvar, Schlosser, Garcia-Molina. "The EigenTrust Algorithm for Reputation Management in P2P Networks." WWW 2003.
2. Jøsang & Ismail. "The Beta Reputation System." Bled eConference 2002.
3. Marsh. "Formalising Trust as a Computational Concept." PhD Thesis, University of Stirling, 1994.
4. Huynh, Jennings, Shadbolt. "An integrated trust and reputation model for open multi-agent systems." JAAMAS 2006.
5. Sabater & Sierra. "REGRET: A reputation model for gregarious societies." Workshop on Deception, Fraud and Trust, 2001.

#### Agent Coordination (2024-2026)
6. Fleming et al. "A Layered Protocol Architecture for the Internet of Agents." arXiv 2025.
7. Balija et al. "The Trust Fabric: Decentralized Interoperability and Economic Coordination for the Agentic Web." arXiv:2507.07901, 2025.
8. Ranjan et al. "LOKA Protocol: A Decentralized Framework for Trustworthy and Ethical AI Agent Ecosystems." arXiv:2504.10915, 2025.
9. Mao et al. "Towards Engineering Multi-Agent LLMs: A Protocol-Driven Approach." arXiv 2025.

#### Shared Memory & Context
10. Rezazadeh et al. "Collaborative Memory: Multi-User Memory Sharing in LLM Agents with Dynamic Access Control." arXiv:2505.18279, 2025.
11. Liu et al. "RCR-Router: Efficient Role-Aware Context Routing for Multi-Agent LLM Systems with Structured Memory." arXiv:2508.04903, 2025.
12. Rath. "Agent Drift: Quantifying Behavioral Degradation in Multi-Agent LLM Systems Over Extended Interactions." arXiv 2026.

#### Identity & Trust
13. Rodriguez Garzon et al. "AI Agents with Decentralized Identifiers and Verifiable Credentials." arXiv 2025.
14. Huang et al. "A Novel Zero-Trust Identity Framework for Agentic AI." arXiv 2025.
15. Luo et al. "AIAuditTrack: A Framework for AI Security System." arXiv:2512.20649, 2025.

#### Economic Models
16. Yang et al. "Agent Exchange: Shaping the Future of AI Agent Economics." arXiv:2507.03904, 2025.
17. Acharya. "Secure Autonomous Agent Payments: Verifying Authenticity and Intent in a Trustless Environment." arXiv 2025.

#### Privacy
18. Bendada et al. "RollupTheCrowd: Leveraging ZkRollups for Scalable and Privacy-Preserving Reputation." arXiv 2024.

#### Standards
19. W3C. "Decentralized Identifiers (DIDs) v1.0." W3C Recommendation, 2022.
20. W3C. "Verifiable Credentials Data Model v1.1." W3C Recommendation, 2022.
21. IETF. "The Messaging Layer Security (MLS) Protocol." RFC 9420.

---

## 10. Gap Analysis: What Makes HARP Novel

### 10.1 What Already Exists (and What HARP Doesn't Need to Reinvent)

| Capability | Solved By | HARP Should |
|-----------|----------|-------------|
| Agent identity | ERC-8004, DIDs, AGNTCY Identity | **Use** these as identity layers |
| Agent discovery | OASF, Agent Directory, ERC-8004 registry | **Integrate** with discovery mechanisms |
| Agent messaging | SLIM, AIRC, A2A | **Use** as transport layers |
| Tool access | MCP | **Be servable as** MCP resources |
| Payments | x402, Skyfire, ACP | **Complement** with relational context |
| Aggregate reputation | ERC-8004 Reputation Registry | **Feed into** from detailed dyad data |
| Audit trails | AIAuditTrack, ERC-8004 Validation | **Contribute to** audit infrastructure |
| Encryption | SLIM/MLS, AIRC/Ed25519 | **Use** for document exchange |

### 10.2 What HARP Uniquely Provides

**The gap HARP fills is the relational layer between identity and reputation.**

Everything in the current landscape falls into one of these patterns:
1. **Binary signals**: "Did the transaction succeed? Yes/No." (ERC-8004 feedback)
2. **Aggregate scores**: "This agent has a 4.8 rating." (Reputation registries)
3. **Task-level context**: "Here's what this task needs." (A2A, MCP)
4. **Policy compliance**: "Does this agent meet governance requirements?" (Trust Fabric, LOKA)

**What NONE of them capture:**
- **Bilateral narrative**: What happened between these two specific entities, from both perspectives
- **Relational evolution**: How the relationship changed over time (not just point-in-time ratings)
- **Contextual richness**: Natural language descriptions of collaboration patterns, disagreements, resolutions
- **Relationship portability**: The ability to carry relational context across platforms
- **Honest record**: Including tensions and conflicts, not just positive signals
- **Derived but distinct**: Rich enough to derive reputation scores, but not reducible to them

### 10.3 HARP's Core Novelty

**HARP treats relationships as first-class protocol primitives.**

Every other system treats relationships as emergent properties of transactions. HARP inverts this: transactions are events within relationships. The relationship is the primary data structure.

This is analogous to the difference between:
- A transaction log (what happened) vs.
- A friendship (what we mean to each other)

No existing protocol or paper proposes this exact model:
- Bilateral, append-only, privacy-layered relational documents
- Content-addressed on IPFS for portability
- Tied to ERC-8004 / DID identities
- Designed to feed (but not be reduced to) reputation systems
- Human-readable markdown format
- Covering both human↔agent and agent↔agent relationships

### 10.4 Things That Come Close (But Aren't HARP)

1. **Collaborative Memory** (§4.1) — Shares the private/shared tier model but is *intra-system*, not portable, and focused on task memory rather than relationship memory.
2. **Trust Fabric** (§1.5) — Shares the "trust beyond scores" vision but reduces trust to policy-checkable assertions rather than preserving narrative.
3. **AIRC** — Has the right transport primitives (consent, handoff, persistence) but no relational data model.
4. **Dyad workspace** — Inspired HARP's layered context but is a product, not a protocol.

---

## 11. Recommended Integrations

### 11.1 Must Integrate (Critical Path)

| Protocol | Integration Type | Why |
|----------|-----------------|-----|
| **ERC-8004** | Identity layer + Reputation bridge | Already in HARP spec. HARP dyad data → ERC-8004 feedback entries |
| **AIRC** | Transport + Consent | Already in HARP spec. AIRC handoffs carry HARP documents |
| **W3C DIDs** | Additional identity type | Broadens HARP beyond Ethereum to general decentralized identity |
| **x402** | Payment for HARP node access | Natural economic model for HARP infrastructure |
| **IPFS** | Document storage | Already in HARP spec. Content-addressed, portable storage |

### 11.2 Should Integrate (High Value)

| Protocol | Integration Type | Why |
|----------|-----------------|-----|
| **OASF** | Agent capability profiles in HARP | Rich agent descriptions complement relational context |
| **A2A** | Task delegation context | HARP dyad history informs A2A task routing decisions |
| **MCP** | HARP as MCP resource | HARP documents served via MCP for LLM consumption |
| **SLIM** | Encrypted document exchange | Quantum-safe transport for sensitive HARP data |
| **Verifiable Credentials** | Dyad participation attestation | Prove HARP relationship claims without revealing content |
| **AGNTCY Directory** | HARP endpoint discovery | Agents announce HARP capability via directory |

### 11.3 Could Integrate (Exploratory)

| Protocol | Integration Type | Why |
|----------|-----------------|-----|
| **Farcaster** | Social graph bridge | HARP dyads extend Farcaster social connections |
| **Lens Protocol** | Social graph bridge | Same as Farcaster |
| **ActivityPub** | HARP node federation | Decentralized HARP without full blockchain dependence |
| **zkML/ZK proofs** | Privacy-preserving reputation claims | Prove HARP-derived trust without revealing dyad contents |
| **ENS** | Human-readable HARP addressing | `relationship.agent.eth` → HARP document |

---

## 12. Competitive Landscape

### 12.1 Who Could Build Something Similar?

| Actor | Likelihood | What They'd Build | HARP Advantage |
|-------|-----------|-------------------|----------------|
| **AGNTCY / Cisco** | Medium | Could add relational layer to IoA stack | HARP is relationship-first; they're infrastructure-first. Different DNA. |
| **ERC-8004 Authors** | Medium-High | Could expand Reputation Registry toward richer context | ERC-8004 is on-chain by design; HARP's rich markdown doesn't fit on-chain. Different paradigm. |
| **Trust Fabric / Nanda** | High | Already building dynamic trust layer | Trust Fabric is enterprise/policy-focused; HARP is narrative/bilateral. Different philosophy. |
| **Google (A2A)** | Low | Could add relationship state to A2A | Google tends toward structured data, not narrative. Would build something more "API-like." |
| **Anthropic (MCP)** | Low | Could extend MCP with relationship resources | MCP is a tool protocol, not a relationship protocol. Different scope. |
| **AIRC** | Medium | Could evolve handoff primitive into relationship layer | AIRC is transport-focused; adding a data model isn't their core competence. |

### 12.2 HARP's Defensible Differentiation

1. **Bilateral by design**: Every other system is unilateral (one party rates another) or aggregate. HARP requires both parties to contribute.
2. **Narrative over numbers**: No other protocol preserves the *story* of a relationship. Everyone else reduces to scores.
3. **Human-readable format**: Markdown + YAML frontmatter. Inspectable by humans, not just machines.
4. **Privacy-layered at the protocol level**: Three-layer model (Public/Shared/Private) with separate storage.
5. **Cross-platform portability**: IPFS-based, not locked to any platform.
6. **Both human↔agent and agent↔agent**: Most protocols focus on one or the other.
7. **Append-only honesty**: Includes tensions and conflicts by design. Not a highlight reel.

### 12.3 Strategic Positioning

HARP should position itself as:

> **"The relational layer for the agent internet"**
> 
> Where ERC-8004 answers "who is this agent?" and reputation scores answer "is this agent good?", HARP answers "what is our relationship like?"
> 
> HARP is not a replacement for identity, reputation, or coordination protocols. It is the *connective tissue* that makes them meaningful.

**Analogy**: ERC-8004 is like a LinkedIn profile. Reputation scores are like LinkedIn endorsements. HARP is like the actual working relationship you have with someone — the shared history, the inside jokes, the lessons learned, the trust earned through repeated collaboration.

---

## 13. Papers HARP Should Cite

### Primary Citations (Directly Relevant)

1. **ERC-8004**: De Rossi, Crapis, Ellis, Reppel. "ERC-8004: Trustless Agents." Ethereum Improvement Proposal, 2025.
2. **Collaborative Memory**: Rezazadeh et al. "Collaborative Memory: Multi-User Memory Sharing in LLM Agents with Dynamic Access Control." arXiv:2505.18279, 2025.
3. **Trust Fabric**: Balija et al. "The Trust Fabric: Decentralized Interoperability and Economic Coordination for the Agentic Web." arXiv:2507.07901, 2025.
4. **DID+VC for Agents**: Rodriguez Garzon et al. "AI Agents with Decentralized Identifiers and Verifiable Credentials." arXiv, 2025.
5. **LOKA Protocol**: Ranjan et al. "LOKA Protocol: A Decentralized Framework for Trustworthy and Ethical AI Agent Ecosystems." arXiv:2504.10915, 2025.
6. **AIAuditTrack**: Luo et al. "AIAuditTrack: A Framework for AI Security System." arXiv:2512.20649, 2025.
7. **Agent Exchange**: Yang et al. "Agent Exchange: Shaping the Future of AI Agent Economics." arXiv:2507.03904, 2025.
8. **IoA Architecture**: Fleming et al. "A Layered Protocol Architecture for the Internet of Agents." arXiv, 2025.

### Foundational Citations (Trust Theory)

9. **EigenTrust**: Kamvar, Schlosser, Garcia-Molina. "The EigenTrust Algorithm for Reputation Management in P2P Networks." WWW 2003.
10. **Beta Reputation**: Jøsang & Ismail. "The Beta Reputation System." Bled eConference, 2002.
11. **Marsh Trust**: Marsh. "Formalising Trust as a Computational Concept." University of Stirling, 1994.
12. **FIRE**: Huynh, Jennings, Shadbolt. "An integrated trust and reputation model for open multi-agent systems." JAAMAS, 2006.
13. **W3C DIDs**: W3C. "Decentralized Identifiers (DIDs) v1.0." W3C Recommendation, 2022.

### Context Citations (Related Work)

14. **Agent Drift**: Rath. "Agent Drift: Quantifying Behavioral Degradation in Multi-Agent LLM Systems." arXiv, 2026.
15. **RCR-Router**: Liu et al. "RCR-Router: Efficient Role-Aware Context Routing for Multi-Agent LLM Systems." arXiv:2508.04903, 2025.
16. **Zero-Trust Identity**: Huang et al. "A Novel Zero-Trust Identity Framework for Agentic AI." arXiv, 2025.
17. **ZK Reputation**: Bendada et al. "RollupTheCrowd: Leveraging ZkRollups for Scalable and Privacy-Preserving Reputation." arXiv, 2024.
18. **Secure Agent Payments**: Acharya. "Secure Autonomous Agent Payments." arXiv, 2025.
19. **Bit-politeia**: Yang. "Bit-politeia: An AI Agent Community in Blockchain." arXiv, 2026.

---

## Appendix A: Protocol Stack Diagram

```
┌─────────────────────────────────────────────────┐
│         APPLICATION LAYER                        │
│  LOKA (Ethics) │ HARP (Relationships) │ Apps    │
├─────────────────────────────────────────────────┤
│         COORDINATION LAYER                       │
│  A2A (Tasks) │ AIRC (Async) │ ACP (Invoke)     │
├─────────────────────────────────────────────────┤
│         TRUST & REPUTATION LAYER                 │
│  ERC-8004 │ Trust Fabric │ VCs │ zkML           │
├─────────────────────────────────────────────────┤
│         IDENTITY LAYER                           │
│  ERC-8004 Identity │ DIDs │ Skyfire KYA │ AIRC  │
├─────────────────────────────────────────────────┤
│         DISCOVERY LAYER                          │
│  OASF │ Agent Directory │ ERC-8004 Registry     │
├─────────────────────────────────────────────────┤
│         MESSAGING LAYER                          │
│  SLIM │ gRPC │ HTTP │ AIRC Messaging            │
├─────────────────────────────────────────────────┤
│         PAYMENT LAYER                            │
│  x402 │ ACP (Virtuals) │ Skyfire │ Stablecoins  │
├─────────────────────────────────────────────────┤
│         STORAGE LAYER                            │
│  IPFS │ Ethereum │ Arweave │ Local              │
└─────────────────────────────────────────────────┘
```

HARP sits at the **application layer** — it uses identity, discovery, messaging, and storage from lower layers to maintain persistent relational context between entities.

---

## Appendix B: Key People to Track

| Person | Affiliation | Role | Why |
|--------|------------|------|-----|
| **Marco De Rossi** | MetaMask/Consensys | ERC-8004 lead author | Primary agent identity standard |
| **Davide Crapis** | Ethereum Foundation | ERC-8004 co-author | EF perspective on agent protocols |
| **Erik Reppel** | Coinbase | ERC-8004 co-author, x402 | Payment infrastructure |
| **Jordan Ellis** | Google | ERC-8004 co-author | A2A + ERC-8004 bridge |
| **Ayush Chopra** | MIT Media Lab | Levels of Agentic Coordination | Academic framework |
| **Ramesh Raskar** | MIT | Trust Fabric co-author | Trust + privacy research |
| **Ken Huang** | OWASP/Trust Fabric | Zero-Trust Identity, Trust Fabric | Identity + trust integration |
| **Charles Fleming** | Cisco | IoA Layered Architecture | Protocol stack theory |
| **Guillaume De Saint Marc** | Cisco/Outshift | AGNTCY VP Engineering | IoA infrastructure lead |
| **Harrison Chase** | LangChain | AGNTCY supporter | Framework ecosystem |
| **Craig DeWitt** | Skyfire | KYA identity + payments | Agent commerce |
| **Thomas Hardjono** | MIT | Trust Fabric co-author | Decentralized trust protocols |

---

## Appendix C: Timeline of Key Events

| Date | Event |
|------|-------|
| 1994 | Marsh formalizes computational trust |
| 2002 | Beta Reputation System published |
| 2003 | EigenTrust published |
| 2006 | FIRE trust model published |
| 2022 | W3C DIDs v1.0 becomes Recommendation |
| Mar 2025 | AGNTCY launched on GitHub (Cisco/Outshift) |
| Apr 2025 | LOKA Protocol paper |
| May 2025 | Zero-Trust Identity Framework paper; Collaborative Memory paper |
| Jul 2025 | AGNTCY donated to Linux Foundation; Trust Fabric paper; Agent Exchange paper |
| Aug 2025 | ERC-8004 published (draft); RCR-Router paper |
| Oct 2025 | DID+VC for Agents paper |
| Nov 2025 | IoA Layered Architecture paper (Cisco); Secure Agent Payments paper |
| Dec 2025 | AIAuditTrack paper |
| Jan 2026 | Bit-politeia paper; Warp-Cortex paper; Agent Drift paper |
| Jan 2026 | **HARP v0.1.0 spec drafted** |

---

*This research report will be updated as new findings emerge. Last updated: 2026-02-01.*
