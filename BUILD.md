# johnjamieson.ca — build guide

These steps take the new site from an empty repo to live on articuno.
`ARCHITECTURE.md` has the design and the reasons; this file says what to do.
When a step is done, it becomes the record: its status changes to DONE with the
date, and anything that went differently gets written under it, as in the
server's `SETUP.md`.

- **One step at a time.** Each step says who does it, what to do, what to
  expect when it worked, and what to record.
- **Step numbers never change.** A step added later takes the next free number,
  or a letter (`12a`).
- **John's steps** are the ones that need his accounts, passwords or OK: `sudo`
  on the PC or the server, GitHub and Netlify settings, DNS at Namecheap, and
  every approval.
- **Server steps** (18–21, 24 and 28) follow `~/Projects/OVHcloud/CLAUDE.md`.
  Claude writes each one as a script. John runs it from the Terminal panel with
  his key loaded and types the `sudo` password there, and Claude reads the
  result. These steps are also recorded in the server repo: SETUP numbered on
  from 25, SPEC §4, and `server/`.
- **Career steps** (8 and 28) follow `~/Projects/Career/CLAUDE.md`.

## Where things stand (2026-11-02)

- **Done:** steps 1–18, 11a and 11b. The site is built and on GitHub, and
  every push to `main` checks, builds and publishes it to the `deploy` branch
  in about 25 s. Career's `make resume` says when the site's copy of the
  résumé is out of date (step 8). The server's side is on paper and tried on
  the PC (step 18).
- **Not live yet.** johnjamieson.ca still points at the old Netlify site,
  which shows the internal system names until the switch (step 24).
