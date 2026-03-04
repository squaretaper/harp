import { describe, it, expect, beforeEach } from "vitest";
import {
  HarpClient,
  createDocument,
  createSection,
  addSection,
  serializeDocument,
  serializeSection,
  parseDocument,
  createProposal,
  createUpdateNotification,
  createContextAttachment,
} from "../src/index.js";
import type { EntityDescriptor } from "../src/index.js";

const alice: EntityDescriptor = { id: "airc:alice", type: "human", name: "Alice" };
const atlas: EntityDescriptor = { id: "erc8004:1:42", type: "agent", name: "Atlas" };

describe("HarpClient", () => {
  let client: HarpClient;

  beforeEach(() => {
    client = new HarpClient({
      identity: { entityId: "airc:alice", type: "human" },
      storage: "memory",
    });
  });

  it("creates a dyad and retrieves it", async () => {
    const { document, cid } = await client.createDyad(alice, atlas, "public", "Test");
    expect(cid).toMatch(/^bafymem/);
    expect(document.frontmatter.epoch).toBe(1);

    const retrieved = await client.getDyad(document.frontmatter.dyad, "public");
    expect(retrieved).not.toBeNull();
    expect(retrieved!.frontmatter.dyad).toBe(document.frontmatter.dyad);
  });

  it("adds a section and increments epoch", async () => {
    const { document } = await client.createDyad(alice, atlas, "public");
    const dyadId = document.frontmatter.dyad;

    const section = createSection("Trust", "Reliable", "Always on time.");
    const { document: updated } = await client.addSectionToDyad(dyadId, "public", section);

    expect(updated.frontmatter.epoch).toBe(2);
    expect(updated.sections).toHaveLength(1);
  });

  it("queries sections with filter", async () => {
    const { document } = await client.createDyad(alice, atlas, "public");
    const dyadId = document.frontmatter.dyad;

    await client.addSectionToDyad(dyadId, "public", createSection("Trust", "T1", "content"));
    await client.addSectionToDyad(dyadId, "public", createSection("Interaction", "I1", "content"));

    const trusts = await client.querySections(dyadId, "public", { types: ["Trust"] });
    expect(trusts).toHaveLength(1);
    expect(trusts[0].type).toBe("Trust");
  });

  it("derives trust score for a dyad", async () => {
    const { document } = await client.createDyad(alice, atlas, "public");
    const dyadId = document.frontmatter.dyad;

    await client.addSectionToDyad(dyadId, "public", createSection("Trust", "T1", "content"));
    const score = await client.getTrustScore(dyadId);
    expect(score).not.toBeNull();
    expect(score!.score).toBeGreaterThan(0);
  });

  it("assesses collaboration readiness", async () => {
    const { document } = await client.createDyad(alice, atlas, "public");
    const readiness = await client.getCollaborationReadiness(document.frontmatter.dyad);
    expect(readiness).not.toBeNull();
    expect(readiness!.readinessLevel).toBe("new");
  });

  it("returns null for non-existent dyad", async () => {
    const result = await client.getDyad("harp:airc:unknown:erc8004:1:99", "public");
    expect(result).toBeNull();
  });

  it("creates AIRC proposal", () => {
    const proposal = client.createProposal("erc8004:1:42", "Let's collaborate");
    expect(proposal.type).toBe("harp_propose");
    expect(proposal.from).toBe("airc:alice");
    expect(proposal.to).toBe("erc8004:1:42");
    expect(proposal.initial_context).toBe("Let's collaborate");
  });

  it("creates handoff context", async () => {
    const { document } = await client.createDyad(alice, atlas, "public");
    const dyadId = document.frontmatter.dyad;
    await client.addSectionToDyad(dyadId, "public", createSection("Trust", "T1", "content"));

    const ctx = await client.createHandoffContext(dyadId, "public", ["Trust"]);
    expect(ctx).not.toBeNull();
    expect(ctx!.type).toBe("harp_context");
    expect(ctx!.relevant_sections).toContain("Trust: T1");
  });

  it("throws for IPFS storage (not yet implemented)", () => {
    expect(() => new HarpClient({
      identity: { entityId: "airc:alice", type: "human" },
      storage: "ipfs",
    })).toThrow("IPFS storage not yet implemented");
  });
});

