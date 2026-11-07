import { Clipboard, showHUD } from "@raycast/api";
import { buildHudText, runClipboardClean } from "./utils/clipboard";

export default async function main() {
  await runClipboardClean({
    onCleaned: async (result) => {
      await Clipboard.paste(result.cleaned);
      await showHUD(buildHudText(result.reductionPercent));
    },
    onUnchanged: async (text) => {
      await Clipboard.paste(text);
    },
  });
}
