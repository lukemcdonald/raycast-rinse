import { Clipboard, showHUD } from "@raycast/api";
import { buildHudText, runClipboardClean } from "./utils/clipboard";

export default async function main() {
  await runClipboardClean({
    onCleaned: async (result) => {
      await Clipboard.copy(result.cleaned);
      await showHUD(buildHudText(result.reductionPercent));
    },
  });
}
