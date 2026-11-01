// Text contrast in every theme, computed from src/styles/tokens.css: WCAG AA
// asks for 4.5:1 for normal text (ARCHITECTURE §5.3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/tokens.css", "utf8");
const DARK = "@media (prefers-color-scheme: dark)";

// The custom properties set in part of the file, later ones winning.
function tokens(part: string, base: Record<string, string> = {}): Record<string, string> {
  const found = { ...base };
  for (const m of part.matchAll(/(--[\w-]+):\s*([^;]+);/g)) found[m[1]] = m[2].trim();
  return found;
}

function colour(theme: Record<string, string>, name: string): string {
  const value = theme[name];
  assert.ok(value, `${name} isn't set`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (ref) return colour(theme, ref[1]);
  assert.match(value, /^#[\da-f]{6}$/i, `${name} should be a #rrggbb colour`);
  return value;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Every text colour against every surface it's used on.
const PAIRS: [string, string][] = [
  ["--ink", "--bg"],
  ["--ink", "--ice"],
  ["--ink-2", "--bg"],
  ["--ink-2", "--ice"],
  ["--muted", "--bg"],
  ["--muted", "--ice"],
  ["--accent", "--bg"],
  ["--accent", "--ice"],
  ["--accent-strong", "--bg"],
  ["--on-accent", "--accent"],
  ["--button-ink", "--button-bg"],
  ["--hero-ink", "--hero-bg"],
  ["--hero-muted", "--hero-bg"],
  ["--hero-accent", "--hero-bg"],
  ["--footer-ink", "--footer-bg"],
  ["--footer-accent", "--footer-bg"],
];

const darkAt = css.indexOf(DARK);
const light = tokens(css.slice(0, darkAt));
const themes: Record<string, Record<string, string>> = {
  light,
  dark: tokens(css.slice(darkAt), light),
};

for (const [name, theme] of Object.entries(themes)) {
  test(`text contrast meets WCAG AA (4.5:1) in the ${name} theme`, () => {
    const failures = PAIRS.map(([fg, bg]) => [fg, bg, contrast(colour(theme, fg), colour(theme, bg))] as const)
      .filter(([, , ratio]) => ratio < 4.5)
      .map(([fg, bg, ratio]) => `${fg} on ${bg}: ${ratio.toFixed(2)}`);
    assert.deepEqual(failures, []);
  });
}

test("the contrast formula matches WCAG's known values", () => {
  assert.equal(contrast("#000000", "#ffffff").toFixed(1), "21.0");
  assert.equal(contrast("#767676", "#ffffff").toFixed(2), "4.54");
});
