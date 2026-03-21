// Unicode box-drawing block: U+2500–U+257F
const BOX_DRAWING_RE = /[\u2500-\u257F]/g;

// ANSI escape sequences (colors, cursor movement, erase, etc.)
const ANSI_ESCAPE_RE = /\x1B\[[0-9;?]*[A-Za-z]|\x1B[()][AB012]|\x1B[=>]|\x1B[78]/g;

// Spinner / progress characters (Braille + common spinner frames)
const SPINNER_RE = /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏⠁⠂⠄⡀⢀⠠⠐⠈]/g;

// Lines that are purely decorative: only repeated ─ ═ - = ~ * # chars (3+)
const DECORATION_LINE_RE = /^[\s\-=~*#─═━]+$/;

// Leading/trailing pipe borders (│ and | with optional spaces)
const LEADING_PIPE_RE = /^[\s│|]+/;
const TRAILING_PIPE_RE = /[\s│|]+$/;

export function cleanText(input: string): string {
  if (!input.trim()) return input;

  let text = input;

  text = text.replace(ANSI_ESCAPE_RE, "");
  text = text.replace(BOX_DRAWING_RE, "");
  text = text.replace(SPINNER_RE, "");

  const lines = text.split("\n");
  const cleaned: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(LEADING_PIPE_RE, "").replace(TRAILING_PIPE_RE, "");
    if (DECORATION_LINE_RE.test(line)) continue;
    cleaned.push(line);
  }

  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export interface CleanResult {
  original: string;
  cleaned: string;
  changed: boolean;
  reductionPercent: number;
}

export function cleanWithStats(input: string): CleanResult {
  const cleaned = cleanText(input);
  const changed = cleaned !== input;
  const reductionPercent =
    input.length > 0
      ? Math.round(((input.length - cleaned.length) / input.length) * 100)
      : 0;

  return { original: input, cleaned, changed, reductionPercent };
}
