import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStorage } from "../src/index.js";

describe("MemoryStorage", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("stores content and returns a CID", async () => {
    const cid = await storage.store("hello world");
    expect(cid).toMatch(/^bafymem/);
    expect(cid.length).toBeGreaterThan(10);
  });

  it("retrieves stored content by CID", async () => {
    const content = "test document content";
    const cid = await storage.store(content);
    const retrieved = await storage.retrieve(cid);
    expect(retrieved).toBe(content);
  });

  it("produces deterministic CIDs for identical content", async () => {
    const cid1 = await storage.store("same content");
    const cid2 = await storage.store("same content");
    expect(cid1).toBe(cid2);
  });

  it("produces different CIDs for different content", async () => {
    const cid1 = await storage.store("content A");
    const cid2 = await storage.store("content B");
    expect(cid1).not.toBe(cid2);
  });

  it("throws when retrieving a non-existent CID", async () => {
    await expect(storage.retrieve("bafymem_nonexistent")).rejects.toThrow(
      "CID not found"
    );
  });

  it("reports existence of stored CIDs", async () => {
    const cid = await storage.store("test");
    expect(await storage.exists(cid)).toBe(true);
    expect(await storage.exists("bafymem_unknown")).toBe(false);
  });

  it("pins and unpins without error", async () => {
    const cid = await storage.store("pin test");
    await expect(storage.pin(cid)).resolves.toBeUndefined();
    await expect(storage.unpin(cid)).resolves.toBeUndefined();
  });
});
