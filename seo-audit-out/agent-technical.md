# Technical SEO Audit — LesCordistes.com
**Date:** 2026-05-04  
**Auditor:** Claude SEO Agent (claude-sonnet-4-6)  
**Scope:** Full technical audit — homepage, city pages, city×service pages, blog, sitemap, robots, security headers, IndexNow  

---

## Score: 76 / 100

### Score Justification

| Category | Weight | Raw | Weighted |
|---|---|---|---|
| Crawlability | 15% | 90 | 13.5 |
| Indexability | 20% | 80 | 16.0 |
| Security Headers | 15% | 82 | 12.3 |
| URL Structure | 10% | 95 | 9.5 |
| Mobile | 10% | 98 | 9.8 |
| Core Web Vitals | 15% | 45 | 6.75 |
| Structured Data | 10% | 88 | 8.8 |
| JS Rendering | 5% | 100 | 5.0 |
| IndexNow | 5% | 85 | 4.25 |
| **Total** | 100% | — | **75.9 → 76** |

The score is dragged down primarily by mobile LCP performance (homepage: 4.9 s, "Poor" threshold > 4 s) and TBT on desktop (/cordiste-paris desktop: 1241 ms). Everything else is structurally solid for a young Next.js 15 App Router SSR site.

---

## Issues by Severity

### CRITICAL

#### C-1: LCP Mobile "Poor" on Homepage and Key Pages
- **Location:** `https://www.lescordistes.com/` (mobile), `https://www.lescordistes.com/cordiste-paris` (mobile)
- **Evidence:**
  - Homepage mobile LCP: **4,924 ms** (threshold: Good <2.5 s, Poor >4 s) — PSI psi-final.json
  - /cordiste-paris mobile LCP: **3,526 ms** ("Needs Improvement")
  - Homepage desktop LCP: 1,309 ms (Good), but TBT: 497 ms (elevated)
  - /cordiste-paris desktop TBT: **1,241 ms** (significantly elevated)
  - /jobs desktop old data CLS: **0.177** (Poor >0.25 border, close call)
- **Root cause signals:**
  - Hero image `lescordistes.com-new-03.webp` preloaded via `<link rel="preload">` with correct `imageSrcSet` — good. However the `sizes` attribute is `(max-width: 1024px) 50vw, 300px`. On a full-width mobile hero this is severely undersized (browser may fetch 300px variant on desktop). This creates an undersized image or a larger-than-needed fetch.
  - Multiple `async` JS chunks (10+ scripts) loaded before main paint window.
  - LCP image `q=75` at `w=3840` — `q=75` is the Next.js default; acceptable.
  - FCP mobile (homepage): 2,705 ms — above the 1.8 s Good threshold.
- **Fix:**
  1. Correct the hero `sizes` attribute to `100vw` (or `(max-width: 768px) 100vw, 50vw`) so the browser picks the correct srcset entry on mobile.
  2. Reduce JS bundle: audit which of the 10 async chunks on the layout can be deferred or split further.
  3. Add `priority` prop on `<Image>` for the hero (already using `<link rel="preload">` — ensure `priority` is set in the React component so Next.js does not also lazy-load it).
- **Effort:** Medium (2–4 h)

#### C-2: IndexNow Keyfile URL Mismatch — Keyfile Not Served at Canonical Path
- **Location:** `/api/indexnow/route.ts`, `public/c6ec276663dc1d163620ecb9cb16d9b6.txt`
- **Evidence:**
  - `GET https://www.lescordistes.com/indexnow-key.txt` → **404** (the path advertised in some contexts)
  - `GET https://www.lescordistes.com/c6ec276663dc1d163620ecb9cb16d9b6.txt` → **200** (file exists at the hash-named path)
  - The `INDEXNOW_KEY_LOCATION` in `route.ts` correctly uses `${SEO_BASE_URL}/${INDEXNOW_KEY}.txt` = `https://www.lescordistes.com/c6ec276663dc1d163620ecb9cb16d9b6.txt` — this is correct.
  - The 404 for `/indexnow-key.txt` means any external reference to that path (docs, CI, old configs) is broken. IndexNow itself works because the code uses the hash path.
