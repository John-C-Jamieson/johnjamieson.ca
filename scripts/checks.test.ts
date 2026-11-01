// Tests for scripts/checks.ts. All the data is made up: this repo is public.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkPath, htmlText, privacyProblems } from "./checks.ts";

test("finds phone numbers in the usual forms", () => {
  for (const text of ["Call 416-555-0199", "(416) 555-0199", "416.555.0199", "+1 416 555 0199"]) {
    assert.equal(privacyProblems(text).length, 1, text);
  }
});

test("finds emails, street addresses, unit numbers, postal codes and contact links", () => {
  assert.match(privacyProblems("write to someone@example.com")[0], /email/);
  assert.match(privacyProblems("at 123 Example Street")[0], /street address/);
  assert.match(privacyProblems("12 Sample Rd")[0], /street address/);
  assert.match(privacyProblems("Suite 400")[0], /unit number/);
  assert.match(privacyProblems("A1A 1A1")[0], /postal code/);
  assert.match(privacyProblems('<a href="mailto:x">')[0], /link/);
});

test("leaves résumé-style numbers alone", () => {
  const text = [
    "consolidated a four-file, 674-line program to two files (378 lines), a 44% reduction",
    "a 459-event, 288-transaction report; 30+ requests across 5+ areas",
    "IAS 18 → IFRS 15, Microsoft Dynamics (GP / D365), 2016-11 to 2019-12, 2026-10-31",
  ].join("\n");
  assert.deepEqual(privacyProblems(text), []);
});

test("reads a page's words, attributes and entities, but not styles or the CSP", () => {
  const html = `<html><head>
    <meta http-equiv="content-security-policy" content="style-src 'sha256-A1A1A1'">
    <style>.a{content:"416-555-0199"}</style>
    <meta name="description" content="Words here">
  </head><body><img alt="Photo of someone" src="/x.png"><p>a&#64;example.com</p></body></html>`;
  const text = htmlText(html);
  assert.match(text, /Words here/);
  assert.match(text, /Photo of someone/);
  assert.match(text, /a@example\.com/);
  assert.doesNotMatch(text, /416-555-0199|sha256/);
});

function site(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "checks-test-"));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), text);
  }
  return root;
}

const messages = (root: string) => checkPath(root).problems.map((p) => p.message);

test("a clean site passes, with links to pages, folders and its own address", () => {
  const root = site({
    "index.html": `<a href="/resume/">R</a><a href="/resume">R</a><link rel="canonical" href="https://johnjamieson.ca/">
      <img src="/_astro/a.webp" srcset="/_astro/a.webp 1x, /_astro/b.webp 2x"><script type="application/ld+json">{"name":"X"}</script>`,
    "resume/index.html": "<p>Résumé</p>",
    "_astro/a.webp": "",
    "_astro/b.webp": "",
    "sitemap-0.xml": "<loc>https://johnjamieson.ca/resume/</loc>",
  });
  assert.deepEqual(messages(root), []);
});

test("refuses scripts, event handlers, broken links and symlinks", () => {
  const root = site({
    "index.html": `<script src="/a.js"></script><button onclick="x()">B</button><a href="/missing/">M</a>`,
    "a.js": "",
  });
  symlinkSync("/etc/hostname", path.join(root, "link"));
  const found = messages(root).join("\n");
  assert.match(found, /a script file/);
  assert.match(found, /a script: <script/);
  assert.match(found, /inline event handler/);
  assert.match(found, /missing page or file: \/missing\//);
  assert.match(found, /symlink/);
});

test("finds private details in built pages and data files", () => {
  const root = site({
    "index.html": "<p>Reach me at 416-555-0199</p>",
    "build.json": '{"note":"someone@example.com"}',
  });
  const found = messages(root).join("\n");
  assert.match(found, /phone number/);
  assert.match(found, /email address/);
});
