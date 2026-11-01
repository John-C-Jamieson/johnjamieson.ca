# CLAUDE.md

Rules for Claude sessions in johnjamieson.ca, John Jamieson's website.

**Start here.**

- `ARCHITECTURE.md` is the design and its decisions (D-1 to D-17).
- `BUILD.md` is the build, step by step, and the record of each step once
  it's done.

Read both before proposing a change. Decided items are closed, so don't
re-argue them.

## What this repo is

A static Astro site. Its facts come from John's master résumé, kept as
structured data in `~/Projects/Career` and copied here as
`content/resume.json`. Its own words are in `content/site.yaml`. GitHub builds
it on every push and publishes the result to the `deploy` branch, and John's
server, articuno, fetches it from there (ARCHITECTURE §7).

## Rules

- **Facts come only from `content/resume.json`.** It's a copy of Career's
  `Master Resume & Cover Letter/Public Export/resume.json`, made by
  `npm run sync`.
  - Never edit it here.
  - Never copy anything else from Career. The rest of that folder is private.
- **The site's own words live in `content/site.yaml`.** They frame and
  emphasize, but add no facts (D-2). The build checks two things (D-11):
  - every number in `site.yaml` appears in `resume.json`;
  - each selected-work card finds its bullet.
- **No contact details:** no phone number, email, street address or résumé
  PDF (D-3). The city, LinkedIn and GitHub are fine.
- **No client names or internal system names**, anywhere (Career's rule,
  2026-10-31).
- **Test data is made up:** 555 phone numbers and `example.com` addresses.
  This repo is public.
- **No JavaScript in the browser, no cookies, no third-party requests** (D-9).
  The build fails if a page gains a script.
- **Few files.** Notes go in `ARCHITECTURE.md` or `BUILD.md`, not in new files.
- **`BUILD.md` steps keep their numbers.** Record each step's outcome under
  it: DONE with the date, plus anything that went differently.
- **Server steps on articuno** follow `~/Projects/OVHcloud/CLAUDE.md` and its
  `SPEC.md`. Claude writes a script; John runs it with his key and types the
  `sudo` password.
- **Career steps** follow `~/Projects/Career/CLAUDE.md`.
- **Commit after each step or change.**

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | The site at `http://localhost:4321`, reloading on changes |
| `npm run build` | Builds `dist/`, then checks it: privacy, links, symlinks, no scripts |
| `npm run check` | Type check, tests, and the privacy check on `content/` |
| `npm test` | The tests of the checks and the content rules |
| `npm run sync` | Copies Career's export into `content/resume.json` after checking it |
| `npm run sync -- --check` | Says whether `content/resume.json` matches Career's export |

## Day to day

- **The résumé changed in Career:**
  1. Run `npm run sync` and look over `git diff content/resume.json`.
  2. Commit as "Résumé: sync from Career <commit>", then push.
  3. It's live within about ten minutes; `https://johnjamieson.ca/build.json`
     shows the commit.
- **The site's words or design:** edit, look with `npm run dev`, run
  `npm run check` and `npm run build`, then commit and push.
- **Undo:** `git revert <commit>`, then push.
