import { useEffect, useState } from "react";
import { cleanWithStats, type CleanResult } from "./utils/cleaner";
import { Action, ActionPanel, Clipboard, Color, Detail, Icon, showToast, Toast, useNavigation } from "@raycast/api";

// TODO: Can we surface the Clean and preview description from package.json

function useClipboardClean(): { result: CleanResult | null; loading: boolean } {
  const [result, setResult] = useState<CleanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Clipboard.read().then(({ text }) => {
      if (text) {
        setResult(cleanWithStats(text));
      }
      setLoading(false);
    });
  }, []);

  return { result, loading };
}

function buildMarkdown(result: CleanResult): string {
  const { originalLineCount, cleanedLineCount } = result;
  return `
## Rinsed output

\`\`\`
${result.cleaned}
\`\`\`

---

### Stats
- **Characters:** ${result.original.length} → ${result.cleaned.length} (${result.reductionPercent}% rinsed)
- **Lines:** ${originalLineCount} → ${cleanedLineCount}
`;
}

function CleanMetadata({ result }: { result: CleanResult }) {
  const { originalLineCount, cleanedLineCount } = result;
  return (
    <Detail.Metadata>
      <Detail.Metadata.Label
        icon={{ source: Icon.Minus, tintColor: Color.Green }}
        text={`${result.original.length - result.cleaned.length} (${result.reductionPercent}%)`}
        title="Characters rinsed"
      />
      <Detail.Metadata.Label text={`${originalLineCount} → ${cleanedLineCount}`} title="Lines" />
      <Detail.Metadata.Separator />
      <Detail.Metadata.Label
        icon={{ source: Icon.Checkmark, tintColor: Color.Green }}
        text="Ready to copy"
        title="Status"
      />
    </Detail.Metadata>
  );
}

function CleanActions({ result, onCopyAndClose }: { result: CleanResult; onCopyAndClose: () => void }) {
  return (
    <ActionPanel>
      <Action
        icon={Icon.Clipboard}
        onAction={onCopyAndClose}
        shortcut={{ modifiers: ["cmd"], key: "return" }}
        title="Copy & Close"
      />
      <Action.CopyToClipboard
        content={result.cleaned}
        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
        title="Copy to Clipboard"
      />
    </ActionPanel>
  );
}

export default function CleanAndReview() {
  const { result, loading } = useClipboardClean();
  const { pop } = useNavigation();

  async function copyAndClose() {
    if (!result) {
      return
    };
    await Clipboard.copy(result.cleaned);
    // TODO: I'm not seeing the toast? When should I see it?
    await showToast({
      style: Toast.Style.Success,
      title: "✓ Bathwater tossed."
    });
    pop();
  }

  if (loading) {
    return <Detail isLoading />
  };

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

  return (
    <Detail
      markdown={buildMarkdown(result)}
      metadata={<CleanMetadata result={result} />}
      actions={<CleanActions result={result} onCopyAndClose={copyAndClose} />}
    />
  );
}