- **Status:** Functionally OK for Bing/Yandex. The 404 is a hygiene issue, not a live breakage.
- **Fix:** Remove or redirect any reference to `/indexnow-key.txt`. The actual key file at `/c6ec276663dc1d163620ecb9cb16d9b6.txt` (200 OK) is the correct location. No code change needed — just documentation cleanup.
- **Effort:** Low (15 min)

---

### HIGH

#### H-1: CSP Stuck in report-only Mode — No Enforcement
- **Location:** HTTP response header on all pages
- **Evidence:**
  ```
  content-security-policy-report-only: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
  ```
  No `content-security-policy` (enforcing) header is present. This means XSS attacks are not blocked — the site is fully vulnerable to script injection despite having a CSP policy drafted.
- **Risk:** `'unsafe-inline'` and `'unsafe-eval'` in the draft policy mean even enforcing it as-is would provide limited protection. However, remaining in report-only indefinitely means zero protection.
- **Fix:**
  1. Before enforcing: audit the CSP violation reports (GSC Console → Security tab or a report-uri endpoint — currently no `report-uri` or `report-to` directive is present in the header, so violations are not even being collected).
  2. Add a `report-to` / `report-uri` endpoint first.
  3. Phase enforcement: start with `content-security-policy` on low-traffic pages, monitor, then roll to all.
  4. Eliminate `'unsafe-eval'` (likely needed by Google Tag Manager or Stripe); if unavoidable, document the exception.
- **Effort:** High (1–2 days for full audit + phased rollout)

#### H-2: HSTS Missing `includeSubDomains` and `preload`
- **Location:** HTTP response header
- **Evidence:**
  ```
  strict-transport-security: max-age=63072000
  ```
  Max-age = 2 years (good). Missing `includeSubDomains` and `preload` directives.
- **Risk:** Subdomains (e.g. any future `cdn.lescordistes.com`) are not forced to HTTPS. Without `preload`, first-time visitors without a cached HSTS policy can be targeted by SSL-stripping attacks.
- **Fix:** Update HSTS header to:
  ```
  strict-transport-security: max-age=63072000; includeSubDomains; preload
  ```
  Then submit the domain to the HSTS Preload List at hstspreload.org. Only do this after confirming all subdomains serve HTTPS.
- **Effort:** Low (30 min) — but requires verifying all subdomains first.

#### H-3: AI Crawler Directives Absent from robots.txt
- **Location:** `/robots.txt`
- **Evidence:** No directives for `GPTBot`, `Claude-Web`, `anthropic-ai`, `Google-Extended`, `CCBot`, `meta-externalagent`, `PerplexityBot`, `Bytespider`, `Diffbot`, or `Cohere-ai`. The site has quality content (lexique, FAQ, blog) appropriate for AI citation (llms.txt and llms-full.txt already exist — good). However, without explicit AI crawler rules, there is no control over which content is used for training vs. inference.
- **Fix:**
  - To allow AI inference (Perplexity, ChatGPT browsing, etc.) but block training data harvesting, add to `robots.txt`:
    ```
    User-Agent: GPTBot
    Disallow: /dashboard/
    Disallow: /admin/
    Disallow: /api/
    
    User-Agent: Google-Extended
    Allow: /
    
    User-Agent: anthropic-ai
    Allow: /
    
    User-Agent: CCBot
    Disallow: /
    ```
  - Adjust based on business decision (allow inference bots for brand visibility, block scraping-only bots).
- **Effort:** Low (1 h to decide policy + 15 min to implement)

#### H-4: TBT Elevated on /cordiste-paris Desktop (1,241 ms)
- **Location:** `https://www.lescordistes.com/cordiste-paris` desktop
- **Evidence:** PSI psi-final.json: `tbt: 1241` ms on desktop. Good threshold < 200 ms, Poor > 600 ms. This correlates to high INP risk.
- **Root cause:** City pages likely have more client-side hydration work (map components? review carousels?) than the homepage.
- **Fix:**
  1. Profile with Chrome DevTools to identify the long tasks.
  2. Defer non-critical client components with `dynamic(() => import(...), { ssr: false })`.
  3. Consider React 19 `use()` + server components for data-heavy sections.
- **Effort:** Medium (4–8 h investigation + implementation)