- **Next, in order:**
  1. **Phase E, steps 19–22, on articuno.** Before step 19, the first change
     on the server, John decides whether to read over the platform first
     (the server README's *To do*, item 1). Step 19 is the server's BLD-13.
  2. **Phase F (steps 23–28):** the switch.
- **Open items:**
  - **The 17 website-only bullets** are facts the site may quote, but no page
    shows them yet. Later, they could feed more figures (Salumatics' "more
    than 100 days" down to "within 30 days", say) or a fuller experience
    section.
  - **John prints `/resume/` once** (Ctrl+P) to confirm the print layout
    (step 12).
  - **Dependabot's first pull request** confirms that pull requests are
    checked without publishing (step 17).
  - **PageSpeed Insights** after launch (step 25).
  - **At step 21,** check `/resume` and `/projects` without the slash on the
    server. On the PC they gave a `308` to the same with a slash (step 18).

## Overview

| Phase | Steps | Where | Touches the live site? |
|---|---|---|---|
| A. Ready | 1–3 | The PC | No |
| B. Foundation | 4–8 | The PC (and Career) | No |
| C. The site | 9–14 | The PC | No |
| D. GitHub | 15–17 | GitHub | No |
| E. articuno | 18–22 | The server | No, only the gated preview |
| F. Go live | 23–28 | Namecheap, the server, Netlify, GitHub | Yes, from step 24 |

Phases B to D need nothing from the server, so they can run while John reads
over the platform (the server README's *To do*, item 1). That read is now
optional: the review chat's three passes found nothing more. Step 18 is on
paper only, so John started it first, and decides about the read before
step 19, the first change on the server (2026-11-01).

## Phase A — Ready

### Step 1 — Accept the plan

**Status:** DONE 2026-11-01. John went through D-8 to D-17 one at a time and
accepted each as written. Along the way he chose the ice palette as the main
design direction (ARCHITECTURE §5.3, step 9). He also started a Career session
to turn `resume.yaml` into a tagged master. That session will add
website-only items to `resume.json`, which count as facts like any other (D-11).

- **Who:** John.
- **Do:** Read `ARCHITECTURE.md`. Accept each [P] decision in §10, or say what
  to change.
- **Expect:** every row in §10 is [D], with a date.
- **Record:** `ARCHITECTURE.md` §10.

### Step 2 — Node 24 on the PC

**Status:** DONE 2026-11-01. John ran the install: it swapped in
`nodejs24-bin` and `nodejs24-npm-bin`, giving Node 24.18.0 and npm 11.16.0.
He then removed Node 22 with `sudo dnf remove 'nodejs22*'`, freeing 169 MiB.

- **Who:** John (`sudo`).
- **Why:** Astro 7.4 needs Node 22.23.4 or newer, and the PC has 22.23.1.
  Fedora 44 packages Node 24, and its `-bin` packages make it the default
  `node` and `npm`.
- **Do:**

  ```bash
  sudo dnf install --allowerasing nodejs24-bin nodejs24-npm-bin
  ```

  Read dnf's summary before typing `y`. It should install the `nodejs24`
  packages and remove, at most, `nodejs22-bin` and `nodejs22-npm-bin`. Those
  only hold the `node` and `npm` links; Node 22 itself stays installed.
- **Expect:** `node --version` shows v24, and `npm --version` shows 11. Nothing
  else on the PC depends on `node`: there were no global npm packages on
  2026-11-01.
- **Record:** here.

### Step 3 — Clear out the old site

**Status:** DONE 2026-11-01, with John's OK. Before removal, `git fetch` showed
`HEAD` = `origin/main` = `0b361ee`, no tracked changes, no stashes and no other
branches, so GitHub holds everything that was removed. The photo was saved as
`src/assets/john-jamieson.jpg`: 3000 × 2000, 696 KB. Only the JFIF header and
the Adobe RGB colour profile remain; the EXIF, XMP and Photoshop blocks are
gone. The old files and `.git/` were removed, then `git init -b main`.

- **Who:** Claude checks and prepares; John okays the removal.
- **Why:** this folder still holds the old site's repo, `personal-web-page`.
  The new repo starts with fresh history, so the old résumé claims and the
  internal system names don't come along (D-6).
- **Do:**
  1. Check the folder matches GitHub exactly. After `git fetch`, `git status`
     must be clean and `HEAD` must equal `origin/main` (`0b361ee` on
     2026-10-31). If anything differs, stop and show John.
  2. Keep the photo, without its metadata. This keeps only the colour
     profile, so the colours stay right:

     ```bash
     mkdir -p src/assets
     magick frontend/public/head.jpg -auto-orient +profile '!icc,*' -quality 92 src/assets/john-jamieson.jpg
     ```

  3. With John's OK, remove the old files: `backend/`, `frontend/`,
     `package.json`, `package-lock.json`, `README.md`, `LICENSE`, `.gitignore`
     and `.git/`. GitHub keeps the full history.
  4. `git init -b main`
- **Expect:**
  - The folder holds `ARCHITECTURE.md`, `BUILD.md` and
    `src/assets/john-jamieson.jpg`.
  - `magick identify -format '%[EXIF:*]' src/assets/john-jamieson.jpg` prints
    nothing.
  - `git status` shows a new repo with no commits.
- **Record:** here.

## Phase B — Foundation

### Step 4 — The Astro project

**Status:** DONE 2026-11-01.

- **Installed:** `astro` 7.4.4, `@astrojs/sitemap` 3.7.4, `yaml` 2.9.1 and
  `@fontsource-variable/inter` 5.3.0. For checking: `@astrojs/check` 0.9.12,
  `typescript` 6.0.3, and `@types/node` 24.19.2, added so the scripts' Node
  APIs are type-checked. `sharp` comes with Astro.
- **The font, a change from the plan:** Astro's local font provider points at
  the npm package's Latin variable file. Astro 7.4's npm provider hands its
  fetcher `file://` URLs, which Node's `fetch` can't open, so the build failed
  (`CannotFetchFontFile`). The result is as planned: one 48 KB woff2 served
  from the site and preloaded, with an Arial fallback sized to match. The
  package also needs the name `Inter Variable`, not `Inter`.
- **Shiki off** (`markdown.syntaxHighlight: false`): its inline styles clash
  with the CSP, and the site has no code blocks.
- **Result:**
  - `dist/` holds `index.html`, the sitemap and the font, with no `.js` files.
  - The page has the CSP `<meta>`.
  - `npm run dev` served the page (HTTP 200), and `npm run check` reported 0
    errors.
- **For step 9:** Astro puts the CSP `<meta>` after the font's `<style>` in
  the head. Revisit the order when the layout is built.

- **Who:** Claude.
- **Do:** Write the project files by hand rather than with Astro's starter, so
  nothing unused comes along.
  - **`package.json`:** `"private": true`, `"type": "module"`,
    `"engines": { "node": ">=24" }`, and the scripts `dev`, `build`,
    `preview`, `check` (`astro check`, the tests and the content checks),
    `test` and `sync`.
  - **`astro.config.mjs`:**
    - `site: "https://johnjamieson.ca"` and `trailingSlash: "always"`, so links
      match the folders Caddy serves;
    - the sitemap integration;
    - `security.csp`, with the directives `default-src 'self'`,
      `img-src 'self'`, `font-src 'self'`, `object-src 'none'`,
      `base-uri 'self'` and `form-action 'none'`;
    - the font through Astro's Fonts API, from an npm package, so builds don't
      depend on a font CDN. Check the provider's options against Astro's docs
      first.
  - **`tsconfig.json`:** extends `astro/tsconfigs/strict`, and adds
    `erasableSyntaxOnly` so Node can run the scripts as written.
  - **`.gitignore`:** `node_modules/`, `dist/` and `.astro/`.

  Then install, with the versions recorded in `package-lock.json`:

  ```bash
  npm install astro@7 @astrojs/sitemap yaml @fontsource-variable/inter
  npm install -D @astrojs/check typescript@6
  ```

- **Expect:**
  - A placeholder `src/pages/index.astro` builds. `npm run build` writes
    `dist/index.html` with a CSP `<meta>` tag.
  - `find dist -name '*.js'` prints nothing.
  - `npm run dev` serves the page at `http://localhost:4321`.
- **Record:** here.

### Step 5 — CLAUDE.md, README and licence

**Status:** DONE 2026-11-01.

- `CLAUDE.md` lists the commands as they'll be after step 7 (`test` and `sync`
  arrive then).
- `LICENSE` puts the MIT licence on the code and reserves the content: the
  words, the photos and `public/` images, and anything built from them.
- The first commit, local only, holds this and steps 1–4.

- **Who:** Claude writes them; John reads `CLAUDE.md`.
- **Do:**
  - **`CLAUDE.md`:** what the repo is, with `ARCHITECTURE.md` and `BUILD.md`
    as the place to start, plus the rules and the day-to-day routines (below).
    The rules:
    - facts come only from `content/resume.json`, which is never edited by hand
      (`npm run sync` updates it);
    - the site's words live in `content/site.yaml` and add no facts;
    - no contact details, no client or internal system names, and nothing else
      from Career;
    - test data is always made up;
    - few files;
    - server steps follow OVHcloud's `CLAUDE.md`.
  - **`README.md`:** a few lines for visitors on GitHub: what the site is, how
    it's built, and the licence.
  - **`LICENSE`:** as D-15 says.
  - The first commit. It stays local; GitHub comes at step 16.
- **Expect:** `git log` shows one commit, and `git status` is clean.
- **Record:** here.

### Step 6 — The content contract

**Status:** DONE 2026-11-01. Built together with step 7, since checking it
needs the synced résumé.

- **`src/lib/schema.ts`** has strict Zod schemas for `resume.json` (following
  Career's `Public Export/README.md`) and for `site.yaml`.
- **`src/lib/content.ts`** loads the files, quotes bullets by `find` and
  formats dates. The facts check counts the numbers in the résumé's text plus
  its dates' years, not the months or URLs.
- **Added: every job and break must sit in exactly one phase,** so a new job
  in Career stops the build until it has a place on the career path.
- **`content/site.yaml`** holds draft words from ARCHITECTURE §4.2 and §5.2,
  marked DRAFT until step 10.
- **The real files pass.** Test copies stopped with these messages:
  - a renamed field: `Unrecognized key: "bullets" → at work[0]`;
  - `find: "460-event"`: "no First National bullet contains "460-event"";
  - "Over 500 reports" in the intro: "hero.intro: 500 isn't in resume.json".

  A figure changed to 45% stopped `astro build` itself with the same kind of
  message.

- **Who:** Claude.
- **Do:**
  - **The schema for `resume.json`,** in `src/lib/`. It follows Career's
    `Public Export/README.md` field by field, and it's strict (D-10): unknown
    fields fail, dates are `YYYY` or `YYYY-MM`, and `type` is `job` or `break`.
  - **The schema for `site.yaml`**, in the shape shown in ARCHITECTURE §4.2.
  - **The loader**, in `src/lib/content.ts`. It loads and validates both files,
    then:
    - resolves each `find` to exactly one bullet;
    - computes each phase's years;
    - runs the facts check (every number in `site.yaml` appears in
      `resume.json`);
    - formats dates for the pages.
  - **A first `content/site.yaml`** with placeholder words that pass the
    checks.
- **Expect:** the build passes on the real files. On a test copy, it stops with
  a clear message when a field is renamed, when a `find` matches nothing, and
  when a number isn't in the résumé.
- **Record:** here.

### Step 7 — Sync and checks

**Status:** DONE 2026-11-01.

- **`scripts/checks.ts`:**
  - **Pages:** it reads the text, the structured data and the attributes that
    hold words. It skips styles, the CSP's hashes and asset URLs, which can
    look like postal codes.
  - **Added, for D-9:** it refuses `mailto:` and `tel:` links, scripts other
    than JSON-LD, inline event handlers, and `.js` files.
  - **Links:** checks cover canonical, Open Graph and sitemap URLs too.
- **`npm run build` runs the checks on `dist/` itself,** so the PC and GitHub
  check the same way (step 17's outline is updated).
- **`scripts/sync.ts` also checks `site.yaml` against the incoming résumé**
  before copying, so a résumé change that breaks a quote is caught at sync
  time. It warns if Career's export has changes not yet committed in Career.
- **16 tests** (`node --test`), all with made-up data.
- **First sync:** from Career `e1aa93e` (2026-10-31). `content/resume.json`
  is byte for byte the same as the export, and `--check` says "In sync".
- **Refusals tested:** an export with a 555 phone number, and one with a
  renamed field, were each "Not copied", and `content/` stayed untouched.
- **Results:** `npm run check` showed 0 errors, 16 tests passing, and the
  content checks passing. `npm run build` passed its checks on all 4 files.

- **Who:** Claude.
- **Do:**
  - **`scripts/checks.ts`** runs three checks:
    - privacy, on files or folders: phone numbers, email addresses, street
      addresses, unit numbers and Canadian postal codes;
    - internal links, on `dist/`: every `href` and `src` that starts with `/`
      must exist;
    - symlinks.
  - **`scripts/sync.ts`** reads Career's export, validates it with the schema,
    and runs the privacy check. If the file differs, it copies it to
    `content/resume.json` and prints the Career commit to quote. The export's
    default path is
    `~/Projects/Career/Master Resume & Cover Letter/Public Export/resume.json`;
    `CAREER_EXPORT` overrides it. With `--check`, it only compares, and exits
    with 1 when the two differ.
  - **`scripts/*.test.ts`** has cases for each check, using made-up data only:
    555 phone numbers and `example.com` addresses.
  - The first `npm run sync`.
- **Expect:**
  - `content/resume.json` is byte for byte the same as Career's export.
  - `npm run sync -- --check` says the two are in sync.
  - `npm test` and `npm run check` pass.
  - Commit.
- **Record:** here.

### Step 8 — Career reports website drift (D-12)

**Status:** DONE 2026-11-01, in Career commit `be8ff72`.

- **The check:** the last thing `build.py` does is compare the new export
  with `content/resume.json` here, byte for byte, as
  `npm run sync -- --check` does. It prints one line:
  - "Website: up to date";
  - "Website: out of date: run npm run sync in ~/Projects/johnjamieson.ca",
    also when this repo has no copy yet;
  - "Website: ~/Projects/johnjamieson.ca not found, so not compared", a note
    rather than an error, if this folder is missing.

  It only reads. It runs only when the build succeeds, since a failed build
  writes nothing.
- **Added for the tests:** `WEBSITE_DIR` points the check at another folder.
  `make test` has 5 new checks, 70 in all, all passing: a matching copy, a
  differing one, none yet, a missing folder, and that the site's file is
  never written.
- **Career's docs:** `CLAUDE.md` (a fourth step after a fact changes, and
  the command list), `README.md`, `Build/README.md` (workflow step 5, a
  paragraph on the check and the `build.py` row) and `HANDOFF.md` (a dated
  entry, and the website item now points to this file).
- **Result:** `make resume` in Career ended with "Website: up to date", and
  every output was unchanged.

- **Who:** Claude, in Career (its `CLAUDE.md` applies), with John's OK.
- **Do:**
  - At the end of Career's `build.py`, compare the new
    `Public Export/resume.json` with `~/Projects/johnjamieson.ca/content/resume.json`.
    Print "Website: up to date" or
    "Website: out of date: run npm run sync in ~/Projects/johnjamieson.ca".
    It only reads, and a missing website folder prints a note, not an error.
  - Add the step to Career's workflow in `CLAUDE.md`, `README.md` and
    `Build/README.md`, and point HANDOFF's website item here.
  - Commit in Career.
- **Expect:** `make resume` in Career prints "Website: up to date".
- **Record:** here, with Career's commit.

## Phase C — The site

### Step 9 — Look and feel

**Status:** DONE 2026-11-01. John chose B, "Glacier", on my recommendation.

- **Built, to judge the look on real content:** a first pass of the home page
  and the résumé page. Step 11 finishes the home page, and step 12 the résumé
  page.
  - The tokens are in `src/styles/tokens.css`, alongside base and print
    styles.
  - `src/layouts/Base.astro` has the header, a skip link and the footer, which
    shows "Résumé last updated" from git.
  - The home page has six section components. Section titles such as
    "Selected work" are labels in the templates, not site words.
- **Two palettes were shown:**
  - **A, Frost:** a frost-blue hero and footer.
  - **B, Glacier:** a deep navy hero and footer.
  - Both had the same dark theme. B was on a temporary page, now removed, and
    is now the light theme. In dark mode the hero and footer become dark frost
    bands, as in the screenshots John saw.
- **Two fixes that came with B:**
  - The photo has a 1 px steel-blue edge (`--photo-edge`), so its dark
    backdrop doesn't melt into the navy.
  - The header overlaps the hero by a pixel (`box-shadow`). Without it, a
    hairline showed between the two navy blocks when the page was scaled. It's
    gone at the scaled 1280 px view.
- **Contrast:** `scripts/design.test.ts` reads the tokens and checks every
  text colour against its background, in light and dark. The lowest ratio is
  4.9:1 (muted text on frost); WCAG AA needs 4.5.
- **Head order:** Astro places the CSP `<meta>` after the font's inline
  `<style>` and preload. Nothing can be moved ahead of it, since Astro adds it
  at the end of the head. It's harmless: those two are the site's own static
  files, and the policy covers everything else.
- **For step 13:** the home page's title reads "John Jamieson — Data & BI
  Analyst — Financial Systems", with two dashes. Tidy it then.
- **Fixes found while checking:**
  - Tabular figures now apply only to number columns (the `.tnum` class).
    Applied everywhere, Inter's tabular forms widened the hyphen in
    "decision-ready".
  - `ol` lost its default indent.
- **Results:**
  - The built pages (CSP on) gave no console errors, and Inter loads from the
    site.
  - At 375 px there's no sideways scrolling.
  - The home page is 14.6 KB of HTML, about 11 KB of CSS, 48 KB of font and a
    12 KB AVIF photo: roughly 86 KB on a first visit.
  - `npm run check`: 0 errors and 20 tests passing.

- **Who:** Claude builds; John chooses.
- **Do:**
  - Build the design tokens (light and dark colours, the type scale, spacing),
    the base styles, the print styles, and the layout: a header with the name
    and links, a skip link, and a footer.
  - Start from ARCHITECTURE §5.3's direction: the ice palette as the main
    option, plus one variation (John, 2026-11-01). Show John screenshots from
    the browser pane, at phone and desktop widths, in light and dark.
- **Expect:** John approves a direction. Text contrast meets WCAG AA in both
  themes, computed from the tokens.
- **Record:** the chosen tokens, and any change to ARCHITECTURE §5.3.

### Step 10 — The site's own words

**Status:** DONE 2026-11-01. John approved the draft as written.

- **Section titles and intros now live in `site.yaml`** (a `sections` block),
  so every word of copy is in one file and covered by the facts check. The
  description moved under `meta`.
- **Page titles tidied** (from step 13's list): the home page is
  "John Jamieson · Data & BI Analyst — Financial Systems", and other pages
  read "Résumé · John Jamieson".
- **The figures avoid the bullets the work cards quote,** so nothing appears
  twice: 30+ requests, 5+ business areas, 300+ records and 44% fewer lines.
- **The new headline has no hyphenated word,** so the phone no longer breaks
  it after "decision-".
- **Checks:** the facts check passes, `npm run check` shows 0 errors and 19
  tests passing, and the build passes its checks with no console errors.

- **Who:** Claude drafts; John edits and approves.
- **Do:** Draft `content/site.yaml`:
  - the headline and intro;
  - the key figures;
  - the four selected-work titles and their sources;
  - the career phases;
  - the how-I-work principles;
  - section intros, page titles and the meta description.

  Draw only on what the master says, and follow the naming rule.
- **Expect:** the facts check passes, and John approves the words.
- **Record:** here.

### Step 11 — The home page

**Status:** DONE 2026-11-01. The sections, the photo and "Résumé last updated"
were built at step 9; this step checked them and fixed one thing.

- **Facts:** all 4 work cards quote a résumé bullet word for word. The only
  numbers on the page that aren't résumé facts are the browser setting
  `initial-scale=1` and the footer's "last updated" year.
- **Photo colours:** the original is Adobe RGB, and sharp converts it to sRGB
  correctly.
  - Compared with a properly converted copy, the error (RMSE) is 0.0135;
    against an unconverted copy it's 0.0209.
  - Mean saturation is 0.080, against 0.078 for the converted copy and 0.059
    for the unconverted one.
  - The web copies carry no colour profile. They come as AVIF and WebP, with
    a JPEG fallback, from 160 to 640 px wide.
- **At 320 px:** nothing is wider than the screen (`scrollWidth` 320).
- **Keyboard:**
  - The skip link comes first, and every link shows a focus ring.
  - **Fixed:** on the navy header, hero and footer, the ring used the page's
    blue (`#1a6db3`). That's about 2.9:1 on navy, below WCAG's 3:1 for focus
    indicators.
  - Each surface now sets `--focus` to its own accent, so the ring is ice
    blue there (9.4:1).
- **No JavaScript:** the build's own check confirms there's none.

- **Who:** Claude.
- **Do:**
  - Build the sections from ARCHITECTURE §5.2 as components, fed by
    `src/lib/content.ts`.
  - Show the photo through Astro's `<Picture>`, as AVIF and WebP sized for the
    layout.
  - Take "Résumé last updated" from the git history of `content/resume.json`.
- **Expect:**
  - Every fact on the page matches `resume.json`.
  - The photo's colours match the original. The original is Adobe RGB, and the
    web copies get converted to sRGB.
  - Nothing scrolls sideways at 320 px.
  - The page works by keyboard alone, with visible focus.
  - `dist/` has no `.js` files.
  - John reviews it in the browser pane.
- **Record:** here.

### Step 11a — "Read more" on the work cards

**Status:** DONE 2026-11-01. John chose it from the proposal, as
prototyped.

- **What it does:** each card keeps its title and résumé bullet. Under the
  bullet, "Read more" opens Career's longer paragraph for that bullet
  (`websiteHighlights`, `long`), and the label turns to "Show less". A card
  whose bullet has no paragraph shows no "Read more".
- **No JavaScript:** it's HTML's `<details>`, styled as a text button in the
  link colour with a chevron. The CSP needed no change. The two labels live
  in the template, like "Read the résumé"; the paragraphs are facts.
- **Screen readers:** each control takes its card's title as its description
  (`aria-describedby`), so the four can be told apart.
- **The grid:** cards in a row share a height, so on a wide screen, opening
  one leaves blank space under its neighbour. Kept: closed is how most
  visitors see them, and closed they line up.
- **Checked:** mouse, touch and keyboard (Enter opens, Tab moves on, with the
  focus ring), at 375 px and 1280 px, in light and dark. Nothing scrolls
  sideways, and the build passes its checks on 29 files.
- **Weight:** the home page's HTML grew by 3.5 KB (1.0 KB gzipped) and its
  CSS by 1.0 KB (0.2 KB), so a first visit is about 56 KB before the photo
  (step 14).
- **Not chosen:**
  - the paragraphs always open: about 380 more words, on a page meant to
    read in thirty seconds;
  - the paragraph in place of the bullet: the card would stop quoting the
    résumé;
  - a page per piece of work: ARCHITECTURE §9 keeps that for longer
    write-ups.

- **Who:** Claude proposes and builds; John chooses.
- **Do:** show Career's four paragraphs on the work cards, with no
  JavaScript.
- **Expect:** each card opens and closes by mouse, touch and keyboard, and
  the build's checks pass.
- **Record:** here, and ARCHITECTURE §5.2.

### Step 11b — The footer's quote

**Status:** DONE 2026-11-01.

- **Why:** the old site's footer opened with John's Churchill quote
  (`footerQuote`, in `personal-web-page`'s `frontend/src/data/profile.ts`).
  The plan for the new footer left it out without asking him, and John
  noticed.
- **Back where it was,** at the top of the footer on every page. The footer
  stays out of print.
- **In `site.yaml`** (`quote`: `text` and `by`), like the rest of the site's
  words, so the checks cover it. It's optional in the schema: delete it and
  the footer goes without.
- **The wording is the old site's, by John's choice.** Hansard's record of
  the speech (11 November 1947) differs: "it has been said that democracy
  is the worst form of Government except all those other forms that have
  been tried from time to time". So Churchill was repeating an older saying.
  John chose the familiar version, knowing this.
- **No year in the credit line:** the facts check (D-11) stops the build on
  a number that isn't in the résumé.
- **Checked:** at 375 px and 1280 px, in light and dark, on the home and
  résumé pages. `npm run check` shows 0 errors and 20 tests passing, and the
  build passes its checks.

- **Who:** Claude; John chooses the wording.
- **Do:** put the old site's quote back in the footer.
- **Expect:** it shows on every page, and the checks pass.
- **Record:** here, and ARCHITECTURE §5.2.

### Step 12 — The résumé page, old links and 404

**Status:** DONE 2026-11-01.

- **Compared with the Word master** (`soffice --cat`), 38 of its 44 lines
  appear on the page word for word. The other 6:
  - the name, which the master sets in capitals;
  - the contact line, left out on purpose (D-3);
  - the four skill lines. They come through the export as lists, so the page
    joins each with commas: "Agile delivery, applied GenAI" where the master
    has "Agile delivery; applied GenAI", and "Bash, Git" for "Bash; Git". It
    also drops the colon after each group name.
- **Print:** the header, footer and backgrounds are hidden, the text is black
  on white, and the profile links are spelled out.
  - No headless Chrome here, so the check was a simulation: the print rules
    switched on in the browser at Letter width. It gave about 1.7 Letter pages
    and looked tidy.
  - Still to do: John prints it once himself (Ctrl+P) to confirm.
- **`/projects/`** redirects to `/` while `projects` is empty. The redirect is
  set in `astro.config.mjs` from the data, so it drops out by itself once
  projects exist. Redirect and 404 pages stay out of the sitemap.
- **`404.astro`** links home and to the résumé.
- **Added:** the page is now a column, so the footer sits at the bottom even
  on a short page.
- **For the server (step 21):** `astro preview` refuses `/resume` without the
  slash, because of `trailingSlash`. Caddy's file server adds the slash
  instead. Check `/resume` and `/projects` there.

- **Who:** Claude.
- **Do:**
  - **`/resume/`:** the full master from `resume.json`, with the Word master's
    sections in the same order and no contact details. Print styles give a
    clean PDF.
  - **`/projects/`:** redirects to `/` while `projects` is empty. The redirect
    is set in `astro.config.mjs` from the data, so it goes away by itself once
    projects exist.
  - **`404.astro`.**
- **Expect:**
  - The résumé page's text matches the master's, apart from the contact line.
    Compare it with `soffice --headless --cat` on Career's master.
  - Printing gives a tidy PDF.
  - `/projects` lands on the home page.
- **Record:** here.

### Step 13 — Search, sharing and icons

**Status:** DONE 2026-11-01.

- **Every page** has a title, a description, and Open Graph and Twitter tags.
  Indexed pages get a canonical link; the 404 gets `noindex`, with no
  canonical or `og:url`.
  - The link check caught `og:url` pointing at `/404/`, which doesn't exist.
    Fixed by leaving it off pages that aren't indexed.
  - The page titles were tidied at step 10.
- **The preview image** is `public/og.jpg`: 1200 × 630, 57 KB, the photo and
  the name in the site's own font and colours.
  - **To remake it**, for a new photo say: put `inter.woff2` (from
    `node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`)
    and `photo.jpg` (from `src/assets/john-jamieson.jpg`) beside an
    `og.html`, then follow the steps below.

    1. `og.html` is a 1200 × 630 page: background `#0c2340`, 96 px side
       padding, flex with space between.
       - **Left:** a 64 × 6 px rule in `#8fd0f7`; "John" and "Jamieson" on
         two lines at 96 px, weight 750, letter-spacing -0.03em, colour
         `#f1f8fd`; then "johnjamieson.ca" at 34 px, weight 600, in
         `#8fd0f7`.
       - **Right:** the photo, 376 × 470, `object-fit: cover`, radius 22 px,
         with a 2 px `#46698f` ring.
    2. Run
       `firefox --headless --no-remote --profile <empty folder> --window-size=1200,630 --screenshot og.png file://…/og.html`.
    3. Run `magick og.png -strip -quality 88 public/og.jpg`.
  - It shows only the name and the address, so it never goes out of date.
- **`schema.org/Person` data**, on the home page only, built from the résumé:
  name, job title, Toronto, LinkedIn and GitHub, and the current employer.
  It parses as JSON.
- **The icon:** a "JJ" monogram in ice blue on navy, drawn as strokes
  (`favicon.svg`), so it needs no font. Also `favicon.ico` (16, 32 and
  48 px) and a 180 px `apple-touch-icon.png`, made with ImageMagick.
- **Also added:** `theme-color` for light and dark, and `robots.txt` pointing
  at the sitemap. The sitemap lists `/` and `/resume/` only.
- **Results:** the icons, the image, `robots.txt` and the sitemap all load
  (200), and the page has no console errors.

- **Who:** Claude.
- **Do:**
  - Titles, descriptions and canonical links on every page.
  - The sitemap and `robots.txt`.
  - Open Graph and Twitter tags, with the 1200 × 630 preview image (photo and
    name), made once with ImageMagick into `public/`.
  - `schema.org/Person` data, from `resume.json`.
  - A simple monogram favicon: SVG, plus ICO and an Apple touch icon.
- **Expect:** each page's `<head>` has the tags, the JSON-LD parses, and the
  icon shows in the browser tab.
- **Record:** here.

### Step 14 — Quality pass

**Status:** DONE 2026-11-01, except Lighthouse. It runs only in Chrome, and
there's none on the PC, so run PageSpeed Insights, which is Lighthouse on the
web, after launch (step 25).

- **`npm run check`:** 0 errors, 19 tests passing, and the content checks
  pass. `npm run build` passes its checks on all 29 files.
- **Weight on a first visit** (HTML and CSS gzipped, as Caddy will send them):

  | Page | HTML + CSS + font | With the photo |
  |---|---|---|
  | Home | 54.8 KB | 60.7 KB at 1x, 74.1 KB at 2x |
  | Résumé | 53.6 KB | — |
  | 404 | 50.5 KB | — |

  The budget was 300 KB. The 47 KB font is cached after the first page.
- **Headings:** each page has one `h1`, `h2` sections with `h3` under them,
  and no skipped levels.
- **Alt text:** every image has it.
- **Contrast:** checked by `scripts/design.test.ts` (step 9). Focus rings
  fixed at step 11.
- **Links:** internal links are checked on every build. Of the external ones,
  the GitHub profile answers 200. The source link,
  `github.com/John-C-Jamieson/johnjamieson.ca`, answers 404 until the repo
  exists (steps 15–16). LinkedIn refuses automated checks.
- **Printing** was simulated at step 12; John confirms with Ctrl+P.
- **Phone layout:** checked at 375 px (step 9) and 320 px (step 11).

- **Who:** Claude. John can also run Lighthouse in his own Chrome.
- **Do:** Run `npm run check`, then check:
  - each page's weight;
  - the heading outline;
  - alt text and contrast;
  - links;
  - printing;
  - the phone layout in the browser pane.

  John's phone gets its look at step 21.
- **Expect:** every check passes, the pages fit the weight budget
  (ARCHITECTURE §5.5), and, if John runs Lighthouse, each category scores 95 or
  more.
- **Record:** the numbers.

## Phase D — GitHub

### Step 15 — Create the repo

**Status:** DONE 2026-11-01. John created the repo, public and empty, and
turned on Dependabot alerts and security updates. The API showed it public,
size 0, with `main` as its default branch.

- **Who:** John, on github.com.
- **Do:**
  - Create a new repository under `John-C-Jamieson` named `johnjamieson.ca`. It
    should be public and empty: no README, licence or `.gitignore`.
  - Then go to Settings → Code security, and turn on Dependabot alerts and
    security updates.
- **Expect:** https://github.com/John-C-Jamieson/johnjamieson.ca shows an empty
  repo.
- **Record:** here.

### Step 16 — First push

**Status:** DONE 2026-11-01.

- **Signing in, a change from the plan:** the PC had no GitHub sign-in. Git
  had no stored credentials, and no SSH key was on John's account. So John
  installed GitHub's CLI (`sudo dnf install gh`, 2.97.0) and signed in:
  `gh auth login --hostname github.com --git-protocol https --web`, then
  `gh auth setup-git`.
  - The sign-in is kept in the keyring, with the scopes `repo`, `workflow`,
    `read:org` and `gist`.
  - Git uses it through `gh auth git-credential`. Claude can push and check
    runs (`gh run list`).
- **Just before the push,** the site learned Career's Stage 2 field
  `websiteHighlights` (`7552fec`) and synced from Career `ed8562c` (`ccf5a35`).
  - The new numbers count as facts, and work cards can quote website-only
    bullets.
  - `/resume/` keeps to the master's bullets.
- **Pushed** `main` at `ccf5a35`. GitHub's `content/resume.json` is byte for
  byte the same as Career's export.

- **Who:** Claude, with John's OK to push.
- **Do:**

  ```bash
  git remote add origin https://github.com/John-C-Jamieson/johnjamieson.ca.git
  git push -u origin main
  ```

  It uses the same GitHub sign-in as the old repo did.
- **Expect:** the code is on GitHub, and its `content/resume.json` matches
  Career's export.
- **Record:** here.

### Step 17 — The build-and-publish workflow

**Status:** DONE 2026-11-01, except one check still to come: that a pull
request runs the checks without publishing. Dependabot's first pull request
will show it.

- **The workflow, `.github/workflows/site.yml`, follows the outline below.**
  Where it differs:
  - concurrency is grouped per branch (`site-${{ github.ref }}`);
  - the publishing step is named;
  - the bot's commits use its standard name and address.
- **Actions pinned:** `actions/checkout` v7.0.1 (`3d3c42e`) and
  `actions/setup-node` v7.1.0 (`949feb2`). Both are plain tags, so the hash
  is the commit itself.
- **`.github/dependabot.yml`:** npm and GitHub Actions, monthly. Minor and
  patch updates come grouped; each major on its own. It skips TypeScript 7
  and `@types/node` 25 and on (D-8).
- **First run** (41375339676, from `8877454`): green in 25 s. `npm run check`
  showed 0 errors and 20 tests passing; `npm run build` passed its checks on
  29 files; then it published.
- **The `deploy` branch:**
  - one commit, "Deploy 8877454…";
  - 30 files: the built site plus `build.json`;
  - `build.json` names `887745439807…`, the pushed commit;
  - the deployed home page reads "Résumé last updated Nov 2026", so git
    history reaches the build.

- **Who:** Claude.
- **Do:** Write `.github/workflows/site.yml`, as in ARCHITECTURE §7.1. An
  outline (the build pins each action to its commit hash):

  ```yaml
  on:
    push: { branches: [main] }
    pull_request: {}
  permissions:
    contents: write                  # only to push the deploy branch
  concurrency: { group: site, cancel-in-progress: false }
  jobs:
    site:
      runs-on: ubuntu-24.04
      steps:
        - uses: actions/checkout@<hash>      # v7.0.1
          with: { fetch-depth: 0 }           # history, for "Résumé last updated"
        - uses: actions/setup-node@<hash>    # v7.1.0
          with: { node-version: 24, cache: npm }
        - run: npm ci
        - run: npm run check
        - run: npm run build                 # includes the checks on dist/
        - if: github.event_name == 'push'
          env: { TOKEN: "${{ github.token }}" }
          run: |                             # dist/ becomes the deploy branch, one commit
            printf '{"commit":"%s","built":"%s"}\n' "$GITHUB_SHA" "$(date -u +%FT%TZ)" > dist/build.json
            cd dist && git init -q -b deploy && git add -A
            git -c user.name=github-actions -c user.email=github-actions@users.noreply.github.com \
              commit -q -m "Deploy $GITHUB_SHA"
            git push -q -f "https://x-access-token:$TOKEN@github.com/$GITHUB_REPOSITORY.git" deploy
  ```

  Also write `.github/dependabot.yml`: npm and GitHub Actions, monthly, each
  grouped into one pull request.
- **Expect:**
  - The run on `main` is green.
  - `git ls-remote origin deploy` shows a commit, and that branch holds
    `index.html`, `_astro/` and a `build.json` naming the right commit.
  - A pull request runs the checks but doesn't publish.
- **Record:** here.

## Phase E — On articuno

Step 18 is on paper only. The others start once John has read over the
platform, or decided he doesn't need to (the server README's *To do*, item
1).

### Step 18 — The server's part, on paper first

**Status:** DONE 2026-11-02, in OVHcloud commit `aa80cfd`. John accepted
DEC-30 to DEC-32 as written. Nothing changed on the server.

- **The decisions,** from D-13: DEC-30, the small Caddy `static`; DEC-31,
  the fetch, `site-fetch`; DEC-32, this site on them, with the preview first.
- **SPEC:** BLD-13 builds `static` (step 19) and BLD-14 the fetch (step 20),
  each with every file in full. The preview (step 21) has no BLD of its own:
  it's RCP-4 step 5, in the rewritten recipe for static sites. The registry
  rows are *planned*, and CON-2, CON-4, CON-6, CON-9 and TPL-7 match.
- **Also in OVHcloud:** ARCHITECTURE §5.4, §6, §8 and §11 to §13; the
  README's *To do*, and its projects table, which still described the old
  site. That fix was planned for step 28, which still marks the site live.
- **Different from the plan:**
  - The small Caddy's file is `srv/static/conf/Caddyfile`: the server's
    CON-6 mounts a folder, never a single file.
  - `site-fetch` fetches each new commit into a fresh repository, so
    nothing builds up. git checks the objects as they arrive, which refuses
    a `..` path, and a submodule is refused as well as a symlink.
  - `rsync` compares checksums, so unchanged files keep their dates and
    browsers their copies. It deletes only after the new files land
    (`--delete-delay` with `--delay-updates`).
- **Tried on the PC:**
  - `site-fetch`: 22 checks against a throwaway repository, all passing,
    the plan's five among them. Then a run against GitHub's real `deploy`
    branch: 30 files, 492 KB, in 0.6 s, with `build.json` naming `7c0d8ed`,
    and a second run up to date.
  - The small Caddy, in podman with Caddy 2.11.7, serving those files: 22
    checks, alone and behind the main Caddy's real `(public)` snippet. They
    cover ARCHITECTURE §7.3, plus `/resume` and `/projects` without the
    slash. One bug turned up, now fixed: a missing `/_astro/` file's 404
    kept the year-long cache header, so a visitor could have kept a broken
    page.
  - The main Caddyfile passed `caddy validate` with the new site file, and
    again with the public and `www` blocks. `www` answered with a 301 to the
    bare name.
- **Until steps 19 to 21** put them on the server, its drift check (INV-7)
  lists the six new files in `server/` as missing there.

- **Who:** Claude, in `~/Projects/OVHcloud` (its `CLAUDE.md` applies); John
  reviews.
- **Do:** Documents and files only; nothing changes on the server yet.
  - **In SPEC:**
    - new BLD steps for the small Caddy (`static`) and for `site-fetch` with
      `johnjamieson-fetch.{service,timer}`;
    - registry rows marked *planned*: §4.1 `static` and `johnjamieson`, §4.2
      port 8001, and §4.5 the timer;
    - RCP-4 (*Add a static site*) rewritten for this pattern;
    - a DEC for each new choice in D-13.
  - **In ARCH:** §5.4 and §6 to match.
  - **The files in `server/`:**
    - `srv/static/compose.yaml` and `srv/static/Caddyfile`;
    - `usr/local/bin/site-fetch`;
    - `etc/systemd/system/johnjamieson-fetch.service` and `.timer`;
    - `srv/caddy/conf/sites/johnjamieson.caddy`, with the gated block only.
  - **`site-fetch` uses git (`ls-remote`, `fetch`), never
    raw.githubusercontent.com.** Right after a deploy on 2026-11-01, the raw
    URL served the previous `build.json` for a few minutes, from its cache.
  - **Test `site-fetch` on the PC first,** against a throwaway local repo. It
    must:
    - deploy a normal update;
    - do nothing when the branch hasn't changed;
    - refuse an update that has a symlink;
    - refuse one with no `index.html`;
    - honour `hold`.
- **Expect:** John accepts the DECs, and the script passes its PC tests.
- **Record:** in OVHcloud (SPEC, ARCH, README *To do*), committed there.

### Step 19 — The small Caddy

**Status:** TODO

- **Who:** Claude writes and checks the script; John runs it.
- **Do:** the server's BLD-13, which has the commands and both files. In
  outline:

  ```bash
  VPS$ sudo install -d -m 755 /srv/static/conf     # then compose.yaml and conf/Caddyfile
  VPS$ sudo install -d -o john -g john -m 755 /srv/sites/johnjamieson
  VPS$ cd /srv/static && sudo docker compose up -d
  ```

- **Expect:**
  - INV-1 to INV-5 hold: only `127.0.0.1:8001` is published, the container has
    a memory limit, and it has no extra privileges.
  - `VPS$ curl -sI http://127.0.0.1:8001/` gets an answer from Caddy (a 404
    while the folder is empty).
- **Record:** SETUP 26, or the next free number; SPEC §4.1 and §4.2 marked
  *built*.

### Step 20 — The fetch

**Status:** TODO

- **Who:** Claude writes and checks the script; John runs it and gives the
  one-time OK for `rsync`'s deletes in `/srv/sites/johnjamieson` (INV-11).
- **Do:** the server's BLD-14. In outline:
  1. Check that `git` and `rsync` are installed.
  2. Install `site-fetch` and the two units from `server/`, then run
     `daemon-reload`.
  3. Run it once by hand with `sudo systemctl start johnjamieson-fetch.service`,
     and read its journal.
  4. `enable --now` the timer.
- **Expect:**
  - `/srv/sites/johnjamieson/build.json` names the same commit as GitHub's
    `deploy` branch.
  - A second run logs that it's up to date.
  - `systemctl list-timers johnjamieson-fetch.timer` shows the next run within
    five minutes.
- **Record:** SETUP; SPEC §4.5 marked *built*.

### Step 21 — The gated preview

**Status:** TODO

- **Who:** Claude writes and checks the script; John runs it, then looks.
- **Do:** the server's RCP-4 step 5. Install `conf/sites/johnjamieson.caddy`,
  with the gated block only, then reload (RCP-13).
- **Expect:**
  - https://johnjamieson.articuno.johnjamieson.ca asks for the passkey, then
    shows the site, on the PC and on the phone.
  - The page has the CSP `<meta>` tag. The response has the anti-framing header
    from the small Caddy and HSTS from the main one.
  - Files under `/_astro/` can be cached for a year.
  - A missing page returns a 404 status with the 404 page.
  - **End to end:** a small change pushed to `main` shows up in the preview
    within ten minutes.
- **Record:** SETUP; SPEC §4.1 (`johnjamieson`, tier gated, *built*). INV-8's
  check passes.

### Step 22 — The launch review

**Status:** TODO

- **Who:** John.
- **Do:** On the preview, read every page on the phone and on the PC. Check
  the words, the facts, the photo, the résumé page and its printout.
- **Expect:** John's go-ahead to launch, with a date and a quiet time.
- **Record:** here.

## Phase F — Go live

### Step 23 — Lower the TTL

**Status:** TODO

- **Who:** John, at Namecheap; Claude checks.
- **Do:** Set the TTL of `@` and `www` to 5 minutes. Wait at least 30 minutes
  (the old TTL) before step 24.
- **Expect:** `dig +noall +answer johnjamieson.ca @dns1.registrar-servers.com`
  shows a TTL of 300 or less.
- **Record:** `namecheap-dns.xlsx`, in OVHcloud (CON-7).

### Step 24 — The switch

**Status:** TODO

- **Who:** John, at Namecheap and on the server; Claude checks each part.
- **Do:**
  1. **DNS.** John replaces `A @ 75.2.60.5` with
     `ALIAS @ → articuno.johnjamieson.ca`, and `A www 75.2.60.5` with
     `CNAME www → articuno.johnjamieson.ca`. Proton's records stay as they are.
  2. **Check.** Claude runs `dig A` and `dig AAAA` for both names, first at
     `@dns1.registrar-servers.com` and then at `@1.1.1.1`. If the ALIAS gives no
     AAAA answer, John decides (D-14): keep it, or replace it with
     `A @ 149.56.212.156` and `AAAA @ 2607:5300:205:200::f04b`, as a recorded
     exception to CON-7.
  3. **Public site file, straight away.** Add the public blocks to
     `johnjamieson.caddy`, keeping the gated one until step 28, and reload
     (RCP-13). Caddy gets both certificates within a minute.
- **Expect:**
  - **From the PC:**
    - `curl -sI https://johnjamieson.ca` gets a 200 from Caddy.
    - `curl -sI https://www.johnjamieson.ca/resume/` gets a 301 to
      `https://johnjamieson.ca/resume/`.
    - `curl -sI http://johnjamieson.ca` redirects to HTTPS.
    - `openssl s_client` shows Let's Encrypt certificates for both names.
    - `https://johnjamieson.ca/build.json` names the latest commit.
  - **From John's phone, on mobile data:** the site loads over IPv6, if there's
    an AAAA answer.
- **Record:**
  - `namecheap-dns.xlsx`;
  - SPEC §4.1: `johnjamieson` public since <date>, with John's OK (INV-9);
  - SPEC §4.4: the two records;
  - SETUP.

### Step 25 — After launch

**Status:** TODO

- **Who:** Claude, then John.
- **Do:**
  - Check that old links (`/resume`, `/projects` and the `www.` versions) land
    in the right place, along with the sitemap and `robots.txt`.
  - John pastes the address into LinkedIn's Post Inspector to check the preview
    card, and updates the website field on his LinkedIn profile if needed.
  - Optional: Google Search Console. It needs a DNS TXT record, so it's John's
    call.
- **Expect:** everything listed works.
- **Record:** here.

### Step 26 — Retire Netlify

**Status:** TODO

- **Who:** John, a day or two after step 24.
- **Do:** In Netlify, remove the custom domain from the site `john-jamieson`,
  then delete the site.
- **Expect:** https://john-jamieson.netlify.app no longer serves the old site.
- **Record:** here, and in the server README.

### Step 27 — Retire the old repo

**Status:** TODO

- **Who:** John, on github.com.
- **Do:** In `personal-web-page` → Settings, make the repo private (D-16), or
  archive it if he'd rather it stayed visible.
- **Expect:** the repo is no longer public, or is read-only if archived.
- **Record:** here.

### Step 28 — Tidy the records

**Status:** TODO

- **Who:** Claude, with John's OK for the server part.
- **Do:**
  - **Server:**
    - remove the gated preview block and reload (RCP-13);
    - update SPEC §4.4's note about Netlify and ARCH §6's row for the bare
      domain;
    - update the README's projects table to `~/Projects/johnjamieson.ca`, live
      since <date>, and close *To do* item 2;
    - add a glance at `johnjamieson-fetch` to the weekly look (RCP-11);
    - commit in OVHcloud.
  - **Career:**
    - update the Career Profile's §7: the new repo, and the stack (Astro 7 and
      TypeScript, static, served from articuno), clearing its [Confirm];
    - update HANDOFF's website item;
    - commit in Career.
  - **Here:** update the status line in `ARCHITECTURE.md` to "live since
    <date>", and mark every step DONE.
- **Expect:** the three repos agree.
- **Record:** here.

## Day to day

**Update the résumé on the site**

1. In Career: edit `resume.yaml`, run `make resume`, and commit. Its last
   line says whether this site's copy is out of date (step 8).
2. Here: run `npm run sync`, look over `git diff content/resume.json`, commit
   as "Résumé: sync from Career <commit>", and push.
3. It's live within about ten minutes. To confirm:
   `curl -s https://johnjamieson.ca/build.json`.

**Change the site's words or design**

Edit, look with `npm run dev`, run `npm run check`, then commit and push.

**Undo a change**

`git revert <commit>`, then push. To stop updates while fixing something,
`VPS$ touch /var/lib/site-fetch/johnjamieson/hold`; remove the file to resume.

**Updates**

Dependabot opens grouped pull requests each month; merge them when the checks
pass. For an Astro major version (8 and on), read Astro's upgrade guide first.
