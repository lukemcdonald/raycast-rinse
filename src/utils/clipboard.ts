import { Clipboard, showHUD } from "@raycast/api";
import { cleanWithStats, type CleanResult } from "./cleaner";

export type ClipboardCleanResult =
  { result: CleanResult; status: "cleaned" } | { status: "empty" } | { status: "unchanged"; text: string };

export async function readAndClean(): Promise<ClipboardCleanResult> {
  const { text } = await Clipboard.read();

  if (!text) {
    return { status: "empty" };
  }

  const result = cleanWithStats(text);

  if (!result.changed) {
    return { status: "unchanged", text };
  }

  return { result, status: "cleaned" };
}

export const HUD_EMPTY = "Clipboard empty";
export const HUD_UNCHANGED = "Nothing to clean";

// reductionPercent can be 0 even when changed=true (e.g. tiny edits that round to <1%)
export function buildHudText(reductionPercent: number): string {
  if (reductionPercent > 0) {
    return `${reductionPercent}% rinsed`;
  }

  return "Rinsed";
}

type CleanHandlers = {
  onCleaned: (result: CleanResult) => Promise<void>;
  onUnchanged?: (text: string) => Promise<void>;
};

/** Shared empty / unchanged HUD handling for no-view clipboard commands. */
export async function runClipboardClean(handlers: CleanHandlers): Promise<void> {
  const outcome = await readAndClean();

  if (outcome.status === "empty") {
    await showHUD(HUD_EMPTY);
    return;
  }

  if (outcome.status === "unchanged") {
    if (handlers.onUnchanged) {
      await handlers.onUnchanged(outcome.text);
    }

    await showHUD(HUD_UNCHANGED);
    return;
  }

  await handlers.onCleaned(outcome.result);
}
