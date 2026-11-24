# FishXCode Docs

[简体中文](README.md) | English

The FishXCode documentation site, live at <https://docs.fishxcode.com>.

Built with Next.js 16, React 19 and Fumadocs 16, available in nine languages, statically exported to `out/`
at build time and deployed on Cloudflare Pages. Search runs on per-language local indexes with no external
search service, and the site also serves AI clients with Markdown page bodies, llms.txt, RSS and a sitemap.

UI components come from the Base UI flavor of Fumadocs UI (`@fumadocs/base-ui`); `radix-ui` is installed
for custom interactive components.

## Requirements

- Node.js 22.12 or newer (CI uses Node.js 24)
- pnpm 12.16.1. The version is pinned by the `packageManager` field in `package.json`, and CI installs
  pnpm from that field

## Development

```bash
pnpm install
pnpm dev
```

The dev server runs at <http://localhost:3000> by default.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm lint` | Run oxlint |
| `pnpm types:check` | Generate Next route types, then type-check with TypeScript (no build) |
| `pnpm build` | Statically export to `out/` |
| `pnpm preview` | Serve `out/` locally with Wrangler, including the same Worker as production (run `pnpm build` first) |
| `pnpm deploy:cf` | Build and publish to the Cloudflare Pages production environment |
| `pnpm indexnow` | List the sitemap URLs that would be submitted to IndexNow; add `-- --submit` to submit (run `pnpm build` first) |

Two things to know about dependencies:

- After changing `packageManager` to upgrade pnpm, run `pnpm install` once so the section at the top of
  `pnpm-lock.yaml` that records pnpm's own version is updated too; otherwise
  `pnpm install --frozen-lockfile` fails in CI.
- `esbuild` and `workerd`, pulled in by `wrangler`, have install scripts and are allowed under `allowBuilds`
  in `pnpm-workspace.yaml`. Register any new dependency with an install script there as well, or
  `pnpm install` fails.

## Project structure

| Path | Contents |
| --- | --- |
| `content/docs/` | Documentation pages (MDX). Simplified Chinese at the top level, other languages in `content/docs/{lang}/` |
| `src/app/` | Routes. `(home)` and `(docs)` are Simplified Chinese; `en/`, `fr/` and the other folders are thin per-language shells |
| `src/components/` | Shared page and layout implementations (`localized-*.tsx`); the per-language shells only pass in the language |
| `src/lib/` | Site config, i18n, content loading, search indexes, and generation of RSS, llms files and share images |
| `public/_worker.js` | The Cloudflare Pages edge Worker: pricing API proxy, redirects and Markdown content negotiation |
| `public/_routes.json` | Declares which paths go through the Worker and which are served as static assets |

## Writing docs

