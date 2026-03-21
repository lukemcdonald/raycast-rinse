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

  const hudText = result.reductionPercent > 0 ? `✓ Bougie! (${result.reductionPercent}% rinsed)` : `✓ Bougie!`;

  await showHUD(hudText);
}