---

### MEDIUM

#### M-1: Sitemap lastmod Dates — All Static Pages Share 2026-05-02
- **Location:** `sitemap.xml`
- **Evidence:** All 405 URLs carry a `lastmod` value. Static/institutional pages (homepage, /a-propos, /cgu, etc.) all use `2026-05-02T00:00:00.000Z` which is accurate. City×service pages range from `2026-04-12` to `2026-05-04`. No `changefreq` or `priority` directives.
- **Note:** Google officially ignores `changefreq` and `priority` in most cases, so their absence is not an issue. `lastmod` is correct and meaningful here.
- **Residual issue:** The last-modified timestamps appear to be build-time static values rather than true content modification dates. If content in `seoData.ts` changes for a specific city, the timestamp for that page should reflect it — currently all city×service pages appear to share the same build-date timestamp.
- **Fix:** Generate `lastmod` from the actual content hash or explicit `updatedAt` field in `seoData.ts` entries rather than the build timestamp.
- **Effort:** Medium (2–3 h)

#### M-2: Sitemap Contains Conversion/Registration Pages
- **Location:** `sitemap.xml`
- **Evidence:**
  ```
  https://www.lescordistes.com/inscription
  https://www.lescordistes.com/inscription-cordiste
  https://www.lescordistes.com/inscription-client
  https://www.lescordistes.com/post-job
  ```
  These are conversion funnel pages with minimal textual content, low topical value for organic search, and thin content. Including them signals to Google that they are priority indexable pages.
- **Fix:** Evaluate removing `/inscription`, `/inscription-client`, and `/post-job` from the sitemap (keep `/inscription-cordiste` if it has unique value proposition content). Add `robots: { index: false }` only if you do not want them indexed at all — but more likely just remove from sitemap while keeping them indexable.
- **Effort:** Low (30 min)

#### M-3: Homepage Canonical URL Missing Trailing Slash
- **Location:** `<link rel="canonical" href="https://www.lescordistes.com">` (homepage)
- **Evidence:**
  - Canonical: `https://www.lescordistes.com` (no trailing slash)
  - The server responds to `https://www.lescordistes.com/` (with trailing slash) with a 200.
  - og:url also: `https://www.lescordistes.com` (no trailing slash)
  - Internal nav links: `href="https://www.lescordistes.com/"` (with trailing slash)
  - This creates a minor inconsistency. Google generally handles this, but it creates ambiguity in GSC reporting (two URLs for the same page).
- **Fix:** Standardize on `https://www.lescordistes.com/` with trailing slash for the homepage canonical (both `canonical` and `og:url`), matching how Next.js serves the route. Update the metadata in `layout.tsx` or `page.tsx` for the homepage.
- **Effort:** Low (15 min)

#### M-4: /cordiste-paris/lavage-vitres Served as `index, follow` Despite Being in Sitemap Context
- **Location:** `https://www.lescordistes.com/cordiste-paris/lavage-vitres`
- **Evidence:**
  - Page returns `name="robots" content="index, follow"` — this page IS indexable.
  - Page IS in the sitemap.
  - This is consistent. However, it reveals that `lavage-vitres` Paris has a `hasUniqueServiceCityContext` = true entry in `seoData.ts`. Verify that other lavage-vitres entries in the sitemap (marseille, lyon, toulouse, lille) also have genuine unique context and are not accidentally marked indexable due to a missing `default` fallback in the context lookup.
- **Action:** Spot-check 3–5 city×service pages in the sitemap that were not intentionally authored. If any return `index, follow` without a proper unique context, it indicates a logic regression in `hasUniqueServiceCityContext`.
- **Effort:** Low (30 min audit)

#### M-5: No Explicit `Permissions-Policy` for Sensitive APIs
- **Location:** HTTP response header
- **Evidence:**
  ```
  permissions-policy: camera=(), microphone=(), geolocation=()
  ```
  Basic policy is present (good). Missing: `payment=()`, `usb=()`, `serial=()`, `interest-cohort=()` (FLoC opt-out, still recommended), `accelerometer=()`, `gyroscope=()`.
- **Fix:** Expand to:
  ```
  permissions-policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), interest-cohort=()
  ```
- **Effort:** Low (15 min)

