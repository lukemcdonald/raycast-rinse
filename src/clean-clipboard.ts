import { Clipboard, showHUD } from "@raycast/api";
import { cleanWithStats } from "./utils/cleaner";

export default async function main() {
  const { text } = await Clipboard.read();

  if (!text) {
    await showHUD("Clipboard is empty");
    return;
  }

  const result = cleanWithStats(text);

  if (!result.changed) {
    await showHUD("✓ Nothing to clean");
    return;
  }

  await Clipboard.copy(result.cleaned);

  // TODO: If there is not percent in change, then there would be nothing to clean? Do we need the ternary operator? Can this be simplified?
  const hudText = result.reductionPercent > 0 ? `✓ Bougie! (${result.reductionPercent}% rinsed)` : `✓ Bougie!`;

  await showHUD(hudText);
}
