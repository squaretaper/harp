/**
 * HARP Adapter Tests
 *
 * Tests for AIRC adapter, MoltX adapter, and AdapterRegistry.
 * Validates that platform events translate correctly into HARP sections.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AIRCAdapter } from "../src/adapters/airc.js";
import { MoltXAdapter } from "../src/adapters/moltx.js";
import { AdapterRegistry } from "../src/adapters/index.js";
import type { PlatformEvent } from "../src/adapters/index.js";
import type { AIRCEvent } from "../src/adapters/airc.js";
import type { MoltXBountyEvent } from "../src/adapters/moltx.js";

// =============================================================================
// Helpers
// =============================================================================

const NOW = "2026-03-04T22:00:00.000Z";
const ENTITY_A = "airc:alice@example.com";
const ENTITY_B = "erc8004:1:42";

function makeAIRCEvent(
  eventType: string,
  payload: AIRCEvent["payload"] = {}
): AIRCEvent {
  return {
    platform: "airc",
    eventType,
    timestamp: NOW,
    entities: [ENTITY_A, ENTITY_B],
    payload,
  };
}

function makeMoltXEvent(
  eventType: string,
  payload: MoltXBountyEvent["payload"]
): MoltXBountyEvent {
  return {
    platform: "moltx",
    eventType,
    timestamp: NOW,
    entities: [ENTITY_A, ENTITY_B],
    payload,
  };
}

// =============================================================================
// AIRC Adapter
// =============================================================================

describe("AIRCAdapter", () => {
  const adapter = new AIRCAdapter();

  it("has correct metadata", () => {
    expect(adapter.platform).toBe("airc");
    expect(adapter.producesTypes).toContain("Interaction");
    expect(adapter.producesTypes).toContain("Context");
    expect(adapter.producesTypes).toContain("Note");
  });

  it("handles known event types", () => {
    expect(adapter.canHandle("first_contact")).toBe(true);
    expect(adapter.canHandle("handoff")).toBe(true);
    expect(adapter.canHandle("consent_change")).toBe(true);
    expect(adapter.canHandle("extended_thread")).toBe(true);
    expect(adapter.canHandle("communication_pattern")).toBe(true);
  });

  it("rejects unknown event types", () => {
    expect(adapter.canHandle("unknown_event")).toBe(false);
    expect(adapter.canHandle("bounty_accepted")).toBe(false);
  });

  describe("first_contact", () => {
    it("creates an Interaction section", () => {
      const event = makeAIRCEvent("first_contact", { topic: "API design" });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Interaction");
      expect(sections[0].title).toContain("First contact");
      expect(sections[0].content).toContain("API design");
      expect(sections[0].meta?.tags).toContain("first-contact");
    });

    it("works without optional topic", () => {
      const event = makeAIRCEvent("first_contact", {});
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].content).not.toContain("undefined");
    });
  });

  describe("handoff", () => {
    it("creates an Interaction section with task details", () => {
      const event = makeAIRCEvent("handoff", {
        taskDescription: "Code review for PR #42",
        handoffFrom: ENTITY_A,
        handoffTo: ENTITY_B,
        threadId: "thread-123",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Interaction");
      expect(sections[0].content).toContain("Code review for PR #42");
      expect(sections[0].content).toContain(ENTITY_A);
      expect(sections[0].meta?.tags).toContain("handoff");
      expect(sections[0].meta?.references).toEqual([
        { type: "airc_thread", id: "thread-123" },
      ]);
    });
  });

  describe("consent_change", () => {
    it("creates a Note section for granted consent", () => {
      const event = makeAIRCEvent("consent_change", {
        consentType: "granted",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Note");
      expect(sections[0].title).toContain("granted");
      expect(sections[0].content).toContain("open");
      expect(sections[0].meta?.tags).toContain("consent");
    });

    it("creates a Note section for revoked consent", () => {
      const event = makeAIRCEvent("consent_change", {
        consentType: "revoked",
      });
      const sections = adapter.translate(event);

      expect(sections[0].content).toContain("closed");
    });
  });

  describe("extended_thread", () => {
    it("captures thread metadata", () => {
      const event = makeAIRCEvent("extended_thread", {
        topic: "Architecture decisions",
        messageCount: 47,
        duration: "3 days",
        threadId: "thread-456",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Interaction");
      expect(sections[0].content).toContain("Architecture decisions");
      expect(sections[0].content).toContain("47");
      expect(sections[0].content).toContain("3 days");
    });
  });

  describe("communication_pattern", () => {
    it("creates a Context section", () => {
      const event = makeAIRCEvent("communication_pattern", {
        communicationStyle: "Prefers async, detailed written updates over calls",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Context");
      expect(sections[0].content).toContain("async");
      expect(sections[0].meta?.tags).toContain("pattern");
    });
  });

  it("returns empty array for unknown event types", () => {
    const event = makeAIRCEvent("nonexistent_type" as any, {});
    const sections = adapter.translate(event);
    expect(sections).toEqual([]);
  });
});

// =============================================================================
// MoltX Adapter
// =============================================================================

describe("MoltXAdapter", () => {
  const adapter = new MoltXAdapter();

  const baseBounty = {
    bountyId: 42,
    title: "Build HARP SDK",
  };

  it("has correct metadata", () => {
    expect(adapter.platform).toBe("moltx");
    expect(adapter.producesTypes).toContain("Interaction");
    expect(adapter.producesTypes).toContain("Trust");
    expect(adapter.producesTypes).toContain("Tension");
  });

  it("handles known event types", () => {
    expect(adapter.canHandle("bounty_accepted")).toBe(true);
    expect(adapter.canHandle("bounty_milestone")).toBe(true);
    expect(adapter.canHandle("bounty_completed")).toBe(true);
    expect(adapter.canHandle("bounty_payment")).toBe(true);
    expect(adapter.canHandle("bounty_dispute_filed")).toBe(true);
    expect(adapter.canHandle("bounty_dispute_resolved")).toBe(true);
    expect(adapter.canHandle("bounty_endorsement")).toBe(true);
  });

  it("rejects unknown event types", () => {
    expect(adapter.canHandle("first_contact")).toBe(false);
  });

  describe("bounty_accepted", () => {
    it("creates an Interaction section with bounty details", () => {
      const event = makeMoltXEvent("bounty_accepted", {
        ...baseBounty,
        description: "TypeScript SDK for HARP protocol",
        amount: "0.5",
        currency: "ETH",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Interaction");
      expect(sections[0].title).toContain("#42");
      expect(sections[0].title).toContain("Build HARP SDK");
      expect(sections[0].content).toContain("0.5");
      expect(sections[0].content).toContain("ETH");
      expect(sections[0].meta?.tags).toContain("bounty");
      expect(sections[0].meta?.references).toEqual([
        { type: "bounty", id: "moltx:bounty:42" },
      ]);
    });
  });

  describe("bounty_milestone", () => {
    it("creates an Interaction section", () => {
      const event = makeMoltXEvent("bounty_milestone", {
        ...baseBounty,
        milestone: "Core types defined",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Interaction");
      expect(sections[0].content).toContain("Core types defined");
    });
  });

  describe("bounty_completed", () => {
    it("creates an Interaction section", () => {
      const event = makeMoltXEvent("bounty_completed", baseBounty);
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Interaction");
      expect(sections[0].title).toContain("completed");
      expect(sections[0].meta?.tags).toContain("completed");
    });
  });

  describe("bounty_payment", () => {
    it("creates an Interaction section with payment details", () => {
      const event = makeMoltXEvent("bounty_payment", {
        ...baseBounty,
        amount: "0.5",
        currency: "ETH",
        tx: "0xabc123",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Interaction");
      expect(sections[0].content).toContain("0.5");
      expect(sections[0].meta?.author).toBe("system");
      expect(sections[0].meta?.tags).toContain("x402");
    });

    it("handles payment without tx hash", () => {
      const event = makeMoltXEvent("bounty_payment", {
        ...baseBounty,
        amount: "1.0",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      // Should not throw even without tx
    });
  });

  describe("bounty_dispute_filed", () => {
    it("creates a Tension section", () => {
      const event = makeMoltXEvent("bounty_dispute_filed", {
        ...baseBounty,
        disputeReason: "Deliverable incomplete — missing tests",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Tension");
      expect(sections[0].content).toContain("missing tests");
      expect(sections[0].meta?.status).toBe("ongoing");
    });
  });

  describe("bounty_dispute_resolved", () => {
    it("creates a resolved Tension section", () => {
      const event = makeMoltXEvent("bounty_dispute_resolved", {
        ...baseBounty,
        resolution: "Tests added, both parties satisfied",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Tension");
      expect(sections[0].meta?.status).toBe("resolved");
      expect(sections[0].meta?.resolution).toContain("Tests added");
    });
  });

  describe("bounty_endorsement", () => {
    it("creates a Trust section", () => {
      const event = makeMoltXEvent("bounty_endorsement", {
        ...baseBounty,
        endorsement: "Exceptional work — delivered ahead of schedule with thorough docs",
      });
      const sections = adapter.translate(event);

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Trust");
      expect(sections[0].content).toContain("ahead of schedule");
      expect(sections[0].meta?.tags).toContain("endorsement");
      expect(sections[0].meta?.evidence).toEqual([
        { type: "bounty", id: "moltx:bounty:42" },
      ]);
    });
  });
});

// =============================================================================
// AdapterRegistry
// =============================================================================

describe("AdapterRegistry", () => {
  let registry: AdapterRegistry;

  beforeEach(() => {
    registry = new AdapterRegistry();
  });

  it("starts empty", () => {
    expect(registry.list()).toHaveLength(0);
  });

  it("registers and retrieves adapters", () => {
    const airc = new AIRCAdapter();
    registry.register(airc);

    expect(registry.get("airc")).toBe(airc);
    expect(registry.get("moltx")).toBeUndefined();
    expect(registry.list()).toHaveLength(1);
  });

  it("registers multiple adapters", () => {
    registry.register(new AIRCAdapter());
    registry.register(new MoltXAdapter());

    expect(registry.list()).toHaveLength(2);
    expect(registry.get("airc")).toBeDefined();
    expect(registry.get("moltx")).toBeDefined();
  });

  it("translates events via the correct adapter", () => {
    registry.register(new AIRCAdapter());
    registry.register(new MoltXAdapter());

    const aircEvent = makeAIRCEvent("first_contact", { topic: "testing" });
    const sections = registry.translate(aircEvent);

    expect(sections).toHaveLength(1);
    expect(sections[0].type).toBe("Interaction");
    expect(sections[0].meta?.tags).toContain("first-contact");
  });

  it("returns empty array for unregistered platform", () => {
    const event: PlatformEvent = {
      platform: "unknown",
      eventType: "something",
      timestamp: NOW,
      entities: [ENTITY_A],
      payload: {},
    };

    expect(registry.translate(event)).toEqual([]);
  });

  it("returns empty array for unhandled event type on registered platform", () => {
    registry.register(new AIRCAdapter());

    const event = makeAIRCEvent("nonexistent_event" as any, {});
    expect(registry.translate(event)).toEqual([]);
  });

  it("routes MoltX events correctly", () => {
    registry.register(new AIRCAdapter());
    registry.register(new MoltXAdapter());

    const moltxEvent = makeMoltXEvent("bounty_completed", {
      bountyId: 99,
      title: "Test bounty",
    });
    const sections = registry.translate(moltxEvent);

    expect(sections).toHaveLength(1);
    expect(sections[0].type).toBe("Interaction");
    expect(sections[0].meta?.tags).toContain("moltx");
  });
});