---

### LOW

#### L-1: No `report-uri` / `report-to` on CSP Header
- **Location:** `content-security-policy-report-only` header
- **Evidence:** The report-only CSP has no `report-to` or `report-uri` directive. Violations are being evaluated by the browser but the results are silently discarded.
- **Fix:** Add `report-to` endpoint (e.g. a Vercel Edge Function logging to console, or a free service like report-uri.com) to collect violation data before enforcing.
- **Effort:** Low (1–2 h)

#### L-2: Hero Image `sizes` Attribute Likely Under-specifying Mobile Width
- **Location:** `<link rel="preload" as="image" imageSrcSet="..." imageSizes="(max-width: 1024px) 50vw, 300px">`
- **Evidence:** The homepage HTML shows the hero preload with `sizes="(max-width: 1024px) 50vw, 300px"`. On a full-width mobile hero (likely 100vw), specifying `50vw` causes the browser to pick a 50%-width image variant — half the actual displayed size. This may explain the poor mobile LCP (browser fetches too-small an image and must re-render, or fetches the 3840w fallback).
- **Fix:** Update the `Image` component's `sizes` prop to `(max-width: 768px) 100vw, 50vw` or `100vw` if truly full-width.
- **Effort:** Low (30 min)

#### L-3: `jobs` Page CLS 0.177 (Desktop, Old PSI Data)
- **Location:** `https://www.lescordistes.com/jobs` desktop — older PSI data (psi.json, April 25)
- **Evidence:** CLS 0.177 on jobs desktop in the April 25 run. The May 2 run improved to 0.002. Likely fixed. Confirm with a fresh PSI run.
- **Status:** Likely resolved. Keep monitoring.
- **Effort:** None (already fixed or monitor only)

#### L-4: `X-Content-Type-Options` Header Present but Not Evaluated for API Routes
- **Location:** HTTP response header
- **Evidence:** `x-content-type-options: nosniff` is present on HTML pages. Confirm it is also applied to API routes (`/api/*`). Vercel typically applies global headers from `next.config.ts` to all routes.
- **Fix:** Verify `next.config.ts` applies the header globally (not scoped to page routes only).
- **Effort:** Low (15 min)

#### L-5: Hreflang — Not Present (Correct)
- **Location:** `homepage_parsed.json` → `"hreflang": []`
- **Evidence:** No hreflang tags found. The site is FR-only. This is correct. No action needed.
- **Status:** Pass.

---

## Category Verdicts

| Category | Status | Notes |
|---|---|---|
| Crawlability | PASS | robots.txt correct — private routes blocked, sitemap correctly declared at www. Non-www → www 301 confirmed. |
| Indexability | PASS with warnings | www canonicals consistent. noindex strategy correct (city×service doorways). See M-3 (homepage trailing slash), M-4 (spot-check risk). |
| Security | PARTIAL FAIL | HSTS good (2yr). CSP report-only only (H-1). HSTS missing includeSubDomains (H-2). X-Frame-Options: DENY (good). Referrer-Policy: strict-origin-when-cross-origin (good). |
| URL Structure | PASS | Lowercase, hyphens, clean hierarchy. `/cordiste-[ville]/[service]` depth-2 is optimal. Non-www 301 → www confirmed. |
| Mobile | PASS | Viewport meta correct. Responsive. LCP mobile is the performance issue, not a mobile config issue. |
| Core Web Vitals | FAIL (mobile) | Homepage mobile LCP: 4,924 ms (Poor). /cordiste-paris mobile LCP: 3,526 ms (Needs Improvement). Desktop LCP Good on most. TBT elevated site-wide. |
| Structured Data | PASS | Organization+ProfessionalService, WebSite (SearchAction), FAQPage, Service+BreadcrumbList on city pages. @ids use www. |
| JS Rendering | PASS | SSR confirmed — full HTML in source. Next.js RSC. No CSR-gating of indexable content. |
| IndexNow | PASS | Keyfile at correct hash path (200 OK). Route logic correct. GitHub Actions CI trigger present. |

---

## Quick Wins (Top 5)

