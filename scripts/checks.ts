// Checks on content/ and on the built site (ARCHITECTURE §6.3, D-11):
// privacy, internal links, symlinks and scripts. A problem stops the sync or
// the deploy.
//
//   node scripts/checks.ts <folder or file>...
//
// Each folder is checked as a site root: its HTML must link only to files
// inside it.
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface Problem {
  file: string;
  message: string;
}

const SITE = "https://johnjamieson.ca";

// What must never be published (D-3). This repo is public, so these are
// patterns only, never John's actual details; Career's own check holds those.
const PRIVATE: [string, RegExp][] = [
  ["a phone number", /(?<![\w-])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?![\w-])/],
  ["an email address", /[\w.%+-]+@[A-Za-z\d-]+(?:\.[A-Za-z\d-]+)*\.[A-Za-z]{2,}/],
  [
    "a street address",
    /\b\d{1,6}\s+(?:[A-Z][\w'-]*\s+){1,4}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Crescent|Cres|Court|Ct|Lane|Ln|Way|Place|Pl|Terrace|Circle|Parkway|Pkwy|Trail|Square|Sq|Gate|Grove|Heights)\b/,
  ],
  ["a unit number", /\b(?:Unit|Suite|Apt|Apartment)\s*#?\s*\d+/],
  ["a postal code", /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/],
  ["a phone or email link", /\b(?:tel|mailto):/i],
];

export function privacyProblems(text: string): string[] {
  const found: string[] = [];
  for (const [what, pattern] of PRIVATE) {
    const match = text.match(pattern);
    if (match) found.push(`${what}: "${match[0]}"`);
  }
  return found;
}

// The words a visitor or a search engine sees in a page: its text, the
// structured data, and the attributes that hold words. Styles, the CSP's
// hashes and asset URLs are left out, since hashes can look like postal codes.
export function htmlText(html: string): string {
  const words = html
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, (tag) => {
      if (/^<meta\b[^>]*http-equiv=["']?content-security-policy/i.test(tag)) return " ";
      const values = [...tag.matchAll(/\s(?:content|alt|title|aria-label)=(?:"([^"]*)"|'([^']*)')/gi)];
      return ` ${values.map((m) => m[1] ?? m[2]).join(" ")} `;
    });
  return decodeEntities(words);
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return String.fromCodePoint(n);
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

// Links in a page to other pages or files on this site: root-relative
// (/resume/) or absolute to the site itself (canonical and Open Graph URLs).
export function internalLinks(html: string): string[] {
  const urls: string[] = [];
  for (const m of html.matchAll(/\s(href|src|srcset|content)=(?:"([^"]*)"|'([^']*)')/gi)) {
    const value = m[2] ?? m[3];
    const candidates = m[1].toLowerCase() === "srcset" ? value.split(",").map((s) => s.trim().split(/\s+/)[0]) : [value];
    for (const url of candidates) {
      if (url.startsWith(SITE)) urls.push(url.slice(SITE.length) || "/");
      else if (url.startsWith("/") && !url.startsWith("//")) urls.push(url);
    }
  }
  return urls;
}

function resolves(root: string, url: string): boolean {
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);
  const target = path.join(root, clean);
  if (!target.startsWith(root)) return false;
  if (clean.endsWith("/")) return existsSync(path.join(target, "index.html"));
  // Caddy adds the slash to a folder's address, so /resume reaches /resume/.
  return existsSync(target) || existsSync(path.join(target, "index.html"));
}

export function checkFile(file: string, root: string): string[] {
  const ext = path.extname(file).toLowerCase();
  if ([".js", ".mjs", ".cjs"].includes(ext)) return ["a script file: the site sends no JavaScript (D-9)"];
  if (![".html", ".json", ".yaml", ".yml", ".txt", ".xml", ".md"].includes(ext)) return [];

  const text = readFileSync(file, "utf8");
  if (ext !== ".html") {
    const problems = privacyProblems(text);
    if (ext === ".xml") {
      for (const url of [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) {
        if (url.startsWith(SITE) && !resolves(root, url.slice(SITE.length) || "/")) problems.push(`a link to a missing page: ${url}`);
      }
    }
    return problems;
  }

  const problems = privacyProblems(htmlText(text));
  for (const tag of text.match(/<script\b[^>]*>/gi) ?? []) {
    if (!/type=["']?application\/ld\+json/i.test(tag)) problems.push(`a script: ${tag} (D-9)`);
  }
  for (const tag of text.match(/<[a-z][^>]*\son[a-z]+\s*=[^>]*>/gi) ?? []) {
    problems.push(`an inline event handler: ${tag.slice(0, 80)} (D-9)`);
  }
  for (const url of internalLinks(text)) {
    if (!resolves(root, url)) problems.push(`a link to a missing page or file: ${url}`);
  }
  return problems;
}

// Checks every file under a folder (or one file), without following links.
export function checkPath(target: string): { problems: Problem[]; files: number } {
  const problems: Problem[] = [];
  let files = 0;
  const root = lstatSync(target).isDirectory() ? path.resolve(target) : path.dirname(path.resolve(target));
  const visit = (file: string) => {
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) problems.push({ file, message: "a symlink (DEC-28): the server would refuse it" });
    else if (stat.isDirectory()) for (const name of readdirSync(file).sort()) visit(path.join(file, name));
    else {
      files++;
      for (const message of checkFile(file, root)) problems.push({ file, message });
    }
  };
  visit(path.resolve(target));
  return { problems, files };
}

function main(targets: string[]): void {
  if (targets.length === 0) {
    console.error("Usage: node scripts/checks.ts <folder or file>...");
    process.exit(2);
  }
  let files = 0;
  const problems: Problem[] = [];
  for (const target of targets) {
    if (!existsSync(target)) {
      console.error(`Nothing at ${target}.`);
      process.exit(2);
    }
    const result = checkPath(target);
    files += result.files;
    problems.push(...result.problems);
  }
  if (problems.length > 0) {
    console.error(`Checks failed on ${targets.join(", ")}:`);
    for (const p of problems) console.error(`  ${path.relative(process.cwd(), p.file)}: ${p.message}`);
    process.exit(1);
  }
  console.log(`Checks passed: ${files} files in ${targets.join(", ")}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main(process.argv.slice(2));