describe("createProposal", () => {
  it("creates a valid AIRC proposal", () => {
    const proposal = createProposal("airc:alice", "erc8004:1:42", "Test context");
    expect(proposal.type).toBe("harp_propose");
    expect(proposal.from).toBe("airc:alice");
    expect(proposal.to).toBe("erc8004:1:42");
    expect(proposal.dyad).toBe("harp:airc:alice:erc8004:1:42");
    expect(proposal.initial_context).toBe("Test context");
    expect(proposal.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("normalizes entity IDs", () => {
    const proposal = createProposal("airc:Alice", "erc8004:01:042");
    expect(proposal.from).toBe("airc:alice");
    expect(proposal.to).toBe("erc8004:1:42");
  });
});

describe("createUpdateNotification", () => {
  it("creates a valid AIRC update notification", () => {
    const notif = createUpdateNotification(
      "airc:alice", "erc8004:1:42", "shared", 3, "bafytest123"
    );
    expect(notif.type).toBe("harp_update");
    expect(notif.from).toBe("airc:alice");
    expect(notif.to).toBe("erc8004:1:42");
    expect(notif.dyad).toBe("harp:airc:alice:erc8004:1:42");
    expect(notif.layer).toBe("shared");
    expect(notif.epoch).toBe(3);
    expect(notif.cid).toBe("bafytest123");
    expect(notif.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("createContextAttachment", () => {
  it("creates a valid context attachment", () => {
    const ctx = createContextAttachment(
      "harp:airc:alice:erc8004:1:42", "public", "bafyxyz", ["Trust: Good work"]
    );
    expect(ctx.type).toBe("harp_context");
    expect(ctx.dyad).toBe("harp:airc:alice:erc8004:1:42");
    expect(ctx.layer).toBe("public");
    expect(ctx.cid).toBe("bafyxyz");
    expect(ctx.relevant_sections).toEqual(["Trust: Good work"]);
  });

  it("works without relevant sections", () => {
    const ctx = createContextAttachment("harp:airc:alice:erc8004:1:42", "shared", "bafyabc");
    expect(ctx.relevant_sections).toBeUndefined();
  });
});

describe("serializeSection", () => {
  it("serializes a section with type and title", () => {
    const section = createSection("Trust", "Good work", "Content here.");
    const serialized = serializeSection(section);
    expect(serialized).toContain("## Trust: Good work");
    expect(serialized).toContain("Content here.");
  });

  it("includes meta block when meta is present", () => {
    const section = createSection("Interaction", "Meeting", "We met.", {
      author: "airc:alice",
      tags: ["planning"],
    });
    const serialized = serializeSection(section);
    expect(serialized).toContain("<!-- harp:meta");
    expect(serialized).toContain('author: "airc:alice"');
    expect(serialized).toContain("-->");
  });

  it("omits meta block when no meta", () => {
    const section = createSection("Note", "A note", "Just a note.");
    // Section created without meta parameter still gets a timestamp
    // But let's test with a manually constructed section
    const bareSection = { type: "Note" as const, title: "Bare", content: "No meta.", raw: "" };
    const serialized = serializeSection(bareSection);
    expect(serialized).not.toContain("<!-- harp:meta");
    expect(serialized).toContain("## Note: Bare");
    expect(serialized).toContain("No meta.");
  });
});

describe("YAML parser round-trip (entities)", () => {
  it("preserves entity descriptors through serialize → parse → serialize", () => {
    const doc = createDocument(alice, atlas, "shared", "Round-trip test");
    const section = createSection("Trust", "Reliable", "Always delivers.", {
      author: "airc:alice",
    });
    const withSection = addSection(doc, section);

    // First serialize
    const serialized1 = serializeDocument(withSection);
    // Parse
    const parsed = parseDocument(serialized1);

    // Verify entities survived parsing
    expect(parsed.frontmatter.entities).toHaveLength(2);
    expect(parsed.frontmatter.entities[0].id).toBe("airc:alice");
    expect(parsed.frontmatter.entities[0].type).toBe("human");
    expect(parsed.frontmatter.entities[0].name).toBe("Alice");
    expect(parsed.frontmatter.entities[1].id).toBe("erc8004:1:42");
    expect(parsed.frontmatter.entities[1].type).toBe("agent");
    expect(parsed.frontmatter.entities[1].name).toBe("Atlas");

    // Re-serialize and parse again
    const serialized2 = serializeDocument(parsed);
    const reParsed = parseDocument(serialized2);

    expect(reParsed.frontmatter.entities[0].id).toBe("airc:alice");
    expect(reParsed.frontmatter.entities[1].id).toBe("erc8004:1:42");
    expect(reParsed.sections).toHaveLength(1);
  });

  it("preserves preamble without accumulating separators", () => {
    const doc = createDocument(alice, atlas, "public", "My preamble text");

    // Multiple round-trips
    let serialized = serializeDocument(doc);
    let parsed = parseDocument(serialized);
    serialized = serializeDocument(parsed);
    parsed = parseDocument(serialized);
    serialized = serializeDocument(parsed);
    parsed = parseDocument(serialized);

    // Preamble should not have accumulated --- separators
    expect(parsed.preamble).not.toContain("---");
    expect(parsed.preamble).toContain("My preamble text");
  });

  it("handles entities with erc8004 metadata", () => {
    const agentWithErc = {
      id: "erc8004:1:42",
      type: "agent" as const,
      name: "Atlas",
      erc8004: { chainId: 1, agentId: 42 },
    };
    const doc = createDocument(alice, agentWithErc, "public");
    const serialized = serializeDocument(doc);
    const parsed = parseDocument(serialized);

    const agentEntity = parsed.frontmatter.entities.find(
      (e) => e.id === "erc8004:1:42"
    );
    expect(agentEntity).toBeDefined();
    expect(agentEntity!.erc8004).toBeDefined();
    expect(agentEntity!.erc8004!.chainId).toBe(1);
    expect(agentEntity!.erc8004!.agentId).toBe(42);
  });
});
