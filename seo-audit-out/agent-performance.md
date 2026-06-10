# Performance Audit — lescordistes.com

**Date:** 2026-05-04
**Method:** Lab analysis (HTML + HTTP headers + curl timings). PSI quota exhausted, CrUX has no field data (insufficient Chrome traffic).
**Score: 78 / 100**

## Lab measurements (curl over Vercel edge cache HIT)

| URL | TTFB | Total | HTML size | HTTP |
|---|---|---|---|---|
| `/` | 78 ms | 94 ms | 143 KB | h2 |
| `/cordiste-paris` | 73 ms | 84 ms | 105 KB | h2 |
| `/cordiste-paris/nettoyage-facade` | 66 ms | 82 ms | 73 KB | h2 |
| `/blog` | 72 ms | 87 ms | 128 KB | h2 |
| `/faq` | 71 ms | 91 ms | 202 KB | h2 |

**TTFB is excellent on every page — under 90 ms across the board, served from Vercel edge cache (HIT, age 705 s).**

## Strong points

- **HTTP/2 everywhere**, Brotli/gzip handled by Vercel
- **Hero image preloaded** with full responsive `srcset` + `imageSizes` on homepage
- **Variable font preloaded** as `font/woff2`, crossorigin, single weight set
- **All JS chunks marked `async`** — no render-blocking JS in the head
- **Webpack runtime preloaded** with `fetchPriority="low"` (next-gen optimization)
- **Only 2 CSS files** in the head (`7e7d96b1` + `1931dfef`), `data-precedence="next"` for proper streaming
- **No third-party scripts in initial HTML** — PostHog, GA4, Vercel Analytics, Stripe.js are lazy-injected post-hydration (verified: zero external `<script src>` in static HTML)
- **HTTP cache headers strong:** `cache-control: public, max-age=0, must-revalidate` on HTML (correct for ISR), `x-vercel-cache: HIT` indicates edge caching active
- **HSTS 2 years**, `x-frame-options: DENY`, no exposed `server` version

## Estimated Core Web Vitals (lab heuristics — no field data)

| Metric | Estimate | Justification |
|---|---|---|
| **LCP** | 1.4–1.8 s (mobile 4G) | Hero image preloaded with srcset, but 143 KB HTML + 12 JS chunks contend with parsing |
| **TTFB** | 80–120 ms (origin), <100 ms (edge cache) | Confirmed by curl |
| **CLS** | < 0.05 (likely) | `width`/`height` set on hero image preload, font preload prevents FOIT |
| **INP** | Unknown | Cannot estimate without field data; React 19 + 12 chunks suggest hydration cost on low-end mobile |
| **FCP** | ~ 0.6–0.9 s | Edge HTML + preloaded font/image |

**Caveat:** these are best-case lab estimates over fast desktop. Real mobile 3G + low-end Android could be 2–3 × slower. Without CrUX field data, the score is conservative.

## Issues by severity

### High

1. **No `<link rel="preconnect">` / `<link rel="dns-prefetch">` for third-party origins.**
   - Evidence: 0 preconnect/dns-prefetch tags in homepage `<head>`.
   - Third-parties (PostHog `eu.i.posthog.com`, GA4 `www.google-analytics.com`, GTM `www.googletagmanager.com`, Stripe `js.stripe.com`, Maps `maps.googleapis.com`) are all whitelisted in CSP and used at runtime.
   - Impact: extra 50–150 ms TLS handshake on first interaction (post-hydration analytics fire, Stripe checkout open, Maps embed render).
   - Fix: add 3–4 `<link rel="preconnect" href="https://eu.i.posthog.com" crossorigin>` etc. in `app/layout.tsx`. Effort: 15 min.

2. **CSP still in `report-only` mode.**
   - Evidence: header is `content-security-policy-report-only`, not `content-security-policy`.
   - Per CLAUDE.md this is intentional ("observer les violations dans GSC/console avant d'enforcer"), but it provides zero defense.
   - Fix: enforce after a 30-day report window with no critical violations. Effort: 5 min header swap.

### Medium

3. **Homepage HTML payload 143 KB.**
   - Carries the full Footer + all 60 city links + FAQ + JSON-LD. Reasonable for a content-rich SAB landing, but could be trimmed.
   - The 60-city block ("Cordistes dans les grandes villes de France") could be moved into a `<details>` (semantic) or into a separate `/villes` page if the homepage hits LCP issues on mobile.
   - Impact: minor — 143 KB compressed is ~30 KB on the wire; not a blocker today.

4. **`/faq` page payload 202 KB.**
   - 22 QAPage schemas inline + full content. Each QAPage block is duplicated (one in DOM, one in JSON-LD).
   - Consider one `FAQPage` parent schema instead of 20 individual `QAPage` (per recent google FAQ schema policy: collapse to FAQPage when intent is informational, not Q&A community). Effort: depends on rendering logic.
   - Note: GEO agent recommends keeping QAPage for citability — there's a tension here. Defer.

### Low

5. **No PSI / CrUX field data available** (insufficient Chrome traffic for the origin).
   - Cannot reliably score INP, real-world LCP, or third-party drag.
   - Action: re-run audit with `python scripts/google_auth.py --auth` + GSC URL Inspection, or wait until traffic crosses CrUX threshold. Effort: external — depends on growth.

6. **`age: 705` on homepage** — the cache window is wide.
   - With ISR/SSG at `revalidate: ?` (not visible in headers), pages may serve stale content for 12+ minutes.
   - Verify the revalidate config matches editorial cadence. Effort: 5 min config check.

## Top 5 perf wins (ranked by ROI)

1. **Add 4 preconnect tags** in `app/layout.tsx` for PostHog, GA4/GTM, Stripe, Google Maps. (15 min, frees 50–150 ms post-interaction.)
2. **Enforce CSP** (drop `-report-only`) after a 7-day report-window check. (5 min.)
3. **Add `dns-prefetch` for `*.supabase.co` + `api-adresse.data.gouv.fr`** — used during job posting. (5 min.)
4. **Sign up for CrUX dataset** — only achievable by growing traffic. Track when origin enters dataset. (External.)
5. **Audit `/faq` payload reduction** — collapse 22 QAPage into one FAQPage if QAPage isn't proven citable. Cross-check with @seo-geo agent first. (30 min if confirmed.)

## Verdict

Excellent infrastructure foundation (Vercel edge, h2, async chunks, preloaded LCP image and font). The site is doing the right things at build/deploy time. The two ROI-positive shortfalls are **(a)** missing DNS/connect hints for third-parties used during interaction, and **(b)** CSP still permissive. Everything else is either constrained by external factors (no CrUX) or intentional (report-only CSP per project policy).

**Confidence:** medium — without field data we are scoring intent and structure rather than user-perceived speed. Recommend re-scoring after CrUX eligibility is reached.
