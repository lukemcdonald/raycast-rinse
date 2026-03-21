import { useEffect, useState } from "react";
import { cleanWithStats } from "./utils/cleaner";
import type { CleanResult } from "./utils/cleaner";
import { Action, ActionPanel, Clipboard, Color, Detail, Icon, showToast, Toast, useNavigation } from "@raycast/api";

export default function CleanAndReview() {
  const [result, setResult] = useState<CleanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { pop } = useNavigation();

  useEffect(() => {
    Clipboard.read().then(({ text }) => {
      if (text) {
        setResult(cleanWithStats(text));
      }
      setLoading(false);
    });
  }, []);

  async function copyAndClose() {
    if (!result) {
      return;
    }
    await Clipboard.copy(result.cleaned);
    await showToast({
      style: Toast.Style.Success,
      title: "✓ Bathwater tossed.",
    });
    pop();
  }

  if (loading) {
    return <Detail isLoading />;
  }

  if (!result) {
    return <Detail markdown="**Clipboard is empty.** Copy some terminal output first, then run Rinse." />;
  }

  if (!result.changed) {
    return (
      <Detail
        markdown="**Nothing to clean.** The clipboard text looks clean already."
        actions={
          <ActionPanel>
            <Action title="Close" onAction={pop} />
          </ActionPanel>
        }
      />
    );
  }

  const { originalLineCount, cleanedLineCount } = result;

  const markdown = `
## Rinsed output

\`\`\`
${result.cleaned}
\`\`\`

---

### Stats
- **Characters:** ${result.original.length} → ${result.cleaned.length} (${result.reductionPercent}% rinsed)
- **Lines:** ${originalLineCount} → ${cleanedLineCount}
`;

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            icon={{
              source: Icon.Minus,
              tintColor: Color.Green,
            }}
            text={`${result.original.length - result.cleaned.length} (${result.reductionPercent}%)`}
            title="Characters rinsed"
          />
          <Detail.Metadata.Label text={`${originalLineCount} → ${cleanedLineCount}`} title="Lines" />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            icon={{
              source: Icon.Checkmark,
              tintColor: Color.Green,
            }}
            text="Ready to copy"
            title="Status"
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action
            icon={Icon.Clipboard}
            onAction={copyAndClose}
            shortcut={{
              modifiers: ["cmd"],
              key: "return",
            }}
            title="Copy & Close"
          />
          <Action.CopyToClipboard
            content={result.cleaned}
            shortcut={{
              modifiers: ["cmd", "shift"],
              key: "c",
            }}
            title="Copy to Clipboard"
          />
        </ActionPanel>
      }
    />
  );
}
