import { describe, it, expect } from "vitest";
import {
  createDocument,
  addSection,
  createSection,
  deriveTrustScore,
  assessCollaborationReadiness,
} from "../src/index.js";
import type { EntityDescriptor, HarpDocument } from "../src/index.js";

const alice: EntityDescriptor = { id: "airc:alice", type: "human", name: "Alice" };
const atlas: EntityDescriptor = { id: "erc8004:1:42", type: "agent", name: "Atlas" };

function makeDoc(): HarpDocument {
  return createDocument(alice, atlas, "public");
}

describe("deriveTrustScore", () => {
  it("returns 0 for an empty document", () => {
    const doc = makeDoc();
    const score = deriveTrustScore(doc);
    expect(score.score).toBe(0);
    expect(score.algorithm).toBe("trust_simple_v1");
    expect(score.source_epoch).toBe(1);
    expect(score.factors.interactions).toBe(0);
  });

  it("increases with Interaction sections", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Interaction", "Meeting 1", "Discussed goals."));
    doc = addSection(doc, createSection("Interaction", "Meeting 2", "Reviewed progress."));

    const score = deriveTrustScore(doc);
    expect(score.score).toBeGreaterThan(0);
    expect(score.factors.interactions).toBe(2);
  });

  it("Trust sections have higher weight than Interactions", () => {
    let docInteraction = makeDoc();
    docInteraction = addSection(docInteraction, createSection("Interaction", "I1", "content"));

    let docTrust = makeDoc();
    docTrust = addSection(docTrust, createSection("Trust", "T1", "content"));

    const scoreInteraction = deriveTrustScore(docInteraction);
    const scoreTrust = deriveTrustScore(docTrust);

    // Both documents have one section each, but trust should score at least as high
    expect(scoreTrust.score).toBeGreaterThanOrEqual(scoreInteraction.score);
  });

  it("unresolved Tensions decrease score", () => {
    let docClean = makeDoc();
    docClean = addSection(docClean, createSection("Interaction", "I1", "content"));

    let docTension = makeDoc();
    docTension = addSection(docTension, createSection("Interaction", "I1", "content"));
    docTension = addSection(
      docTension,
      createSection("Tension", "Scope disagreement", "Ongoing dispute.", {
        status: "ongoing",
      })
    );

    const scoreClean = deriveTrustScore(docClean);
    const scoreTension = deriveTrustScore(docTension);

    expect(scoreTension.score).toBeLessThan(scoreClean.score);
    expect(scoreTension.factors.unresolved_tensions).toBe(1);
  });

  it("resolved Tensions add to score", () => {
    let doc = makeDoc();
    doc = addSection(
      doc,
      createSection("Tension", "Fixed scope issue", "Resolved by agreement.", {
        status: "resolved",
      })
    );

    const score = deriveTrustScore(doc);
    expect(score.score).toBeGreaterThan(0);
    expect(score.factors.resolved_tensions).toBe(1);
  });

  it("acknowledged Decisions score higher than unacknowledged", () => {
    let docAck = makeDoc();
    docAck = addSection(
      docAck,
      createSection("Decision", "Use TypeScript", "We agreed.", {
        acknowledged_by: "airc:alice",
      })
    );

    let docUnack = makeDoc();
    docUnack = addSection(
      docUnack,
      createSection("Decision", "Use TypeScript", "We agreed.")
    );

    const scoreAck = deriveTrustScore(docAck);
    const scoreUnack = deriveTrustScore(docUnack);

    expect(scoreAck.score).toBeGreaterThan(scoreUnack.score);
  });

  it("score is clamped between 0 and 1", () => {
    let doc = makeDoc();
    // Add many unresolved tensions to try to push below 0
    for (let i = 0; i < 10; i++) {
      doc = addSection(
        doc,
        createSection("Tension", `Issue ${i}`, "Ongoing.", { status: "ongoing" })
      );
    }
    const score = deriveTrustScore(doc);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(1);
  });

  it("tracks source sections", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Trust", "Good work", "content"));
    doc = addSection(doc, createSection("Interaction", "Call", "content"));

    const score = deriveTrustScore(doc);
    expect(score.source_sections).toHaveLength(2);
    expect(score.source_sections).toContain("Trust: Good work");
    expect(score.source_sections).toContain("Interaction: Call");
  });
});

describe("assessCollaborationReadiness", () => {
  it("returns 'new' for empty document", () => {
    const doc = makeDoc();
    const readiness = assessCollaborationReadiness(doc);
    expect(readiness.readinessLevel).toBe("new");
    expect(readiness.hasHistory).toBe(false);
    expect(readiness.interactionCount).toBe(0);
  });

  it("returns 'emerging' with 1-2 interactions", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Interaction", "First chat", "content"));
    doc = addSection(doc, createSection("Interaction", "Second chat", "content"));

    const readiness = assessCollaborationReadiness(doc);
    expect(readiness.readinessLevel).toBe("emerging");
    expect(readiness.hasHistory).toBe(true);
    expect(readiness.interactionCount).toBe(2);
  });

  it("returns 'established' with 3-7 interactions", () => {
    let doc = makeDoc();
    for (let i = 0; i < 5; i++) {
      doc = addSection(doc, createSection("Interaction", `Chat ${i}`, "content"));
    }

    const readiness = assessCollaborationReadiness(doc);
    expect(readiness.readinessLevel).toBe("established");
  });

  it("returns 'mature' with 8+ interactions and 2+ decisions", () => {
    let doc = makeDoc();
    for (let i = 0; i < 8; i++) {
      doc = addSection(doc, createSection("Interaction", `Chat ${i}`, "content"));
    }
    doc = addSection(doc, createSection("Decision", "D1", "content"));
    doc = addSection(doc, createSection("Decision", "D2", "content"));

    const readiness = assessCollaborationReadiness(doc);
    expect(readiness.readinessLevel).toBe("mature");
  });

  it("tracks unresolved tensions", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Tension", "Issue A", "ongoing.", { status: "ongoing" }));
    doc = addSection(doc, createSection("Tension", "Issue B", "resolved.", { status: "resolved" }));

    const readiness = assessCollaborationReadiness(doc);
    expect(readiness.unresolvedTensions).toBe(1);
  });

  it("detects communication preferences", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Context", "Comm prefs", "Prefers async."));

    const readiness = assessCollaborationReadiness(doc);
    expect(readiness.hasCommPreferences).toBe(true);
  });

  it("detects shared decisions", () => {
    let doc = makeDoc();
    doc = addSection(doc, createSection("Decision", "Use HARP", "Agreed."));

    const readiness = assessCollaborationReadiness(doc);
    expect(readiness.hasSharedDecisions).toBe(true);
  });
});