Create an `.mdx` file under `content/docs/`; the file path is the page URL, so `content/docs/quickstart.mdx`
maps to `/quickstart`. Put `title` and `description` in the front matter; the description is used in
search results, share images and SEO metadata. See the [Fumadocs Markdown guide](https://fumadocs.dev/docs/next/markdown)
for syntax and the [page conventions](https://fumadocs.dev/docs/next/page-conventions) for ordering and grouping.

- Write internal links as absolute site paths, with the language prefix in other languages, e.g. `/en/quickstart`
  in an English page.
- Do not put an `index.mdx` at the root of `content/docs/`: its URL is `/`, which collides with the home page.
- When a title is long, set a short sidebar label with `navTitle`, e.g. title "Use FishXCode in Cursor" with
  `navTitle: Cursor`. The `meta.json` in each language folder defines sidebar groups and order.
- Use `<Callout type="idea|info|warn|error" title="…">` for callouts and
  `<Accordions type="single"><Accordion title="…">` for collapsible blocks. Write per-platform commands as
  adjacent code blocks with `tab="label"` (e.g. ```` ```bash tab="macOS" ````) and they are grouped into tabs.
- `<ModelCatalog />` is the live model catalog, backed by the main site's pricing API.

## Languages

| Language | Code | URL prefix |
| --- | --- | --- |
| 简体中文 (default) | `zh` | none |
| English | `en` | `/en` |
| Français | `fr` | `/fr` |
| Español | `es` | `/es` |
| Português (Brasil) | `pt` | `/pt` |
| Русский | `ru` | `/ru` |
| 日本語 | `ja` | `/ja` |
| Tiếng Việt | `vi` | `/vi` |
| 繁體中文 | `zh-TW` | `/zh-TW` |

- All nine languages have full content. Chinese is the source; translations live in `content/docs/{lang}/`
  at the same relative paths as the Chinese pages. When a Chinese page changes, update its translations.
- If a language is missing a page, that page falls back to the Chinese body, its canonical URL points to the
  Chinese version, and it is left out of that language's sitemap, RSS, llms.txt and hreflang.
- Visiting the site root redirects to the browser's language; once a user picks a language manually, that
  choice wins.
- The full steps for adding a language are in the comment at the top of `src/lib/i18n.ts`. The language list
  in `public/_worker.js` is not covered by type checking and is the easiest one to miss.

## Search

Search runs entirely in the browser. The build generates one index per language (`/static.json/zh`,
`/static.json/en` and so on), and each page loads only its own language's index. Indexes are split by
language because a single file on Cloudflare Pages cannot exceed 25 MiB. Indexing and querying share the
tokenizer in `src/lib/cjk-tokenizer.ts`, so both sides stay consistent when the tokenizing rules change.

## Entry points for AI clients

| URL | Contents |
| --- | --- |
| `/llms.txt`, `/{lang}/llms.txt` | The documentation index for that language; `/.well-known/llms.txt` matches `/llms.txt` |
| `/llms-full.txt`, `/{lang}/llms-full.txt` | The full Markdown body of every page in that language |
| A page URL plus `.md`, e.g. `/start.md` | That page's Markdown body |
| A page URL requested with `Accept: text/markdown` | The same, via content negotiation; the home page supports it too |
| `/rss.xml`, `/{lang}/rss.xml` | Update feeds |
| `/sitemap.xml`, `/robots.txt`, `/ai.txt` | Sitemap and crawling policy |

Markdown content negotiation has two implementations, and **both must change together**: production uses
`public/_worker.js` (running at the Cloudflare edge) and local development uses `src/proxy.ts`. They differ in
one known way: when the requested page has no Markdown copy (for example, an untranslated page), production
falls back to the Chinese copy or the original page, while local development returns 404.

## Deployment

Production is the Cloudflare Pages project `fishxcode-docs`, production branch `main`, with the custom domain
`docs.fishxcode.com`.

### First-time setup

1. Create the Pages project. By default wrangler 4 hands new projects over to Workers, which fails for this
   project, so add `--force` to create it as a Pages project directly (needed only when creating it):

   ```bash
   pnpm exec wrangler pages project create fishxcode-docs --production-branch main --force
   ```

2. In the Cloudflare dashboard, open Workers & Pages → `fishxcode-docs` → Custom domains → Set up a domain and
   add `docs.fishxcode.com`. When the domain is on Cloudflare, the DNS record is created automatically;
   otherwise add a CNAME at your DNS provider pointing `docs` to `fishxcode-docs.pages.dev`. Add the domain in
   the dashboard first: a CNAME alone, without associating the domain in the dashboard, results in a 522 error.
3. In the GitHub repository, go to Settings → Secrets and variables → Actions and add two secrets:
   - `CLOUDFLARE_API_TOKEN`: with the Account → Cloudflare Pages → Edit permission
   - `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID

### Publishing

- **Automatic**: pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes, then
  smoke-tests the deployment: the home page returns HTML, and returns Markdown when requested with
  `Accept: text/markdown`. The check targets the deployment's own `pages.dev` URL, so it fails if Cloudflare
  Access protects preview deployments.
- **Manual**: run `pnpm deploy:cf` locally. Run `pnpm exec wrangler login` first, or set the two environment
  variables named above.

The site URL is `siteConfig.url` in `src/lib/site.ts`; canonical URLs, the sitemap, RSS, llms.txt and share
images are all built from it. To move the whole site to another domain, change it there or set
`NEXT_PUBLIC_SITE_URL` (the full URL, without a trailing slash) at build time.

`public/_worker.js` and `public/_routes.json` are copied into `out/` with the static files and must be
included when publishing. Paths listed under `exclude` in `_routes.json` skip the Worker and are served as
static assets.

## CI

`.github/workflows/ci.yml` runs lint and type checking on pushes to `main` and on pull requests; pull requests
also get a full build to catch issues that only static export reveals. The deployment workflow is independent
of CI, and publishing does not wait for CI results.

## Maintenance notes

- Page update dates come from the git history, so the deployment workflow uses a full clone
  (`fetch-depth: 0`); with a shallow clone, pages lose their update dates.
- `dir` in `defineDocs` in `src/lib/source.ts` must be a string literal. After changing the `postprocess`
  options in the same place, restart `pnpm dev`, or the Markdown body endpoint returns 500.
- `next start` does not work in static export mode; use `pnpm preview` to check a build locally.