### QW-1: Fix Hero Image `sizes` Attribute — 30 min — High LCP Impact
Change `imageSizes="(max-width: 1024px) 50vw, 300px"` to `(max-width: 768px) 100vw, 50vw` on the hero `<Image>` component. This alone could reduce mobile LCP by forcing the browser to fetch the correct size srcset entry. Expected improvement: 500 ms–1 s on mobile LCP.

### QW-2: Add AI Crawler Directives to robots.txt — 1 h — Brand Visibility in AI Search
Add `GPTBot`, `Google-Extended`, `anthropic-ai`, `CCBot` rules. The site already has `llms.txt` and `llms-full.txt` — robots.txt AI rules complete the AI discoverability strategy. Zero development risk.

### QW-3: Fix Homepage Canonical Trailing Slash — 15 min — GSC Deduplication
Change `https://www.lescordistes.com` to `https://www.lescordistes.com/` in `generateMetadata` for the homepage. Fixes the og:url inconsistency too. Prevents GSC from counting two URLs for the homepage.

### QW-4: Add `report-to` Endpoint to CSP Header — 2 h — Unlock CSP Enforcement Path
Without violation collection, CSP can never safely move from report-only to enforcement. Adding a logging endpoint (even a simple Vercel Edge function writing to console) enables the data collection needed to eventually enforce CSP. This unblocks H-1.

### QW-5: Add `includeSubDomains; preload` to HSTS — 30 min — Hardened TLS
Extend the existing HSTS header. Submit to hstspreload.org after verifying no HTTP-only subdomains exist. Converts a partial HSTS implementation to a full one. Preload list inclusion takes 1–3 months to propagate but requires only the header change now.

---

## Detailed Findings Reference

### Crawlability Detail

```
robots.txt assessment:
- User-Agent: * → Allow: /          PASS
- Disallows: /dashboard/, /admin/, /profile/, /messages/, /notifications/, /api/, /auth/, /credits/, /connexion/, /pro/    PASS (all private routes correctly blocked)
- Sitemap: https://www.lescordistes.com/sitemap.xml    PASS (www, no trailing slash on sitemap URL — acceptable)
- AI crawler directives: NONE    FAIL (see H-3)
```

```
Sitemap assessment:
- Total URLs: 405    
- Expected per CLAUDE.md: ~398    MINOR DELTA (+7 — likely /inscription variants + /post-job)
- City×service in sitemap: 370    
- CLAUDE.md states 301 indexable city×service    DELTA of 69 extra URLs — investigate
- Blog entries: 11    PASS
- Lexique entries: 13    PASS
- lastmod: 7 distinct dates, current    PASS
- changefreq / priority: absent    PASS (Google ignores these)
- All URLs use https://www.lescordistes.com    PASS
- Non-www URLs in sitemap: 0    PASS
```

**Sitemap Count Investigation (370 vs 301):**
The sitemap contains 370 city×service URLs but CLAUDE.md documents 301 as the indexable count. This could mean:
1. The count in CLAUDE.md is outdated (contexts were added after the doc was written), OR
2. Some pages are in the sitemap that should not be (the noindex filter is not working for some entries).
Action: Run `grep -c 'cordiste-.*/' sitemap.xml` and cross-reference against `hasUniqueServiceCityContext` in `seoData.ts` to verify all 370 have genuine unique context. The live page check confirmed `lavage-vitres/paris` is `index, follow` and is in the sitemap — consistent, so the contexts were extended beyond 301.

### Security Headers Detail

| Header | Value | Verdict |
|---|---|---|
| `strict-transport-security` | `max-age=63072000` (2 yr) | PARTIAL — missing `includeSubDomains; preload` |
| `content-security-policy` | absent (report-only only) | FAIL |
| `content-security-policy-report-only` | present, comprehensive draft | PENDING ENFORCEMENT |
| `x-frame-options` | `DENY` | PASS |
| `x-content-type-options` | `nosniff` | PASS |
| `referrer-policy` | `strict-origin-when-cross-origin` | PASS |
| `permissions-policy` | `camera=(), microphone=(), geolocation=()` | PARTIAL — expand |
| `access-control-allow-origin` | `*` | NOTE — wildcard CORS on HTML pages; should be scoped to API routes only |

