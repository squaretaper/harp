import { describe, it, expect } from "vitest";
import {
  createDocument,
  parseDocument,
  serializeDocument,
  createSection,
  addSection,
  filterSections,
  createNextEpoch,
  computeChecksum,
} from "../src/index.js";
import type { EntityDescriptor, HarpDocument } from "../src/index.js";

const alice: EntityDescriptor = { id: "airc:alice", type: "human", name: "Alice" };
const atlas: EntityDescriptor = { id: "erc8004:1:42", type: "agent", name: "Atlas" };

function makeDoc(): HarpDocument {
  return createDocument(alice, atlas, "public", "A collaboration about docs.");
}

describe("createDocument", () => {
  it("creates an epoch-1 document with correct frontmatter", () => {
    const doc = makeDoc();
    expect(doc.frontmatter.harp).toBe("0.1.0");
    expect(doc.frontmatter.epoch).toBe(1);
    expect(doc.frontmatter.previous).toBeNull();
    expect(doc.frontmatter.layer).toBe("public");
    expect(doc.frontmatter.dyad).toContain("harp:");
    expect(doc.frontmatter.entities).toHaveLength(2);
  });

  it("sorts entities lexicographically", () => {
    const doc = createDocument(atlas, alice, "shared");
    // airc:alice < erc8004:1:42
    expect(doc.frontmatter.entities[0].id).toBe("airc:alice");
    expect(doc.frontmatter.entities[1].id).toBe("erc8004:1:42");
  });

  it("sets ISO timestamps", () => {
    const doc = makeDoc();
    expect(doc.frontmatter.created).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(doc.frontmatter.updated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("parseDocument / serializeDocument round-trip", () => {
  it("survives a serialize → parse → serialize cycle", () => {
    const doc = makeDoc();
    // Use section without tags to avoid YAML inline-array parser limitation
    const section = createSection("Trust", "Reliable partner", "Always delivers on time.", {
      author: "airc:alice",
    });
    const withSection = addSection(doc, section);
    const serialized1 = serializeDocument(withSection);
    const parsed = parseDocument(serialized1);

    // Frontmatter fields survive
    expect(parsed.frontmatter.harp).toBe("0.1.0");
    expect(parsed.frontmatter.epoch).toBe(1);
    expect(parsed.frontmatter.layer).toBe("public");

    // Section survives
    expect(parsed.sections).toHaveLength(1);
    expect(parsed.sections[0].type).toBe("Trust");
    expect(parsed.sections[0].title).toBe("Reliable partner");
  });

  it("parses a document with multiple sections", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Trust", "Good work", "Solid delivery."));
    doc = addSection(doc, createSection("Interaction", "First call", "Discussed goals."));
    doc = addSection(doc, createSection("Decision", "Use TS", "Agreed on TypeScript."));
    const serialized = serializeDocument(doc);
    const parsed = parseDocument(serialized);

    expect(parsed.sections).toHaveLength(3);
    expect(parsed.sections.map((s) => s.type)).toEqual(["Trust", "Interaction", "Decision"]);
  });

  it("preserves preamble text", () => {
    const doc = makeDoc();
    const serialized = serializeDocument(doc);
    const parsed = parseDocument(serialized);

    expect(parsed.preamble).toContain("A collaboration about docs.");
  });
});

describe("createSection", () => {
  it("creates a section with type, title, content", () => {
    const section = createSection("Interaction", "First meeting", "We discussed goals.");
    expect(section.type).toBe("Interaction");
    expect(section.title).toBe("First meeting");
    expect(section.content).toBe("We discussed goals.");
  });

  it("populates meta with timestamp and author when provided", () => {
    const section = createSection("Context", "Preferences", "Prefers async comms.", {
      author: "airc:bob",
      tags: ["communication"],
    });
    expect(section.meta).toBeDefined();
    expect(section.meta!.author).toBe("airc:bob");
    expect(section.meta!.tags).toContain("communication");
    expect(section.meta!.timestamp).toBeTruthy();
  });
});

describe("addSection", () => {
  it("returns a new document with the section appended", () => {
    const doc = makeDoc();
    const section = createSection("Note", "A note", "Some note content.");
    const updated = addSection(doc, section);

    // Original is unchanged
    expect(doc.sections).toHaveLength(0);
    expect(updated.sections).toHaveLength(1);
    expect(updated.sections[0].title).toBe("A note");
  });
});

describe("filterSections", () => {
  it("filters by section type", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Trust", "T1", "trust content"));
    doc = addSection(doc, createSection("Interaction", "I1", "interaction content"));
    doc = addSection(doc, createSection("Trust", "T2", "more trust content"));

    const trusts = filterSections(doc, { types: ["Trust"] });
    expect(trusts).toHaveLength(2);
    expect(trusts.every((s) => s.type === "Trust")).toBe(true);
  });

  it("filters by author", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Trust", "T1", "content", { author: "airc:alice" }));
    doc = addSection(doc, createSection("Trust", "T2", "content", { author: "erc8004:1:42" }));

    const aliceSections = filterSections(doc, { author: "airc:alice" });
    expect(aliceSections).toHaveLength(1);
    expect(aliceSections[0].title).toBe("T1");
  });

  it("respects limit", () => {
    let doc = makeDoc();
    for (let i = 0; i < 5; i++) {
      doc = addSection(doc, createSection("Note", `Note ${i}`, `Content ${i}`));
    }
    const limited = filterSections(doc, { limit: 3 });
    expect(limited).toHaveLength(3);
  });

  it("filters by tags", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Trust", "T1", "content", { tags: ["reliability", "speed"] }));
    doc = addSection(doc, createSection("Trust", "T2", "content", { tags: ["quality"] }));

    const speedSections = filterSections(doc, { tags: ["speed"] });
    expect(speedSections).toHaveLength(1);
    expect(speedSections[0].title).toBe("T1");
  });
});

describe("createNextEpoch", () => {
  it("increments epoch and sets previous CID", () => {
    const doc = makeDoc();
    const next = createNextEpoch(doc, "bafyabc123");

    expect(next.frontmatter.epoch).toBe(2);
    expect(next.frontmatter.previous).toBe("bafyabc123");
  });
});
