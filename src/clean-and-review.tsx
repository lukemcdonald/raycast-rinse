import { useEffect, useState } from "react";
import { cleanWithStats, type CleanResult } from "./utils/cleaner";
import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Detail,
  Icon,
  closeMainWindow,
  showHUD,
  useNavigation,
} from "@raycast/api";

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
  return `\`\`\`\n${result.cleaned}\n\`\`\``;
}

function CleanMetadata({ result }: { result: CleanResult }) {
  const { originalLineCount, cleanedLineCount } = result;
  return (
    <Detail.Metadata>
      <Detail.Metadata.TagList title="Bathwater">
        <Detail.Metadata.TagList.Item text={`${result.reductionPercent}% rinsed`} color={Color.Green} />
      </Detail.Metadata.TagList>
      <Detail.Metadata.Separator />
      <Detail.Metadata.Label text={`${result.original.length} → ${result.cleaned.length}`} title="Characters" />
      <Detail.Metadata.Label text={`${originalLineCount} → ${cleanedLineCount}`} title="Lines" />
    </Detail.Metadata>
  );
}

function CleanActions({ onCopyAndClose }: { onCopyAndClose: () => void }) {
  return (
    <ActionPanel>
      <Action
        icon={Icon.Clipboard}
        onAction={onCopyAndClose}
        shortcut={{ modifiers: ["cmd"], key: "return" }}
        title="Toss the Bathwater"
      />
    </ActionPanel>
  );
}

export default function CleanAndReview() {
  const { result, loading } = useClipboardClean();
  const { pop } = useNavigation();

  async function copyAndClose() {
    if (!result) {
      return;
    }
    await Clipboard.copy(result.cleaned);
    pop();
    await showHUD("✓ Baby saved. Bathwater tossed.");
  }

  useEffect(() => {
    if (loading) return;
    if (!result) {
      showHUD("Nothing in the tub.").then(() => closeMainWindow());
    } else if (!result.changed) {
      showHUD("Already clean. No bathwater to toss.").then(() => closeMainWindow());
    }
  }, [loading, result]);

  if (loading || !result || !result.changed) {
    return <Detail isLoading />;
  }

  return (
    <Detail
      navigationTitle="Confirm the baby. Toss the bathwater."
      markdown={buildMarkdown(result)}
      metadata={<CleanMetadata result={result} />}
      actions={<CleanActions onCopyAndClose={copyAndClose} />}
    />
  );
}
