# johnjamieson.ca — architecture

**For John.** This is the design of the new johnjamieson.ca and the reasons
behind it; `BUILD.md` turns it into steps. Planned on 2026-11-01. The old site was
cleared out the same day (BUILD step 3); the new one is built and on GitHub,
but not live yet.

How to read it:

- **Decisions** are numbered `D-1`, `D-2`… and listed in §10. **[D]** means
  John decided it, with the date. **[P]** means it's proposed and waiting for
  John's OK at BUILD step 1. IDs never change.
- **Server IDs** such as DEC-26, CON-7 and INV-11 belong to the server and are
  defined in `~/Projects/OVHcloud/SPEC.md`. Everything on articuno follows those
  rules.
- **Career** means `~/Projects/Career`, which holds the master résumé.

## Contents

1. What the site is for
2. Goals, in order
3. The picture
4. Where every word comes from
5. The site
6. The code
7. Hosting and deployment
8. When things break
9. Growing it later
10. Decisions
11. Open questions

## 1. What the site is for

johnjamieson.ca is the front door to John's professional identity. His résumé
and LinkedIn point to it, so recruiters and hiring managers land here to check
him out. It has three jobs:

1. **Confirm the résumé.** It shows the same facts as the master résumé and
   LinkedIn, and is always current. A site that disagrees with the résumé costs
   credibility, and the old one did (review, 2026-10-31).
2. **Make the case better than a PDF can.** It leads with the strongest work,
   tells the career story (finance, then retraining, then systems and data) and
   looks sharp on a phone. The career strategy says to lead with proof; on a
   web page, the proof can come first.
3. **Be the hub for what comes next:** projects and apps John builds, each
   linked from here.

What it isn't:

- **A way to contact John.** It shows no phone number, email or address (D-3).
  LinkedIn is the way in.
- **An app.** Apps and demos live beside it on their own names (D-5).

## 2. Goals, in order

When two goals pull different ways, the higher one wins.

