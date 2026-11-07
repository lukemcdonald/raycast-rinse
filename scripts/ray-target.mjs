import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const BETA_APP = "Raycast Beta.app";
export const STABLE_APP = "Raycast.app";

/** Both apps can live in /Applications or in a per user ~/Applications. */
export function isInstalled(app, { existsSync: exists = existsSync, homedir: home = homedir } = {}) {
  return exists(join("/Applications", app)) || exists(join(home(), "Applications", app));
}

/** Returns the `-t` value to append, or undefined to leave the CLI on its default target. */
export function resolveTarget({
  env = process.env,
  isInstalled: checkInstalled = isInstalled,
  platform = process.platform,
} = {}) {
  if (env.RAY_TARGET !== undefined) {
    return env.RAY_TARGET || undefined;
  }

  // Prefer stable whenever it is present so existing setups behave exactly as before.
  if (platform !== "darwin" || checkInstalled(STABLE_APP)) {
    return undefined;
  }

  return checkInstalled(BETA_APP) ? "x" : undefined;
}
