import { Clipboard } from "@raycast/api";
import { cleanWithStats, type CleanResult } from "./cleaner";

export type ClipboardCleanResult = { status: "empty" } | { status: "unchanged" } | { status: "cleaned"; result: CleanResult };

export async function readAndClean(): Promise<ClipboardCleanResult> {
  const { text } = await Clipboard.read();
  if (!text) return { status: "empty" };
  const result = cleanWithStats(text);
  if (!result.changed) return { status: "unchanged" };
  return { status: "cleaned", result };
}
