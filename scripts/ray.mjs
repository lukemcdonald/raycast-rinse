#!/usr/bin/env node

/**
 * Wraps the Raycast CLI so it builds into whichever Raycast build is actually installed.
 *
 * Raycast Beta is a separate app with its own support directory (`~/.config/raycast-x/extensions`), and the CLI only
 * writes there when passed `-t x`. Without the flag it writes to the stable directory (`~/.config/raycast/extensions`),
 * so a Beta only machine installs the extension where nothing reads it and every command fails at launch with
 * "Missing executable. You might need to build the extension."
 *
 * Stable Raycast and Windows need no flag, so they keep the plain `ray` behavior. Set `RAY_TARGET` to override the
 * detection (`RAY_TARGET=x` forces Beta, `RAY_TARGET=` forces the default target).
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolveTarget } from "./ray-target.mjs";

const require = createRequire(import.meta.url);
const rayBin = require.resolve("@raycast/api/bin/run.js");

const args = process.argv.slice(2);
const hasExplicitTarget = args.some((arg) => arg === "-t" || arg === "--target" || arg.startsWith("--target="));
const target = hasExplicitTarget ? undefined : resolveTarget();

const child = spawn(process.execPath, [rayBin, ...args, ...(target ? ["-t", target] : [])], { stdio: "inherit" });

child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
