/**
 * HARP Quick Start — Create a dyad, add context, derive trust.
 *
 * Run:  npm run example:quickstart
 */

import {
  HarpClient,
  createSection,
  serializeDocument,
} from "../src/index";

async function main() {
  // 1. Create a client with in-memory storage
  const client = new HarpClient({
    identity: { entityId: "airc:alice", type: "human" },
    storage: "memory",
  });

  // 2. Create a dyad between Alice (human) and Atlas (agent)
  const { document, cid } = await client.createDyad(
    { id: "airc:alice", type: "human", name: "Alice" },
    { id: "erc8004:1:42", type: "agent", name: "Atlas" },
    "public",
    "Collaboration on documentation projects"
  );

  const dyadId = document.frontmatter.dyad;
  console.log(`✅ Dyad created: ${dyadId}`);
  console.log(`   CID: ${cid}\n`);

  // 3. Add a Context section (communication preferences)
  await client.addSectionToDyad(
    dyadId,
    "public",
    createSection("Context", "Communication preferences", "Alice prefers async updates. Atlas responds within 5 minutes.", {
      author: "airc:alice",
    })
  );

  // 4. Add an Interaction section
  await client.addSectionToDyad(
    dyadId,
    "public",
    createSection("Interaction", "First code review session", "Atlas reviewed the HARP parser module. Caught 3 edge cases. Turnaround: 2 hours.", {
      author: "airc:alice",
    })
  );

  // 5. Query sections by type
  const interactions = await client.querySections(dyadId, "public", {
    types: ["Interaction"],
  });
  console.log(`📋 Interactions: ${interactions.length}`);

  // 6. Derive a trust score
  const score = await client.getTrustScore(dyadId);
  console.log(`🤝 Trust score: ${score!.score} (${score!.algorithm})`);

  // 7. Assess collaboration readiness
  const readiness = await client.getCollaborationReadiness(dyadId);
  console.log(`📊 Readiness: ${readiness!.readinessLevel}\n`);

  // 8. Serialize the document to markdown
  const doc = await client.getDyad(dyadId, "public");
  const markdown = serializeDocument(doc!);

  console.log("─".repeat(60));
  console.log(markdown);
}

main().catch(console.error);