1. **Never wrong, never leaky.** Every fact comes from the master résumé.
   Nothing private appears, and no client or internal system names either
   (Career's naming rule). Machines check what they can, and John reviews the
   rest.
2. **Always up, with nothing to attack.** The site is plain files: no server
   code, database, forms or cookies, no JavaScript in the browser, and no
   secrets anywhere.
3. **Easy to keep current.** After a résumé change it takes one command and a
   push, and the change is live within about ten minutes.
4. **Use the medium.** The site has words of its own, reads well in thirty
   seconds, is fast on a phone, gives good link previews and is accessible to
   everyone.
5. **Room to grow, without a rewrite.**
6. **Few moving parts and few files.** Each part earns its place.

## 3. The picture

```
 John's PC                                   GitHub (public)                 articuno
 ─────────                                   ───────────────                 ────────
 ~/Projects/Career (private, local only)
   resume.yaml ── make resume ──► Public Export/resume.json
                                        │
                                        │ npm run sync (checks, then copies)
                                        ▼
 ~/Projects/johnjamieson.ca ── push ──► John-C-Jamieson/johnjamieson.ca
   content/resume.json  facts           main ──► Actions: check, build
   content/site.yaml    own words                          │
   src/                 Astro                              ▼
                                        deploy branch: the built site
                                                           │
                                 johnjamieson-fetch.timer, as john, every 5 min
                                                           ▼
                                                 /srv/sites/johnjamieson/
                                                           │
                                 small Caddy "static" on 127.0.0.1:8001 (DEC-28)
                                                           │
                                 main Caddy: certificates, headers
                                                           ▼
                                 https://johnjamieson.ca    (www redirects here)
```

Three boundaries matter:

- **Only `resume.json` leaves Career.** It carries public fields only, and
  Career's build won't write it if a phone number, email or address slips in.
- **GitHub can't reach the server.** The server pulls a public branch, so
  GitHub holds no key, token or login for articuno (DEC-26).
- **Nothing runs on the server but Caddy.** GitHub does the building; the
  server only copies files and serves them.

## 4. Where every word comes from

### 4.1 Three kinds of words

| Kind | Examples | Lives in | Written by | Rule |
|---|---|---|---|---|
| **Facts** | Employers, titles, dates, bullets, skills, education, the summary | Career's `resume.yaml`, copied here as `content/resume.json` | John, with Claude, in Career | Changed only in Career, never edited here (D-1) |
| **The site's own words** | The headline, the intro, section titles, titles for the selected work, the career phases, "how I work" | `content/site.yaml` | Claude drafts, John approves | They frame and emphasize, but add no facts (D-2) |
| **Website-only bullets, paragraphs and projects** | More bullets than the PDF has; the fuller story of a piece of work; a project | Career's tagged `resume.yaml`, exported as `websiteHighlights` (17 extra bullets and 4 paragraphs since 2026-11-01) and `projects` (empty) | John | They're facts, so they live in Career. Each appears on the site once a page uses it |

Why the split: facts have one home, so the résumé, LinkedIn and the site can't
disagree. The site's own words belong to the medium. A résumé can't have a
headline that sells, a section that leads with the four best pieces of work, or
a career drawn as a timeline. Because the two live in separate files, a résumé
update never touches the site's words, and a design change never touches the
facts.

### 4.2 How the site's own words stay honest

`content/site.yaml` can point at facts, but it never restates them by hand.

- **Numbers are checked.** Every number in `site.yaml` must appear in
  `resume.json`, or the build stops. "459 events" passes because the résumé
  says "459-event"; "500+ reports" would fail.
- **Selected work points at a bullet.** Each card names its job and a phrase
  from one of that job's bullets. The build finds the bullet and prints it
  exactly as the résumé has it. If the bullet changes or disappears, the build
  stops and names the card that lost its source.
- **Years are computed.** Each career phase lists the jobs it covers, and the
  years come from those jobs' dates.

The number check sees digits, not words, so "ten years" written out isn't
checked. That's what John's review is for.

Here's a sketch of the file. The wording gets drafted in BUILD step 10.

```yaml
hero:
  headline: Turning financial data into reliable, decision-ready answers.
  intro: >-
    I build the reporting, dashboards and automated data processes that
    businesses run on, and I speak finance as well as SQL.

figures:                    # each value must appear in its source bullet
  - value: "30+"
    label: reporting and data-extract requests resolved in just over six months
    source: { job: First National, find: "30+ resolved" }

work:                       # the title is the site's; the text is the résumé bullet
  - title: From a vague request to an auditable report
    source: { job: First National, find: "459-event" }

phases:                     # the years come from the jobs' dates
  - label: Finance and accounting
    jobs: [Salumatics, Circle of Care, Entertainment One]
```

### 4.3 Privacy and naming

- **Privacy check.** Before every sync, and on every build, a check looks for
  phone numbers, email addresses, street addresses and postal codes in
  `content/` and in every built page. Any match stops the sync or the build.
  This repo is public, so the check works from patterns only and never holds
  the private values themselves. Career's own check covers those.
- **Naming rule.** No client names or internal system names appear on any page
  (Career, 2026-10-31). There's no list of blocked names (John, 2026-10-31).
  The facts arrive already clean from the master, and John reviews the site's
  own words.
- **The photo.** Pages use copies that are re-encoded at build time and carry
  no metadata. The original is a 3000 × 2000 JPEG holding camera and Photoshop
  details but no location. It goes into the repo with that metadata stripped,
  and it's never published as is.

### 4.4 Keeping the site current

The routine after a résumé change:

1. **In Career:** edit `resume.yaml`, run `make resume` and commit, as Career
   already does.
2. **Here:** run `npm run sync`. It validates Career's export, runs the privacy
   check, copies the file to `content/resume.json`, and prints the Career commit
   it came from.
3. Look over `git diff`, commit as "Résumé: sync from Career <commit>", and
   push. The site is live within about ten minutes.

Drift gets caught at both ends:

- `npm run sync -- --check` says whether this repo's copy matches Career's
  export, without changing anything.
- With D-12, Career's `make resume` ends with "Website: up to date" or
  "Website: out of date: run npm run sync in ~/Projects/johnjamieson.ca". It's a
  small, read-only addition to Career's build. The reminder appears at the
  moment the résumé changes, in the place it changed.

The shape of `resume.json` is a contract, documented in Career's
`Public Export/README.md`: JSON Resume v1.0.0 plus a few extra fields. This site
checks it strictly (D-10). An unknown field, a missing one or a bad date stops
the sync with a message that names it. So when Career adds something new, the
site has to be taught to show it, rather than quietly ignoring it.

## 5. The site

### 5.1 Pages

| Page | What it is |
|---|---|
| `/` | The home page: a story built from the facts and the site's own words (§5.2) |
| `/resume/` | The master résumé in full, as text. It has the Word master's sections in the same order, without contact details, and prints cleanly to PDF |
| `/projects/` | Appears once Career's `projects` list has entries. Until then it redirects to `/` |
| 404 | A short "not found" page with links home and to the résumé |

The old site had `/resume` and `/projects` pages from February 2025 to June
2026, and résumés sent in that time may still be read. Both addresses keep
working.

### 5.2 The home page

In order, with where each part comes from:

1. **Hero.** The headline (site), John's label "Data & BI Analyst — Financial
   Systems" (fact), a short intro (site), the photo, and links to the résumé,
   LinkedIn and GitHub. Underneath is a line saying he's currently Junior
   AppOps Technician at First National (fact: the job with no end date).
2. **Key figures.** Three or four numbers from the résumé, each with a short
   label: 30+ requests, 459 events, 300+ records, a program cut by 44%. Every
   number is checked.
3. **Selected work.** Four cards, one for each proof point the career strategy
   says to lead with:
   - the First National SQL reporting;
   - the CIBC eazyBI dashboards;
   - the eOne revenue-reporting system and IFRS 15;
   - the Circle of Care Dynamics GP migration.

   Each card has a title (site) and its résumé bullet (fact), with the employer
   and the years. Under the bullet, "Read more" opens Career's longer
   paragraph for it (`websiteHighlights`, `long`). It's HTML's `<details>`,
   so it needs no JavaScript (BUILD step 11a).
4. **Career path.** A timeline from 2011 to now, drawn from every job and
   break and grouped into phases: finance and accounting, retraining, then
   systems and data. The labels are the site's; the years are computed. It
   shows the pivot at a glance, gaps included, just as the résumé does.
5. **How I work.** Three or four short principles (site), each grounded in a
   bullet. For example: pin down the question before writing the query; leave
   an audit trail; automate the second time; speak both finance and SQL.
6. **Skills and education** (facts), in the résumé's own groups.
7. **Footer.** It has:
   - Toronto, Ontario, plus links to LinkedIn and GitHub;
   - "Résumé last updated <month year>", taken from when `content/resume.json`
     last changed;
   - a link to the site's source.

The exact words get drafted in BUILD step 10 and approved by John.

### 5.3 Design direction

This is a starting point, to be settled in BUILD step 9 from screenshots. The
idea is **an annual report, not a template**: calm, precise and led by numbers,
which suits someone who turns financial data into answers.

- **Type:** one clean sans-serif for text (Inter, the variable version), with
  tabular figures so numbers line up like a financial statement, and perhaps a
  serif for headings to add character. The site serves its own font files.
- **Colour:** an ice palette called "Glacier", chosen by John on 2026-11-01
  over a frost-blue variation:
  - a deep navy hero and footer with ice-blue accents;
  - white and frost-blue bands between them;
  - a glacier-blue accent for links and highlights;
  - deep navy text, since pale blue text fails contrast.

  It's flat and still: no animated gradients or frosted glass. The dark theme
  is deep arctic navy with ice-blue accents. It follows the visitor's system
  setting, so there's no switch and no JavaScript.
- **Layout:** a comfortable reading width for text and a grid for the figures
  and cards. It's built for phones first, with no sideways scrolling down to a
  320-pixel screen.
- **Accessibility:** WCAG 2.2 AA. That means enough contrast in both themes,
  visible focus, a skip link, real headings, alt text, and no motion that
  ignores the visitor's "reduce motion" setting.
- **Print:** the résumé page prints as a clean document.

### 5.4 Search and sharing

- Each page has one address, `https://johnjamieson.ca/…`, declared as
  canonical. There's a sitemap, and `robots.txt` allows everything.
- Open Graph tags and a 1200 × 630 preview image (the photo and John's name,
  which won't go out of date) mean links pasted into LinkedIn, Slack or email
  show a proper card.
- Structured data (`schema.org/Person`) gives the name, job title, Toronto, and
  links to LinkedIn and GitHub. It's generated from `resume.json`.

### 5.5 Weight and privacy

- **No JavaScript in the browser** (D-9). Astro sends none unless asked to.
- **No third-party requests.** Fonts and images come from the site itself.
  There are no cookies and no tracking, so there's no consent banner.
- **Small:** the target is under 300 KB for a first visit, photo included.
  Later pages reuse the cached fonts and styles. BUILD step 14 measures it.
- **No visitor counts for now.** If John wants them later, see §9.

## 6. The code

### 6.1 Stack (versions as of 2026-11-01)

| Part | Choice | Why |
|---|---|---|
| Framework | **Astro 7** (7.4.4), static output | It builds plain HTML pages and sends no JavaScript unless asked. Image optimization, self-hosted fonts and a content security policy are built in. If the site ever needs a server, Astro can render pages on demand with its Node adapter, in the same codebase (§9) |
| Language | **TypeScript 6** (6.0.3) | Typed content and components. Astro's checker supports TypeScript 5 and 6, but not 7 yet |
| Runtime | **Node 24 LTS**, on the PC and on GitHub | Astro 7.4 needs Node 22.23.4 or newer, and the PC has 22.23.1. Fedora packages Node 24 (`nodejs24`), but not 26 |
| Styles | Plain CSS with custom properties | The design system is small, so there's no framework to learn or update |
| Content checks | Zod, through `astro/zod`, plus `yaml` for `site.yaml` | Astro already ships Zod, so this adds only one small package |
| Tests | Node's built-in test runner | No test framework to install |

Also considered:

- **Eleventy or Hugo:** simple and static, but they offer no path to server
  features in the same codebase.
- **Next.js:** server-first, ships React to the browser, and has more to
  maintain.
- **A React single-page app, like the old site:** the whole page arrives as
  JavaScript, so it's blank without it and weaker for link previews and search.

Dependencies stay few:

- `astro`, `@astrojs/sitemap` and `yaml`;
- a Fontsource package for the font;
- `sharp` for images, which is Astro's own choice;
- for checking only, `@astrojs/check` and `typescript`.

### 6.2 Repo layout

```
johnjamieson.ca/
├── ARCHITECTURE.md          this file
├── BUILD.md                 the build steps, then the record of what was done
├── CLAUDE.md                rules for Claude sessions
├── README.md                a few lines for visitors on GitHub
├── LICENSE                  code MIT; words and photo all rights reserved (D-15)
├── package.json             scripts: dev, build, preview, check, test, sync
├── astro.config.mjs
├── tsconfig.json
├── content/
│   ├── resume.json          from Career, by npm run sync; never edited here
│   └── site.yaml            the site's own words
├── scripts/
│   ├── sync.ts              copies Career's export after checking it; --check reports drift
│   ├── checks.ts            privacy, internal links and symlinks, on content/ or dist/
│   └── *.test.ts            tests, with made-up data only
├── src/
│   ├── assets/              the photo (metadata stripped)
│   ├── components/          Hero, Figures, WorkCard, CareerPath, …
│   ├── layouts/             Base.astro: head, meta, fonts, header, footer
│   ├── lib/                 the content schema, loading, the facts check, date formats
│   ├── pages/               index, resume, 404 (and projects later)
│   └── styles/              tokens, base, print
├── public/                  robots.txt, icons, the preview image
└── .github/
    ├── workflows/site.yml   check, build, publish to the deploy branch
    └── dependabot.yml       monthly, grouped updates
```

The scripts are TypeScript that Node 24 runs directly (it strips the types
itself), so they need no build step.

### 6.3 Checks

| Check | On the PC | On GitHub | Stops |
|---|---|---|---|
| Types and templates (`astro check`) | `npm run check` | Every push | The build |
| Content contract (`resume.json`, `site.yaml`) | `npm run sync`, every build | Every build | The sync or the build |
| Facts: numbers and bullet references in `site.yaml` | Every build | Every build | The build |
| Privacy: phone, email, address, postal code | `npm run sync`, `npm run check`, every build | Every build | The sync or the build |
| Internal links resolve | Every build | Every build | The build |
| No symlinks and no scripts (D-9) in the built site | Every build | Every build | The build; the server checks symlinks again |
| Tests of the checks themselves | `npm test` | Every push | The deploy |
| This repo's copy matches Career's | `npm run sync -- --check` | Not possible: GitHub can't see Career | Nothing; it only reports |

Test data is made up. No real phone number or address goes into this public
repo, not even as an example of what the check should catch.

### 6.4 Security

- **Nothing to break into.** There's no server code and there are no forms,
  cookies, logins or browser JavaScript. The only secret is GitHub's own
  short-lived token inside the workflow.
- **Content security policy.** Astro writes one into every page
  (`security.csp`), allowing only the site's own styles, fonts and images. The
  small Caddy adds the one rule a page can't set for itself: other sites may
  not frame it.
- **Supply chain:**
  - `package-lock.json` pins exact versions, and the build installs them with
    `npm ci`;
  - GitHub Actions are pinned to commit hashes;
  - Dependabot proposes updates monthly.

  At worst, a bad package could change the built files. The server refuses any
  update containing a symlink (DEC-28), so the worst case is a wrong page,
  which a revert fixes.

## 7. Hosting and deployment

All of this sits on the server's existing design:

- DEC-26: deploy on every push, with the server fetching the result;
- DEC-28: a small Caddy for static sites;
- CON-7: DNS;
- CON-9: the fetch timer.

The names below are proposed (D-13). They get written into the server's
`SPEC.md` with John at BUILD step 18.

### 7.1 Build and publish, on GitHub

One workflow, `.github/workflows/site.yml`:

- **Every push and pull request:** install with `npm ci`, run the checks,
  build.
- **Pushes to `main` only:**
  - check the built pages for privacy, broken links and symlinks;
  - add `build.json`, holding the commit and the build time, so anyone can see
    what's live;
  - force-push the result to the `deploy` branch as a single commit. It keeps
    no history (D-17), because the history that matters is on `main`.
- **Permissions:** the workflow can write to this repo and nothing else, and
  only one deploy runs at a time.

### 7.2 Fetch, on articuno

`johnjamieson-fetch.timer` runs `site-fetch` as `john` two minutes after boot,
then every five minutes (CON-9's exception for light timers). Each run:

1. Asks GitHub for the `deploy` branch's commit (`git ls-remote`). If it's the
   same as last time, it stops. Most runs end here.
2. Fetches that one commit into its own clone in
   `/var/lib/site-fetch/johnjamieson/`.
3. Refuses the update if it contains a symlink (DEC-28) or has no
   `index.html`.
4. Copies it into `/srv/sites/johnjamieson/` with
   `rsync --delete --delay-updates`, so the new files land together and
   removed files go.
5. Records the commit and logs one line.

`site-fetch` takes the site's name, repository and branch, so a later static
site can reuse it with a new pair of units. Copies of the script and the units
live in the server repo's `server/` folder (INV-7). Because `--delete` removes
files, John okays it once for this folder (INV-11). A `hold` file in the state
folder pauses updates in an emergency.

### 7.3 Serving

**The small Caddy** (`static`, DEC-28) is its own container. Nothing is mounted
in it but `/srv/sites`, read-only. It listens on `127.0.0.1:8001`, with one
port per static site. For this site it:

- serves the files;
- sends the 404 page with a 404 status;
- lets browsers cache the hashed files under `/_astro/` for a year;
- has browsers recheck pages on each visit;
- hides dotfiles;
- refuses framing by other sites.

The weekly image update patches it, like every other container.

**The main Caddy** holds the names and certificates, in
`conf/sites/johnjamieson.caddy`:

- before launch, the gated preview at `johnjamieson.articuno.johnjamieson.ca`,
  behind the sign-in page;
- at launch, `johnjamieson.ca` (`import public 127.0.0.1:8001`), plus
  `www.johnjamieson.ca`, which redirects permanently to the same page on
  `johnjamieson.ca`.

Its `(headers)` snippet adds HSTS, `nosniff` and the referrer policy, and
compresses the responses.

### 7.4 Names and DNS

| Name | Today, at Namecheap | After the switch |
|---|---|---|
| `johnjamieson.ca` | `A 75.2.60.5` (Netlify), TTL 30 minutes; no IPv6 | `ALIAS → articuno.johnjamieson.ca` (D-14) |
| `www.johnjamieson.ca` | `A 75.2.60.5` (Netlify) | `CNAME → articuno.johnjamieson.ca` (CON-7) |
| Proton's email records | As they are | Untouched |

There's no CAA record, so Let's Encrypt can issue certificates as usual.

The bare name can't be a CNAME, which is why it gets an ALIAS: Namecheap
answers for it with the target's addresses. Namecheap documents the ALIAS
record, including that it can't share its name with A or AAAA records, but not
whether it answers IPv6 queries. BUILD step 24 checks.

- **If it answers IPv6,** CON-7 stays whole.
- **If it doesn't,** there are two options:
  - accept IPv4 only at the bare name, which is no worse than today (Netlify
    has no IPv6 address here either);
  - replace the ALIAS with `A` and `AAAA` records, as a recorded exception to
    CON-7.

  The recommendation is the second, because the rest of the server is
  reachable over IPv6.

### 7.5 The switch from Netlify

1. The new site runs on the gated preview, and John approves it.
2. At least 30 minutes ahead (the current TTL), the TTL on `@` and `www` drops
   to 5 minutes.
3. At a quiet time, John changes the two records. As soon as Namecheap answers
   with the new ones, the public site file goes in and Caddy fetches the
   certificates. It can't do that any earlier, because Let's Encrypt checks
   that each name points at the server.
4. Visitors whose DNS hasn't caught up yet still reach Netlify, which keeps
   serving the old site, so nobody sees an error.
5. A day or two later, the domain comes off Netlify and the Netlify site is
   deleted. The old `personal-web-page` repo is made private (D-16), since its
   history holds the old résumé claims and the internal system names.

Until the switch, the Netlify site still shows those internal system names.

## 8. When things break

| What | What happens | What to do |
|---|---|---|
| A check fails on GitHub | Nothing deploys and the live site stays as it was. GitHub emails John | Fix it and push again |
| The fetch fails: GitHub is down, or an update had a symlink | The unit fails and the live site stays as it was. The next run tries again | The weekly look (RCP-11) shows it; `journalctl -u johnjamieson-fetch` |
| A bad change goes live | — | `git revert` and push, fixed within about ten minutes. To stop further updates meanwhile, use `hold` |
| articuno is down | The site is down. There are no uptime alerts, by the server's design (DEC-3) | The `deploy` branch is the complete site, so any static host (Netlify, GitHub Pages, Cloudflare Pages) could serve it within the hour once DNS points there |
| articuno is rebuilt | — | Nothing to restore: the server's `server/` copies and this repo's `deploy` branch bring it all back |

The site is robust because nothing in it can fail in an interesting way. It's
files, built from a repo and served by Caddy.

## 9. Growing it later

None of this is planned yet. Each is a known route, so the first build doesn't
have to anticipate it.

- **Projects.** Add entries to `projects` in Career's `resume.yaml`, and the
  section and `/projects/` page appear.
- **Write-ups.** Career's four paragraphs already open on their cards (BUILD
  step 11a). A longer story per job (`writeup`) could get its own page, with
  Markdown rendering added at that point.
- **Notes.** Short articles in the site's own repo, written in generic terms:
  for example, how to rebuild history from audit logs with SQL. They're a good
  way to show depth, and a natural fit for Astro's content collections.
- **Apps and demos.** Each one is its own project on articuno with its own
  name: public at `<name>.johnjamieson.ca` (a CNAME, CON-7), or private under
  `*.articuno.johnjamieson.ca`. The site links to them, and a broken app can't
  take the site down (D-5).
- **A server feature on the site itself,** such as a form or live data. Astro
  can render those pages on demand with its Node adapter. The site would then
  become a container app, deployed by the server's RCP-3 and RCP-8 instead of
  the fetch. It's a bigger step, but not a rewrite.
- **Visitor counts.** If wanted, a privacy-friendly counter could run on
  articuno as an app, or Caddy's logs could be read. Either needs a decision
  about cookies and notices first.

## 10. Decisions

| ID | Decision | Why | Status |
|---|---|---|---|
| D-1 | Facts come only from Career's `Public Export/resume.json`, copied into `content/`. Nothing else leaves Career, and the copy is never edited here | One source, so the résumé, LinkedIn and the site can't disagree | [D] John, 2026-10-31 |
| D-2 | The site has words of its own, in `content/site.yaml`. They add no facts, numbers are checked against `resume.json`, and selected work quotes its bullet | "Use the medium to its fullest", without breaking the match | [D] John, 2026-11-01 |
| D-3 | No phone number, email, address or résumé PDF. The city, LinkedIn and GitHub are shown | John's privacy; LinkedIn is the way in | [D] John, 2026-10-31 |
| D-4 | The main address is `https://johnjamieson.ca`, and `www` redirects to it permanently | Both work; one address for search engines | [D] John, 2026-11-01 |
| D-5 | The site stays static and simple. Apps and demos live beside it on their own names, linked from it | A broken app can't take the front door down | [D] John, 2026-11-01 |
| D-6 | New repo `John-C-Jamieson/johnjamieson.ca`, starting with fresh history. The folder was renamed to match on 2026-10-31 | A clean start, without the old claims in its history | [D] John, 2026-10-31 |
| D-7 | Deployment follows the server's DEC-26 and DEC-28: GitHub builds, the server fetches, and a small Caddy serves | Already decided for the server | [D] John, 2026-10-31 |
| D-8 | Astro 7 with static output, TypeScript 6, Node 24 LTS on the PC and on GitHub, plain CSS | §6.1 | [D] John, 2026-11-01 |
| D-9 | No JavaScript in the browser, no cookies, no analytics and no third-party requests. Fonts and images come from the site | Fast, private, nothing to attack (§5.5) | [D] John, 2026-11-01 |
| D-10 | A strict content contract: an unknown or missing field in `resume.json` stops the sync and the build | Changes in Career are shown on purpose, never dropped silently | [D] John, 2026-11-01 |
| D-11 | The checks in §6.3 run on the PC and on GitHub, and a failure stops the deploy | Goal 1, enforced by machine where possible | [D] John, 2026-11-01 |
| D-12 | Career's `make resume` reports whether the website's copy is current. It's a small, read-only change to Career's build | Drift shows up where and when the résumé changes | [D] John, 2026-11-01 |
| D-13 | Server names: the small Caddy is the app `static`, on `127.0.0.1:8001`, with one port per static site. The site's name is `johnjamieson`, its preview is `johnjamieson.articuno.johnjamieson.ca`, and the fetch is `site-fetch` with `johnjamieson-fetch.{service,timer}` and a `hold` file. All of this goes into the server's SPEC at BUILD step 18 | Follows CON-1 and CON-2; `site-fetch` can serve later static sites too | [D] John, 2026-11-01 |
| D-14 | The bare domain gets an `ALIAS` if Namecheap answers IPv6 for it. If not, it gets `A` and `AAAA` records, as a recorded exception to CON-7 | Keeps IPv6, which the rest of the server has (§7.4) | [D] John, 2026-11-01 |
| D-15 | Licence: the code is MIT; the words and photo are all rights reserved | Others can learn from the code without reusing John's résumé or face | [D] John, 2026-11-01 |
| D-16 | At launch, the old `personal-web-page` repo is made private, not just archived | Its history holds the old claims and the internal system names | [D] John, 2026-11-01 |
| D-17 | The `deploy` branch is one force-pushed commit. A rollback is a revert on `main` | Keeps the repo small; `main` has the history | [D] John, 2026-11-01 |

## 11. Open questions

For John. Each gets settled at the BUILD step named:

- the [P] decisions in §10 (step 1);
- the look (step 9) and the words (step 10);
- whether the ALIAS answers IPv6, and what to do if it doesn't (step 24).

## Sources

- Namecheap, [How to create an ALIAS record](https://www.namecheap.com/support/knowledgebase/article.aspx/10128/2237/how-to-create-an-alias-record).
  It describes ALIAS at the bare domain and says it can't share a host with A
  or AAAA records. It doesn't say whether it answers IPv6 queries.
- Versions were read from the npm registry, nodejs.org, GitHub and Fedora's
  repositories on 2026-11-01. DNS was read from Namecheap's name servers the
  same day.
