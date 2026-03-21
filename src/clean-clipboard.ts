import { Clipboard, showHUD } from "@raycast/api";
import { readAndClean } from "./utils/clipboard";

export default async function main() {
  const outcome = await readAndClean();

  if (outcome.status === "empty") {
    await showHUD("Clipboard is empty");
    return;
  }

  if (outcome.status === "unchanged") {
    await showHUD("✓ Nothing to clean");
    return;
  }

  const { result } = outcome;
  await Clipboard.copy(result.cleaned);

  // reductionPercent can be 0 even when changed=true (e.g. tiny edits that round to <1%)
  const hudText = result.reductionPercent > 0 ? `✓ Bougie! (${result.reductionPercent}% rinsed)` : `✓ Bougie!`;

  await showHUD(hudText);
}
