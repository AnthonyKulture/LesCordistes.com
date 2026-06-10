# Sitemap Audit — lescordistes.com
**Date:** 2026-05-04
**Score: 82/100**

---

## URL Distribution (405 total)

| Type | Count | Expected | Status |
|------|-------|----------|--------|
| Homepage | 1 | 1 | PASS |
| Institutional | 14 | ~13 | WARN (+1 see below) |
| Persona pages (copropriete, vs-echafaudage) | 2 | 2 | PASS |
| City hub pages (/cordiste-[ville]) | 60 | 60 | PASS |
| City x service pages | 301 | ~301 | PASS |
| Lexique terms | 13 | 13 | PASS |
| Blog posts | 11 | 10+ | PASS |
| Blog index | 1 | 1 | PASS |
| Auteur pages | 2 | 0 | WARN |
| **Total** | **405** | ~398 | **+7** |

---

## Checks

### XML Syntax — PASS
- `xmllint --noout` returns clean: no syntax errors.
- Encoding: UTF-8. Namespace: `http://www.sitemaps.org/schemas/sitemap/0.9`. Correct.

### URL Count — PASS (minor overcount)
- 405 URLs vs expected 398. Delta of +7 explained by 2 auteur pages and the 3 bare city hubs with no service pages (colmar, chartres, cherbourg) which inflate the count without coverage depth.

### Canonical Domain (www) — PASS
- All 405 `<loc>` entries use `https://www.lescordistes.com`. Zero non-www URLs detected.

### `changefreq` / `priority` — PASS (clean)
- Neither tag is present in the sitemap. Correct — both are ignored by Google.

### `lastmod` — PASS with low-severity warning
- 7 distinct dates present (2026-04-12 through 2026-05-04). Not all identical.
- Format: `2026-05-02T00:00:00.000Z` — valid ISO 8601 but time component is always midnight UTC, suggesting programmatic assignment rather than true file modification time.
- The majority of URLs (institutional, city hubs) share a single date (2026-05-02) which is a build-stamp, not a real edit date. Google may learn to ignore these over time.

### HTTP Status (10-sample) — PASS
| URL | Status |
|-----|--------|
| / | 200 |
| /faq | 200 |
| /cordiste-copropriete | 200 |
| /cordiste-vs-echafaudage | 200 |
| /cordiste-paris/nettoyage-facade | 200 |
| /cordiste-monaco/confortement-falaises | 200 |
| /cordiste-mulhouse/ravalement-facade | 200 |
| /lexique/irata | 200 |
| /blog/cordiste-vs-nacelle-vs-echafaudage | 200 |
| /auteur/anthony-profit | 200 |

No 404s or redirects detected in sample.

### Noindex Consistency — PASS
All 5 sampled city x service pages in the sitemap return `name="robots" content="index, follow"`. The anti-doorway strategy is consistent: sitemap only lists pages with unique context, and those pages carry `index, follow`. No sitemap/robots contradiction detected.

### robots.txt Consistency — PASS
- `Sitemap: https://www.lescordistes.com/sitemap.xml` — correct www canonical.
- All disallowed paths (/dashboard/, /admin/, /profile/, /api/, etc.) are app-gated routes not present in the sitemap.

### Missing Pages — PASS
- `/faq`, `/cordiste-copropriete`, `/cordiste-vs-echafaudage` — all three recent pages are present in the sitemap with 200 OK. No missing high-value pages detected.

---

## Issues by Severity

### Medium — Auteur pages in sitemap (2 URLs)
`/auteur/anthony-profit` and `/auteur/benjamin-de-oliveira` are indexed (`robots: index, follow`) and present in the sitemap. Author pages typically have thin content (a bio + list of posts). Unless these pages have substantial unique bios and authority signals, they dilute crawl budget with low-value pages. Recommend either: (a) enrich with 300+ word author bios + expertise signals and keep, or (b) add `noindex` and remove from sitemap.

### Medium — Legal/utility pages in sitemap (4 URLs)
`/mentions-legales`, `/cgu`, `/cgv`, `/confidentialite` are in the sitemap. These pages have zero search intent — they will never rank for anything and are legally required but SEO-irrelevant. They consume crawl budget. Recommend removing from sitemap (keep pages accessible, not indexable).

### Low — 3 bare city hub pages with zero service coverage
`/cordiste-colmar`, `/cordiste-chartres`, `/cordiste-cherbourg` appear as city hubs in the sitemap but have zero associated service pages (no unique context written). They are indexable city hub pages without supporting depth. Either write at least one unique service context per city to justify hub presence, or keep as-is (city hub alone has standalone value if the page itself has unique content).

### Low — `lastmod` is build-stamp, not edit date
The timestamp `T00:00:00.000Z` on all non-blog pages indicates a programmatic build date, not actual content modification. Googlebot learns to discount these. Consider propagating real `git` commit dates or content update dates for the pages that genuinely changed.

### Info — Inscription/conversion pages in sitemap
`/inscription`, `/inscription-cordiste`, `/inscription-client`, `/post-job` are in the sitemap with `index, follow`. These are thin conversion pages with minimal unique content. They will not harm rankings but offer no ranking benefit. Optional: remove to focus crawl budget on content pages.

---

## Sitemap vs robots.txt vs Meta Consistency

| Layer | Value | Consistent |
|-------|-------|------------|
| robots.txt Sitemap directive | `https://www.lescordistes.com/sitemap.xml` | YES |
| All `<loc>` canonical prefix | `https://www.lescordistes.com` | YES |
| Disallowed paths in robots.txt | None overlap with sitemap URLs | YES |
| Sitemap pages with `noindex` meta | 0 (all sampled: `index, follow`) | YES |
| Anti-doorway filter (hasUniqueServiceCityContext) | Active — only 301/1380 city×service in sitemap | YES |

---

## Quality Gate Assessment

- City pages: 60 cities in sitemap. Threshold warning at 30+ cities applies (60%+ unique content per page). City hub pages appear to have unique content (they are the aggregator pages). WARN: verify each city hub has city-specific content beyond a generic template.
- City x service: 301 pages — all gated by `hasUniqueServiceCityContext`. Strategy is sound.
- No hard-stop triggered (threshold applies to location pages with only city swapped, not gated pages).

---

## Score Breakdown

| Category | Weight | Score |
|----------|--------|-------|
| XML validity | 15 | 15/15 |
| Canonical www consistency | 15 | 15/15 |
| HTTP status (no 404/redirect) | 15 | 15/15 |
| Noindex/sitemap consistency | 15 | 15/15 |
| robots.txt consistency | 10 | 10/10 |
| lastmod quality | 10 | 6/10 |
| URL hygiene (no deprecated tags) | 10 | 10/10 |
| Crawl budget efficiency | 10 | 6/10 |
| **Total** | **100** | **82/100** |
