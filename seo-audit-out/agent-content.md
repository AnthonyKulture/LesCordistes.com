# Content Quality & E-E-A-T Audit — lescordistes.com

**Date:** 2026-05-04
**Score: 79 / 100**

## Word counts by page (HTML-to-text estimate)

| Page | Words | Sentences | Status |
|---|---|---|---|
| `/` (homepage) | 976 | — | Healthy |
| `/cordiste-paris` (city pillar) | 1 226 | 55 | Strong |
| `/cordiste-paris/nettoyage-facade` (city × service) | 571 | 28 | Above 300w threshold ✓ |
| `/cordiste-paris/lavage-vitres` | 575 | 29 | Above threshold ✓ |
| `/cordiste-copropriete` (persona, NEW) | 1 856 | — | Strong |
| `/faq` (NEW) | 3 130 | — | Strong |
| `/blog/cordiste-vs-nacelle-vs-echafaudage` (NEW) | 2 892 | — | Strong, comparison-grade |
| `/lexique` (index) | 425 | — | Index page, OK |
| `/blog` (index) | 638 | — | Index page, OK |

Average sentence length on city × service pages: **19–22 words** — readable for a B2B/B2C technical audience, on the upper edge of comfort. No single sentence exceeds the comprehension cliff.

## E-E-A-T signals

### Strong (Authoritativeness + Trustworthiness)

- **Homepage saturation of credentials:** 18× IRATA, 18× CQP, 8× certification, 6× RC Pro, 4× R.4323-58, 2× Kbis. Every certification claim is named with its specific code — verifiable, defensible, and the exact terminology a French rope-access pro would expect.
- **Regulatory anchors:** R.4323-58 (Code du travail) referenced 4× on homepage. This is the single strongest legal signal a SAB site can carry — it tells Google and an LLM "this site references the actual French regulation governing rope access."
- **Recent trust pages live:** `/faq` (3 130 w with 22 Q/R), `/cordiste-vs-echafaudage`, `/cordiste-copropriete` (persona-targeted), `/blog/cordiste-vs-nacelle-vs-echafaudage` (comparatif citable).
- **Author signals visible on blog post:** "Anthony Profit" appears 4× on the comparatif article. Author byline plus author archive page exists (`/auteur/anthony-profit`).

### Weak (Experience)

- **No customer testimonials / reviews surfaced on the homepage.** The marketplace has zero social proof visible above the fold (no star ratings, no "X cordistes inscrits" counter, no logos of B2B clients). For a marketplace at any growth stage, this is the largest E-E-A-T gap.
- **No first-party "case studies" or before/after photos.** A SAB selling visual work (façade cleaning, painting, rigging) without before/after photography on city pages misses the strongest possible Experience signal in the trade.
- **No author bio block on the comparatif article body.** The author tag exists but the page doesn't render an "About the author" section (Anthony Profit's expertise, certifications, years on rope) — Google's HCU explicitly rewards this.

### Weak (Trust)

- **Phone number visible** (`+33660501682`) in city page mobile CTA. Not a SEO problem per se, but combined with no GBP review schema visible (per @seo-local), it surfaces a "trust me" CTA before the trust is established.

## AI citation readiness

Per the @seo-geo agent (read its report): citability score 72/100. Key finding: the **comparatif article uses CSS-grid not semantic `<table>`** — the most citable content on the site is structurally invisible to LLM table extractors. Same root cause is hurting content here:

- **H2 question rate is low.** Only 2/4 H2s on homepage are questions. /faq has 1/9 H2 questions (the rest are sections/categories). /cordiste-paris has 0/2. /cordiste-copropriete has 0/5. /comparatif has 0/11.
- LLMs preferentially cite passages where the H2 *is* a question and the next paragraph *is* the answer — this is the easiest content fix.

## Thin content detection

**No thin content found in the indexable surface.** The 1 079 city × service pages without unique context are correctly `noindex, follow` per the project's anti-doorway strategy (verified by @seo-sitemap and @seo-technical agents). Only the 301 pages with hand-written context are indexable. Sample-checked Paris pages: 571–582 words each, with city-specific intro mentioning Paris specifics (Haussmannien, ABF, etc.) — passes the swap test.

**Borderline:** `/lexique` index at 425 w is light. Each `/lexique/[slug]` term page should be checked individually; the index is a nav page so 425 w is fine.

## Internal linking

| Page | Unique internal links |
|---|---|
| Homepage | 35 |
| /cordiste-paris | 42 |
| /cordiste-paris/nettoyage-facade | 27 |
| /cordiste-copropriete | 22 |
| /blog/cordiste-vs-nacelle-vs-echafaudage | 31 |

