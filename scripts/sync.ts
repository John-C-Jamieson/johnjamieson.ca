// Copies Career's website export into content/resume.json, after checking it
// (ARCHITECTURE §4.4).
//
//   npm run sync               check, then copy if it changed
//   npm run sync -- --check    only say whether the two match (exit 1 if not)
//
// The export is read from ~/Projects/Career unless CAREER_EXPORT names
// another file. Nothing else in Career is ever read.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ContentError, RESUME_PATH, SITE_PATH, checkContent, parseResume, parseSite } from "../src/lib/content.ts";
import { privacyProblems } from "./checks.ts";

const source =
  process.env.CAREER_EXPORT ??
  path.join(os.homedir(), "Projects/Career/Master Resume & Cover Letter/Public Export/resume.json");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

// The Career commit the export comes from, and whether it has changes
// that aren't committed yet. Undefined if Career isn't a git repo.
function careerCommit(file: string): { sha: string; date: string; dirty: boolean } | undefined {
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", path.dirname(file), ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    const [sha, date] = git("log", "-1", "--format=%h %cs", "--", file).split(" ");
    return sha ? { sha, date, dirty: git("status", "--porcelain", "--", file) !== "" } : undefined;
  } catch {
    return undefined;
  }
}

if (!existsSync(source)) {
  fail(`Career's export isn't at ${source}.\nRun make resume in Career, or set CAREER_EXPORT to the file.`);
}
const incoming = readFileSync(source, "utf8");
const current = existsSync(RESUME_PATH) ? readFileSync(RESUME_PATH, "utf8") : undefined;

if (process.argv.includes("--check")) {
  if (incoming === current) {
    console.log("In sync: content/resume.json matches Career's export.");
    process.exit(0);
  }
  fail("Out of date: Career's export differs from content/resume.json. Run npm run sync.");
}

// Check before copying, so content/ never holds a file the build would refuse.
try {
  const resume = parseResume(incoming, "Career's export");
  const leaks = privacyProblems(incoming);
  if (leaks.length > 0) fail(`Not copied: Career's export contains ${leaks.join("; ")}.`);
  checkContent(resume, parseSite(readFileSync(SITE_PATH, "utf8")));
} catch (error) {
  if (error instanceof ContentError) {
    fail(`Not copied. ${error.message}\n\nFix content/site.yaml (or the résumé in Career), then run npm run sync again.`);
  }
  throw error;
}

const commit = careerCommit(source);
const from = commit ? `Career ${commit.sha} (${commit.date})` : "Career";
if (commit?.dirty) {
  console.warn("Note: Career's export has changes that aren't committed in Career yet. Commit them there, so the sync can name its commit.");
}
if (incoming === current) {
  console.log(`Already in sync with ${from}.`);
  process.exit(0);
}
writeFileSync(RESUME_PATH, incoming);
console.log(`Updated content/resume.json from ${from}.`);
console.log(`Look over git diff content/resume.json, then commit as "Résumé: sync from Career${commit ? ` ${commit.sha}` : ""}".`);
