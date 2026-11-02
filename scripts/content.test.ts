// Tests for src/lib/content.ts: the content contract and the facts check.
// All the data is made up: this repo is public.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ContentError, checkContent, factNumbers, numbersIn, parseResume, parseSite, resumeDate, shortDate } from "../src/lib/content.ts";
import type { Resume, Site } from "../src/lib/schema.ts";

const resume = (): Resume => ({
  $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  basics: {
    name: "Sam Example",
    label: "Analyst",
    tagline: "SQL · Reporting",
    url: "https://example.com",
    summary: "An analyst with a decade of reporting.",
    location: { city: "Toronto", region: "Ontario", countryCode: "CA" },
    profiles: [{ network: "LinkedIn", username: "sam", url: "https://example.com/sam" }],
  },
  work: [
    {
      type: "job",
      name: "Example Bank",
      location: "Toronto, Ontario",
      position: "Analyst",
      startDate: "2022-03",
      highlights: ["Resolved 40+ requests in a year.", "Cut a report from 9 hours to 2, a 78% saving."],
    },
    {
      type: "break",
      name: "Study",
      location: "Toronto, Ontario",
      startDate: "2020",
      endDate: "2021",
      summary: "Retrained in software.",
    },
    {
      type: "job",
      name: "Example Co",
      location: "Toronto, Ontario",
      position: "Accountant",
      startDate: "2012-05",
      endDate: "2019-12",
      highlights: ["Automated the month-end close."],
    },
  ],
  education: [{ institution: "Example University", studyType: "BBA", endDate: "2012" }],
  skills: [{ name: "Data", keywords: ["SQL"] }],
  projects: [],
});

const site = (): Site => ({
  meta: { description: "Sam Example, analyst." },
  hero: { headline: "Answers from data.", intro: "Reporting since 2012." },
  sections: {
    figures: { title: "At a glance" },
    work: { title: "Work", intro: "Three examples." },
    path: { title: "Path" },
    principles: { title: "How" },
    skills: { title: "Skills" },
    education: { title: "Education" },
  },
  figures: [{ value: "78%", label: "faster reporting", source: { job: "Example Bank", find: "78% saving" } }],
  work: [{ title: "Faster close", source: { job: "Example Co", find: "month-end" } }],
  phases: [
    { label: "Finance", jobs: ["Example Co"] },
    { label: "Retraining", jobs: ["Study"] },
    { label: "Data", jobs: ["Example Bank"] },
  ],
  principles: [{ title: "Check twice", text: "Every number is checked." }],
});

const fails = (r: Resume, s: Site, pattern: RegExp) =>
  assert.throws(() => checkContent(r, s), (e: unknown) => e instanceof ContentError && pattern.test(e.message));

test("reads numbers as written", () => {
  assert.deepEqual(numbersIn("30+ requests, a 44% cut, 1,200 rows, month 05"), ["30", "44", "1200", "5"]);
});

test("counts the résumé's numbers and its years, but not its months or URLs", () => {
  const facts = factNumbers(resume());
  for (const n of ["40", "9", "2", "78", "2022", "2020", "2012", "2019"]) assert.ok(facts.has(n), n);
  assert.ok(!facts.has("3"), "a month isn't a fact"); // 2022-03
  assert.ok(!facts.has("1"), "the schema URL's version isn't a fact");
});

test("a site that matches its résumé passes, with quotes and phases resolved", () => {
  const content = checkContent(resume(), site());
  assert.equal(content.current?.name, "Example Bank");
  assert.match(content.figures[0].bullet, /78% saving/);
  assert.equal(content.work[0].job.name, "Example Co");
  assert.deepEqual(
    content.phases.map((p) => [p.label, p.startYear, p.endYear]),
    [["Finance", 2012, 2019], ["Retraining", 2020, 2021], ["Data", 2022, null]],
  );
});

test("a number that isn't in the résumé stops the build", () => {
  const s = site();
  s.hero.intro = "Over 500 reports delivered.";
  fails(resume(), s, /hero\.intro: 500 isn't in resume\.json/);
});

test("a figure must match its own bullet, not just the résumé", () => {
  const s = site();
  s.figures[0].value = "40+"; // 40 is in the résumé, but in another bullet
  fails(resume(), s, /figures\[0\]: 40 isn't in its source bullet/);
});

test("a pointer that finds no bullet, or two, stops the build", () => {
  const none = site();
  none.work[0].source.find = "quarter-end";
  fails(resume(), none, /no Example Co bullet contains "quarter-end"/);
  const two = site();
  two.work[0] = { title: "Two", source: { job: "Example Bank", find: "." } };
  fails(resume(), two, /is in 2 Example Bank bullets/);
});

test("every job and break needs exactly one phase", () => {
  const missing = site();
  missing.phases.pop();
  fails(resume(), missing, /"Example Bank" isn't in any phase/);
  const twice = site();
  twice.phases[0].jobs.push("Study");
  fails(resume(), twice, /"Study" is in both/);
});

test("the contract is strict: unknown fields and bad dates are refused", () => {
  const extra = { ...resume(), certificates: [] };
  assert.throws(() => parseResume(JSON.stringify(extra)), /Unrecognized key: "certificates"/);
  const badDate = resume();
  badDate.work[0].startDate = "March 2022";
  assert.throws(() => parseResume(JSON.stringify(badDate)), /YYYY or YYYY-MM/);
  assert.throws(() => parseSite("hero: {}\n"), /expected fields/);
});

test("website-only bullets count as facts, can be quoted, and bring their paragraph", () => {
  const r = resume();
  const bank = r.work[0];
  assert.ok(bank.type === "job");
  bank.websiteHighlights = [
    ...bank.highlights.map((text) => ({ text })),
    { text: "Rebuilt 12 monthly reports as one model.", long: "A longer story about the model." },
  ];
  const s = site();
  s.hero.intro = "Twelve reports, now 12 in one model."; // 12 appears only in the website-only bullet
  s.work.push({ title: "One model", source: { job: "Example Bank", find: "one model" } });
  const content = checkContent(r, s);
  const card = content.work.find((w) => w.title === "One model");
  assert.equal(card?.bullet, "Rebuilt 12 monthly reports as one model.");
  assert.equal(card?.long, "A longer story about the model.");
  // A master bullet sits in both lists, but is still found once
  assert.match(content.figures[0].bullet, /78% saving/);
  assert.equal(content.figures[0].long, undefined);
});

test("dates read the way each page prints them", () => {
  assert.equal(resumeDate("2025-11"), "11/2025");
  assert.equal(resumeDate("2021"), "2021");
  assert.equal(resumeDate(undefined), "Present");
  assert.equal(shortDate("2025-11"), "Nov 2025");
  assert.equal(shortDate(undefined), "now");
});
