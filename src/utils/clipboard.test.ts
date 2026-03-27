import { Clipboard } from "@raycast/api";
import { describe, expect, it, vi } from "vitest";
import { buildHudText, readAndClean } from "./clipboard";

// ─── readAndClean ─────────────────────────────────────────────────────────────

describe("readAndClean", () => {
  it("returns empty when clipboard has no text", async () => {
    vi.spyOn(Clipboard, "read").mockResolvedValueOnce({ text: "" });
    await expect(readAndClean()).resolves.toEqual({ status: "empty" });
  });

  it("returns unchanged when text requires no cleaning", async () => {
    vi.spyOn(Clipboard, "read").mockResolvedValueOnce({ text: "Clean text." });
    await expect(readAndClean()).resolves.toEqual({ status: "unchanged", text: "Clean text." });
  });

  it("returns cleaned result when text is modified", async () => {
    vi.spyOn(Clipboard, "read").mockResolvedValueOnce({ text: "\x1b[32mhello\x1b[0m" });
    const result = await readAndClean();
    expect(result.status).toBe("cleaned");
    if (result.status === "cleaned") {
      expect(result.result.cleaned).toBe("hello");
    }
  });
});

// ─── buildHudText ─────────────────────────────────────────────────────────────

describe("buildHudText", () => {
  it("returns base success text when reduction is 0", () => {
    expect(buildHudText(0)).toBe("✓ Bougie!");
  });

  it.each([
    [1, "✓ Bougie! (1% rinsed)"],
    [42, "✓ Bougie! (42% rinsed)"],
    [100, "✓ Bougie! (100% rinsed)"],
  ] as const)("includes reduction percentage of %i", (reduction, expected) => {
    expect(buildHudText(reduction)).toBe(expected);
  });
});
