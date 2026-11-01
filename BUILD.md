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
optional: the review chat's three passes found nothing more. Phase E starts
once John has done it, or decides not to.

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

**Status:** TODO

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

**Status:** TODO

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

**Status:** TODO

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

### Step 12 — The résumé page, old links and 404

**Status:** TODO

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

**Status:** TODO

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

**Status:** TODO

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

**Status:** TODO

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

**Status:** TODO

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

**Status:** TODO

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

These steps start once John has read over the platform, or decided he doesn't
need to (the server README's *To do*, item 1).

### Step 18 — The server's part, on paper first

**Status:** TODO

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
- **Do, in outline:**

  ```bash
  VPS$ sudo install -d -m 755 /srv/static          # then the two files from server/
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
  one-time OK for `--delete` into `/srv/sites/johnjamieson` (INV-11).
- **Do, in outline:**
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
- **Do:** Install `conf/sites/johnjamieson.caddy` with the gated block only,
  then reload (RCP-13).
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

1. In Career: edit `resume.yaml`, run `make resume`, and commit.
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
