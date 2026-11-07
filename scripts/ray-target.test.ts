import { describe, expect, it, vi } from "vitest";
import { BETA_APP, STABLE_APP, isInstalled, resolveTarget } from "./ray-target.mjs";

describe("isInstalled", () => {
  it("checks /Applications then ~/Applications", () => {
    const exists = vi.fn((path: string) => path === `/Applications/${STABLE_APP}`);
    const home = vi.fn(() => "/Users/me");

    expect(isInstalled(STABLE_APP, { existsSync: exists, homedir: home })).toBe(true);
    expect(exists).toHaveBeenCalledWith(`/Applications/${STABLE_APP}`);
  });

  it("falls back to the user Applications folder", () => {
    const exists = vi.fn((path: string) => path === `/Users/me/Applications/${BETA_APP}`);
    const home = vi.fn(() => "/Users/me");

    expect(isInstalled(BETA_APP, { existsSync: exists, homedir: home })).toBe(true);
    expect(exists).toHaveBeenCalledWith(`/Applications/${BETA_APP}`);
    expect(exists).toHaveBeenCalledWith(`/Users/me/Applications/${BETA_APP}`);
  });

  it("returns false when neither location has the app", () => {
    expect(isInstalled(STABLE_APP, { existsSync: () => false, homedir: () => "/Users/me" })).toBe(false);
  });
});

describe("resolveTarget", () => {
  it("uses RAY_TARGET=x when set", () => {
    expect(resolveTarget({ env: { RAY_TARGET: "x" }, platform: "darwin" })).toBe("x");
  });

  it("treats empty RAY_TARGET as the default target", () => {
    expect(resolveTarget({ env: { RAY_TARGET: "" }, platform: "darwin" })).toBeUndefined();
  });

  it("skips detection on non-darwin platforms", () => {
    const checkInstalled = vi.fn();
    expect(resolveTarget({ env: {}, isInstalled: checkInstalled, platform: "win32" })).toBeUndefined();
    expect(checkInstalled).not.toHaveBeenCalled();
  });

  it("prefers stable when it is installed", () => {
    const checkInstalled = vi.fn((app: string) => app === STABLE_APP);
    expect(resolveTarget({ env: {}, isInstalled: checkInstalled, platform: "darwin" })).toBeUndefined();
    expect(checkInstalled).toHaveBeenCalledWith(STABLE_APP);
  });

  it("returns x when only Beta is installed", () => {
    const checkInstalled = vi.fn((app: string) => app === BETA_APP);
    expect(resolveTarget({ env: {}, isInstalled: checkInstalled, platform: "darwin" })).toBe("x");
  });

  it("returns undefined when neither app is installed", () => {
    expect(resolveTarget({ env: {}, isInstalled: () => false, platform: "darwin" })).toBeUndefined();
  });
});
