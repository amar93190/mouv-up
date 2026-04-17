const ARROW_NORMALIZATION_RULES: Array<[RegExp, string]> = [
  [/➡/g, "→"],
  [/⬅/g, "←"],
  [/⬆/g, "↑"],
  [/⬇/g, "↓"],
  [/➜|➝|➞|➔|⟶/g, "→"],
  [/⟵|⟸/g, "←"]
];

export function normalizeArrowSymbols(input: string) {
  // Remove emoji presentation selector to keep text-style glyphs on iOS.
  let normalized = input.replace(/\uFE0F/g, "");

  for (const [pattern, replacement] of ARROW_NORMALIZATION_RULES) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized;
}