Density is healthy across the board. The 60-city block on the homepage acts as a hub for the city pillars. The new persona page (`/cordiste-copropriete`) at 22 links is on the lighter end — consider linking to **specific city × service pages** matching the persona's pain points (e.g., `/cordiste-paris/ravalement-facade`, `/cordiste-lyon/securisation-anti-pigeons`).

## Recent additions — quality assessment

**`/faq` (3 130 w, 22 Q/R, QAPage schema)**
- Strong content depth. 22 questions cover cost, certifications, response time, pricing, RC Pro, etc.
- Per @seo-geo: answer length averages 111 words — could be expanded to 134–167 w (the citability sweet spot) by adding regulatory precision or examples.
- **High-impact fix:** rewrite each H2 from declarative to interrogative ("Le prix d'un cordiste" → "Combien coûte un cordiste à Paris en 2026 ?").

**`/blog/cordiste-vs-nacelle-vs-echafaudage` (2 892 w)**
- Excellent strategic play (comparatif = high SERP feature potential).
- Author byline present (Anthony Profit, 4 mentions).
- **Critical structural issue (per @seo-geo):** the comparison "table" is CSS grid, not `<table>`. LLMs cannot extract it. Fix immediately — this is the highest-leverage content change on the site.

**`/cordiste-copropriete` (1 856 w, persona)**
- Solid length, persona-targeted (syndic / conseil syndical).
- 0 question H2s — convert at least 2 H2 ("Pourquoi un cordiste pour la copropriété ?", "Combien coûte une intervention en copropriété ?").
- Currently 22 internal links — too few for a persona hub. Add city × service deep links and at least 2 blog links.

## Issues by severity

### Critical
1. **Comparatif article uses CSS-grid not `<table>`.** AI citation engine cannot read the central comparison. Single biggest content change to make this week. **Fix:** swap CSS grid for `<table><thead>/<th>/<tbody>/<td>` with `scope="col"`. Effort: 30 min.

### High
2. **No social proof / reviews on homepage.** No star rating, no count of completed jobs, no client logos. **Fix:** add an "X chantiers réalisés / Y cordistes inscrits / Z avis vérifiés" counter row above the fold. Activate review collection (per @seo-local recommendation). Effort: 1 day for component + backend hook.
3. **H2 question rate too low** across the indexable surface (homepage 2/4, FAQ 1/9, persona 0/5, comparatif 0/11). LLMs prefer Q→A passages. **Fix:** systematically rewrite section headings as questions where intent allows. Effort: 2–3 hours across all key pages.
4. **No author bio block on the comparatif article.** Byline alone is not enough for HCU/E-E-A-T. **Fix:** add a `AuthorBox` component (avatar, 2-line bio, certifications, years on rope) below H1 + at end of article. Effort: 2 hours including reusable component.

### Medium
5. **`/cordiste-copropriete` internal linking light** (22 links). **Fix:** add 6–10 contextual links to relevant city × service pages + 2 blog posts. Effort: 30 min.
6. **FAQ answers averaging 111 w** (under the 134–167 w citability sweet spot per @seo-geo). **Fix:** add one concrete example or regulatory precision per answer. Effort: 1 hour for top 10 answers.
7. **No before/after photography** on city × service pages. **Fix:** when a B2B job completes with photo permission, attach 2–3 photos to the matching city × service page. Effort: ongoing operational change.

### Low
8. **City × service pages average sentence length 19–22 w** — upper edge. **Fix:** in the next rewrite pass on a city × service entry, target avg 16–18 w/sentence. Effort: marginal, opportunistic.

## Top 5 quick wins (ranked by ROI)

1. **Convert the comparatif's CSS grid to a semantic `<table>`.** 30 min. Unlocks LLM citation of the page's central asset.
2. **Rewrite top-10 FAQ H2 as questions** + add 25–50 w per answer. 2 hours. Improves both /faq citability and AI Overviews extractability.
3. **Add an `AuthorBox` component** + place it on the comparatif and on `/cordiste-copropriete`. 2 hours. Material HCU lift.
4. **Add a "social proof bar"** above the fold on homepage (counters + 3 review snippets). 1 day. Closes the largest E-E-A-T gap (Experience).
5. **Cross-link `/cordiste-copropriete`** to 6–10 specific city × service pages matching the persona. 30 min. Distributes link equity to the persona hub.

## Verdict

The content surface is **mature for the indexable footprint**: 301 unique-context city × service pages, three substantial new authority pages (FAQ 3 130 w, comparatif 2 892 w, persona 1 856 w), correctly-cited regulations, full certification vocabulary. The architecture passes the swap test and the anti-doorway strategy is correctly enforced.

The two systemic gaps are **(a)** the lack of visible Experience signals (reviews, client proof, before/after photos) and **(b)** content that could read better for AI extractors (more question-H2s, semantic tables, author boxes). Fixing both is a single-sprint effort.