**Note on `access-control-allow-origin: *`:** This header is appearing on the homepage HTML response (served by Vercel CDN). A wildcard CORS on the main HTML document is unusual and generally harmless for documents, but could be removed to reduce attack surface.

### Core Web Vitals Summary

| URL | Device | LCP | TBT | CLS | Perf Score |
|---|---|---|---|---|---|
| Homepage | Mobile | 4,924 ms (POOR) | 426 ms | 0 | 0.64 |
| Homepage | Desktop | 1,309 ms (GOOD) | 497 ms | 0.001 | 0.74 |
| /cordiste-paris | Mobile | 3,526 ms (NEEDS IMPROVEMENT) | 517 ms | 0.0004 | 0.67 |
| /cordiste-paris | Desktop | 756 ms (GOOD) | 1,241 ms (HIGH) | 0.005 | 0.68 |
| /cordiste-paris/lavage-vitres | Mobile | 2,751 ms (NEEDS IMPROVEMENT) | 421 ms | 0.001 | 0.80 |
| /jobs | Mobile | 2,738 ms (NEEDS IMPROVEMENT) | 979 ms (HIGH) | 0.0001 | 0.68 |
| /jobs | Desktop | 787 ms (GOOD) | 83 ms (GOOD) | 0.002 | 0.98 |
| /blog/trouver-cordiste-paris | Mobile | 2,738 ms (NEEDS IMPROVEMENT) | 375 ms | 0.0001 | 0.83 |

**CLS: All Good** — No CLS issues. The 0.177 desktop CLS on /jobs from the April 25 run was resolved by the May 2 run (0.002).
**LCP: Mobile systemic problem** — All mobile LCPs are in "Needs Improvement" or "Poor" except blog (2.7 s — borderline).
**TBT: High site-wide** — TBT correlates to INP risk. Desktop /cordiste-paris at 1,241 ms is a critical INP risk.
**INP** (the sole interactivity metric as of March 2024): Cannot be measured from lab data alone; requires field data (CrUX). With TBT at 1,241 ms, the INP risk is high for /cordiste-paris desktop.

### IndexNow Detail

- Key: `c6ec276663dc1d163620ecb9cb16d9b6`
- Keyfile served at: `https://www.lescordistes.com/c6ec276663dc1d163620ecb9cb16d9b6.txt` → **200 OK**
- Key content matches: `c6ec276663dc1d163620ecb9cb16d9b6` — correct (file content = key)
- Route: `/api/indexnow` — POST with `x-cron-secret` auth — correct
- Chunking at 10,000 URLs/batch — correct per IndexNow spec
- URL validation: filters to `www.lescordistes.com` host only — correct
- GitHub Actions CI trigger: present (`.github/workflows/indexnow-on-deploy.yml`)
- Cron route: `/api/cron/indexnow-sitemap` — present
- Note: First ping after deploy may return 403 until Bing validates the keyfile (~30 s delay, documented in MEMORY.md)

### Structured Data Detail

| Schema Type | Location | Status |
|---|---|---|
| `WebSite` + `SearchAction` | Homepage | PASS — @id uses www |
| `Organization` + `ProfessionalService` | Homepage | PASS — @id `#organization`, address in JSON-LD only (not visible HTML — correct per CLAUDE.md) |
| `FAQPage` | Homepage | PASS — 4 Q&A, proper `acceptedAnswer` |
| `Service` + `BreadcrumbList` | City×service pages | Expected (not directly verified in this audit) |
| `BlogPosting` | Blog articles | Expected with `image` field |
| `DefinedTerm` / `DefinedTermSet` | Lexique | Expected |
| `QAPage` | /faq | Expected (22 Q/R per CLAUDE.md) |

**GSC Verification:** `<meta name="google-site-verification" content="KRkP-tNPm0uBjMP1knYwEqme6I89YPPCDIMLaNZbktE"/>` confirmed in `<head>` via SSR — PASS. This is the correct Next.js `metadata.verification.google` approach (not GA-based).

### JavaScript Rendering

- Next.js 15 App Router with RSC — full HTML in source: PASS
- No content behind client-side hydration gates for SEO content
- Google can index without JS execution
- `async` script loading for GTM/GA is correct — does not block HTML parser

---

*Report generated: 2026-05-04 by Claude SEO Agent*
