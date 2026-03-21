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

  const rinsedText = `✓ Rinsed`;
  const rinsedRemovedText = `${rinsedText} (${result.reductionPercent}% removed)`

  await showHUD(
    result.reductionPercent > 0
      ? `${rinsedRemovedText}`
      : `${rinsedText}`
  );
}
