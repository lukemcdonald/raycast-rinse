import { Clipboard, showHUD } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HUD_EMPTY, HUD_UNCHANGED, buildHudText, readAndClean, runClipboardClean } from "./clipboard";

vi.mock("@raycast/api", () => ({
  Clipboard: {
    copy: vi.fn(),
    paste: vi.fn(),
    read: vi.fn(),
  },
  showHUD: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(Clipboard.read).mockReset();
  vi.mocked(showHUD).mockReset();
});

// ─── readAndClean ─────────────────────────────────────────────────────────────

describe("readAndClean", () => {
  it("returns empty when clipboard has no text", async () => {
    vi.mocked(Clipboard.read).mockResolvedValueOnce({ text: "" });
    await expect(readAndClean()).resolves.toEqual({ status: "empty" });
  });

  it("returns unchanged when text requires no cleaning", async () => {
    vi.mocked(Clipboard.read).mockResolvedValueOnce({ text: "Clean text." });
    await expect(readAndClean()).resolves.toEqual({ status: "unchanged", text: "Clean text." });
  });

  it("returns cleaned result when text is modified", async () => {
    vi.mocked(Clipboard.read).mockResolvedValueOnce({ text: "\x1b[32mhello\x1b[0m" });
    const result = await readAndClean();
    expect(result.status).toBe("cleaned");
    if (result.status === "cleaned") {
      expect(result.result.cleaned).toBe("hello");
    }
  });
});

// ─── runClipboardClean ────────────────────────────────────────────────────────

describe("runClipboardClean", () => {
  it("shows empty HUD and skips handlers", async () => {
    vi.mocked(Clipboard.read).mockResolvedValueOnce({ text: "" });
    const onCleaned = vi.fn();

    await runClipboardClean({ onCleaned });

    expect(showHUD).toHaveBeenCalledWith(HUD_EMPTY);
    expect(onCleaned).not.toHaveBeenCalled();
  });

  it("runs onUnchanged then shows unchanged HUD", async () => {
    vi.mocked(Clipboard.read).mockResolvedValueOnce({ text: "Clean text." });
    const onCleaned = vi.fn();
    const onUnchanged = vi.fn();

    await runClipboardClean({ onCleaned, onUnchanged });

    expect(onUnchanged).toHaveBeenCalledWith("Clean text.");
    expect(showHUD).toHaveBeenCalledWith(HUD_UNCHANGED);
    expect(onCleaned).not.toHaveBeenCalled();
  });

  it("runs onCleaned for rinsed text", async () => {
    vi.mocked(Clipboard.read).mockResolvedValueOnce({ text: "\x1b[32mhello\x1b[0m" });
    const onCleaned = vi.fn();

    await runClipboardClean({ onCleaned });

    expect(onCleaned).toHaveBeenCalledWith(
      expect.objectContaining({
        cleaned: "hello",
        changed: true,
      }),
    );
  });
});

// ─── constants ────────────────────────────────────────────────────────────────

describe("HUD constants", () => {
  it("exports HUD_EMPTY", () => {
    expect(HUD_EMPTY).toBe("Clipboard empty");
  });

  it("exports HUD_UNCHANGED", () => {
    expect(HUD_UNCHANGED).toBe("Nothing to clean");
  });
});

// ─── buildHudText ─────────────────────────────────────────────────────────────

describe("buildHudText", () => {
  it("returns Rinsed when reduction is 0", () => {
    expect(buildHudText(0)).toBe("Rinsed");
  });

  it.each([
    [1, "1% rinsed"],
    [42, "42% rinsed"],
    [100, "100% rinsed"],
  ] as const)("includes reduction percentage of %i", (reduction, expected) => {
    expect(buildHudText(reduction)).toBe(expected);
  });
});
