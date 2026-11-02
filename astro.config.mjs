// @ts-check
// johnjamieson.ca: the design is in ARCHITECTURE.md.
import { readFileSync } from "node:fs";
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// The old site had a /projects page (2025–2026), and old résumés may link to
// it. Until the résumé lists projects, that address leads home; once it
// does, a real page takes over and this redirect drops out by itself.
const { projects } = JSON.parse(readFileSync("content/resume.json", "utf8"));
const redirects = projects.length === 0 ? { "/projects": "/" } : {};

export default defineConfig({
  site: "https://johnjamieson.ca",
  // Pages build as folders (/resume/index.html), so links end in a slash.
  trailingSlash: "always",
  redirects,
  // Redirect pages and the 404 page stay out of the sitemap
  integrations: [sitemap({ filter: (page) => !page.includes("/projects/") && !page.includes("/404") })],
  // No code blocks on the site. Shiki's inline styles would break the CSP.
  markdown: { syntaxHighlight: false },

  // Inter, from the npm package rather than a font CDN, so a build never
  // depends on one and visitors fetch the files from this site (D-9). The
  // local provider points at the package's file: Astro 7.4's npm provider
  // hands its fetcher file:// URLs, which Node's fetch can't open.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Inter",
      cssVariable: "--font-sans",
      options: {
        variants: [
          {
            src: ["./node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
    },
  ],

  // A content security policy in every page. Astro adds script-src and
  // style-src with hashes; framing is refused by the server (ARCHITECTURE §6.4).
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
});
