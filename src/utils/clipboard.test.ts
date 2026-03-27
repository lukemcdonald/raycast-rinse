import { describe, expect, it } from "vitest";
import { buildHudText } from "./clipboard";

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
