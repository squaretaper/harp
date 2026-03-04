import { describe, it, expect } from "vitest";
import { normalizeEntityId, computeDyadId } from "../src/index.js";

describe("normalizeEntityId", () => {
  it("normalizes ERC-8004 IDs — strips leading zeros", () => {
    expect(normalizeEntityId("erc8004:1:42")).toBe("erc8004:1:42");
    expect(normalizeEntityId("erc8004:01:042")).toBe("erc8004:1:42");
  });

  it("normalizes Ethereum addresses to lowercase", () => {
    expect(normalizeEntityId("eth:0xABCdef123456")).toBe("eth:0xabcdef123456");
  });

  it("normalizes AIRC handles to lowercase and trims", () => {
    expect(normalizeEntityId("airc:Alice")).toBe("airc:alice");
    expect(normalizeEntityId("airc:  Bob  ")).toBe("airc:bob");
  });

  it("throws on invalid ERC-8004 format", () => {
    expect(() => normalizeEntityId("erc8004:bad")).toThrow("Invalid ERC-8004");
    expect(() => normalizeEntityId("erc8004:a:b")).toThrow("Invalid ERC-8004");
  });

  it("throws on unknown ID format", () => {
    expect(() => normalizeEntityId("unknown:foo")).toThrow("Unknown entity ID format");
  });
});

describe("computeDyadId", () => {
  it("produces a canonical dyad ID with sorted entities", () => {
    const id1 = computeDyadId("airc:alice", "erc8004:1:42");
    const id2 = computeDyadId("erc8004:1:42", "airc:alice");
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^harp:/);
  });

  it("normalizes entities before computing", () => {
    const id = computeDyadId("airc:Alice", "erc8004:01:042");
    expect(id).toBe("harp:airc:alice:erc8004:1:42");
  });

  it("throws when both entities are the same", () => {
    expect(() => computeDyadId("airc:alice", "airc:alice")).toThrow(
      "two distinct entities"
    );
  });
});
