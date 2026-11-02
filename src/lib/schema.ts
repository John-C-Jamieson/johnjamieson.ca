// The shapes of the two content files (ARCHITECTURE §4). Strict on purpose
// (D-10): a field this file doesn't know, or one it needs that's missing,
// stops the sync and the build, so a change in Career gets shown on purpose.
//
// resume.json follows Career's Public Export/README.md: JSON Resume v1.0.0
// plus tagline, work type, positionNote, writeup and websiteHighlights.
import { z } from "astro/zod";

const text = z.string().min(1);
const date = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, "dates are YYYY or YYYY-MM");

const job = z.strictObject({
  type: z.literal("job"),
  name: text,
  location: text,
  position: text,
  positionNote: text.optional(),
  startDate: date,
  endDate: date.optional(),
  highlights: z.array(text).min(1),
  // Every bullet for the website: the master's first, then website-only ones,
  // each with an optional longer paragraph. Career's Stage 2, 2026-11-01.
  // /resume/ keeps to highlights, so it still matches the PDF.
  websiteHighlights: z.array(z.strictObject({ text, long: text.optional() })).min(1).optional(),
  writeup: text.optional(),
});

const careerBreak = z.strictObject({
  type: z.literal("break"),
  name: text,
  location: text,
  startDate: date,
  endDate: date.optional(),
  summary: text,
  writeup: text.optional(),
});

export const resumeSchema = z.strictObject({
  $schema: z.url(),
  basics: z.strictObject({
    name: text,
    label: text,
    tagline: text,
    url: z.url(),
    summary: text,
    location: z.strictObject({
      city: text,
      region: text,
      countryCode: z.string().length(2),
    }),
    profiles: z.array(z.strictObject({ network: text, username: text, url: z.url() })),
  }),
  work: z.array(z.discriminatedUnion("type", [job, careerBreak])).min(1),
  education: z.array(
    z.strictObject({
      institution: text,
      studyType: text.optional(),
      area: text.optional(),
      endDate: date,
    }),
  ),
  skills: z.array(z.strictObject({ name: text, keywords: z.array(text).min(1) })),
  projects: z.array(
    z.strictObject({
      name: text,
      description: text.optional(),
      highlights: z.array(text).optional(),
      keywords: z.array(text).optional(),
      startDate: date.optional(),
      endDate: date.optional(),
      url: z.url().optional(),
    }),
  ),
});

// A pointer from the site's words to one résumé bullet: the job's name and a
// phrase found in exactly one of its bullets.
const source = z.strictObject({ job: text, find: text });

// A section's title, and an optional line under it
const section = z.strictObject({ title: text, intro: text.optional() });

export const siteSchema = z.strictObject({
  meta: z.strictObject({ description: text }),
  hero: z.strictObject({ headline: text, intro: text }),
  sections: z.strictObject({
    figures: section,
    work: section,
    path: section,
    principles: section,
    skills: section,
    education: section,
  }),
  figures: z.array(z.strictObject({ value: text, label: text, source })),
  work: z.array(z.strictObject({ title: text, source })),
  phases: z.array(z.strictObject({ label: text, jobs: z.array(text).min(1) })).min(1),
  principles: z.array(z.strictObject({ title: text, text })),
  // John's quote, at the top of every page's footer
  quote: z.strictObject({ text, by: text }).optional(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type WorkEntry = Resume["work"][number];
export type Job = z.infer<typeof job>;
export type Site = z.infer<typeof siteSchema>;
export type Source = z.infer<typeof source>;
