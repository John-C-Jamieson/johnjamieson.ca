// Loads and checks the two content files (ARCHITECTURE §4.2). The pages use it
// at build time and scripts/sync.ts before copying, so a problem stops both.
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "astro/zod";
import { resumeSchema, siteSchema } from "./schema.ts";
import type { Job, Resume, Site, Source, WorkEntry } from "./schema.ts";

export const RESUME_PATH = "content/resume.json";
export const SITE_PATH = "content/site.yaml";

export class ContentError extends Error {}

export interface Quote {
  job: Job;
  bullet: string;
}

export interface Phase {
  label: string;
  entries: WorkEntry[];
  startYear: number;
  endYear: number | null; // null: still going
}

export interface Content {
  resume: Resume;
  site: Site;
  current: Job | undefined; // the job with no end date
  figures: (Site["figures"][number] & Quote)[];
  work: (Site["work"][number] & Quote)[];
  phases: Phase[];
}

export function parseResume(text: string, file = RESUME_PATH): Resume {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new ContentError(`${file} isn't valid JSON: ${(error as Error).message}`);
  }
  const result = resumeSchema.safeParse(data);
  if (!result.success) {
    throw new ContentError(`${file} doesn't match the contract (D-10):\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export function parseSite(text: string, file = SITE_PATH): Site {
  let data: unknown;
  try {
    data = parseYaml(text);
  } catch (error) {
    throw new ContentError(`${file} isn't valid YAML: ${(error as Error).message}`);
  }
  const result = siteSchema.safeParse(data);
  if (!result.success) {
    throw new ContentError(`${file} doesn't have the expected fields:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

// Numbers as written: "30+" is 30, "44%" is 44, "1,200" is 1200, "05" is 5.
export function numbersIn(text: string): string[] {
  return [...text.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => String(Number(m[0].replace(/,/g, ""))));
}

// Every number the résumé states: those in its text, plus the years of its
// dates (not the months, which would let small numbers through). URLs don't count.
export function factNumbers(resume: Resume): Set<string> {
  const found = new Set<string>();
  walk(resume, "", (value, key) => {
    if (key === "startDate" || key === "endDate") found.add(String(Number(value.slice(0, 4))));
    else if (key !== "url" && key !== "$schema") for (const n of numbersIn(value)) found.add(n);
  });
  return found;
}

// Checks the site's words against the résumé and resolves what they point at.
// Collects every problem before throwing, so one run lists them all.
export function checkContent(resume: Resume, site: Site): Content {
  const problems: string[] = [];
  const facts = factNumbers(resume);

  walk(site, "", (value, key, where) => {
    if (key === "find") return; // a pointer into a bullet, checked below
    for (const n of numbersIn(value)) {
      if (!facts.has(n)) problems.push(`${where}: ${n} isn't in resume.json (every number must be)`);
    }
  });

  const quote = (source: Source, where: string): Quote | undefined => {
    const entry = resume.work.find((w) => w.name === source.job);
    if (!entry) {
      problems.push(`${where}: resume.json has no job named "${source.job}"`);
      return undefined;
    }
    if (entry.type !== "job") {
      problems.push(`${where}: "${source.job}" is a break, which has no bullets`);
      return undefined;
    }
    const matches = entry.highlights.filter((h) => h.includes(source.find));
    if (matches.length !== 1) {
      problems.push(
        matches.length === 0
          ? `${where}: no ${source.job} bullet contains "${source.find}". The résumé may have changed`
          : `${where}: "${source.find}" is in ${matches.length} ${source.job} bullets; use a longer phrase`,
      );
      return undefined;
    }
    return { job: entry, bullet: matches[0] };
  };

  const figures: Content["figures"] = [];
  site.figures.forEach((figure, i) => {
    const where = `figures[${i}]`;
    const found = quote(figure.source, where);
    if (!found) return;
    const inValue = numbersIn(figure.value);
    const inBullet = new Set(numbersIn(found.bullet));
    if (inValue.length === 0) problems.push(`${where}: the value "${figure.value}" has no number`);
    for (const n of inValue) {
      if (!inBullet.has(n)) problems.push(`${where}: ${n} isn't in its source bullet`);
    }
    figures.push({ ...figure, ...found });
  });

  const work: Content["work"] = [];
  site.work.forEach((card, i) => {
    const found = quote(card.source, `work[${i}]`);
    if (found) work.push({ ...card, ...found });
  });

  // Every job and break belongs to exactly one phase, so a new one in Career
  // stops the build until it has a place on the career path.
  const phaseOf = new Map<string, string>();
  for (const phase of site.phases) {
    for (const name of phase.jobs) {
      if (!resume.work.some((w) => w.name === name)) {
        problems.push(`phases "${phase.label}": resume.json has no job or break named "${name}"`);
      }
      const other = phaseOf.get(name);
      if (other) problems.push(`phases: "${name}" is in both "${other}" and "${phase.label}"`);
      phaseOf.set(name, phase.label);
    }
  }
  for (const w of resume.work) {
    if (!phaseOf.has(w.name)) problems.push(`phases: "${w.name}" isn't in any phase`);
  }

  if (problems.length > 0) {
    throw new ContentError(`The site's words don't match the résumé:\n  ${problems.join("\n  ")}`);
  }

  const phases = site.phases.map((phase): Phase => {
    const entries = resume.work.filter((w) => phase.jobs.includes(w.name));
    const ongoing = entries.some((w) => !w.endDate);
    return {
      label: phase.label,
      entries,
      startYear: Math.min(...entries.map((w) => year(w.startDate))),
      endYear: ongoing ? null : Math.max(...entries.map((w) => year(w.endDate!))),
    };
  });

  return {
    resume,
    site,
    current: resume.work.find((w): w is Job => w.type === "job" && !w.endDate),
    figures,
    work,
    phases,
  };
}

// Reads both files from the project folder. Builds and npm scripts run from
// there, so the working directory is the root.
let loaded: Content | undefined;
export function loadContent(root = process.cwd()): Content {
  loaded ??= checkContent(
    parseResume(readFileSync(path.join(root, RESUME_PATH), "utf8")),
    parseSite(readFileSync(path.join(root, SITE_PATH), "utf8")),
  );
  return loaded;
}

// Dates. The résumé page prints them as the Word master does (11/2025 –
// Present); the rest of the site uses month names.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function year(date: string): number {
  return Number(date.slice(0, 4));
}

export function resumeDate(date: string | undefined): string {
  if (!date) return "Present";
  const [y, m] = date.split("-");
  return m ? `${m}/${y}` : y;
}

export function shortDate(date: string | undefined): string {
  if (!date) return "now";
  const [y, m] = date.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

// Calls fn for every string in a value, with its key and its path.
function walk(value: unknown, where: string, fn: (value: string, key: string, where: string) => void, key = ""): void {
  if (typeof value === "string") fn(value, key, where);
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${where}[${i}]`, fn, key));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, where ? `${where}.${k}` : k, fn, k);
  }
}
