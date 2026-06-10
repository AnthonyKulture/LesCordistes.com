# GEO Readiness Audit — LesCordistes.com
**Date:** 2026-05-04  
**Scope:** 8 pages + llms.txt + llms-full.txt + robots.txt

---

## GEO Readiness Score: 72 / 100

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Citability | 25% | 70 | 17.5 |
| Structural Readability | 20% | 78 | 15.6 |
| Multi-Modal Content | 15% | 55 | 8.25 |
| Authority & Brand Signals | 20% | 72 | 14.4 |
| Technical Accessibility | 20% | 82 | 16.4 |
| **Total** | | | **72.15** |

---

## 1. AI Crawler Access Matrix

robots.txt uses `User-agent: * / Allow: /` with no bot-specific rules. Every AI crawler inherits the wildcard.

| Crawler | Status | Note |
|---------|--------|------|
| GPTBot | ALLOWED (implicit) | No explicit entry — inherits `*` |
| OAI-SearchBot | ALLOWED (implicit) | No explicit entry |
| ClaudeBot | ALLOWED (implicit) | No explicit entry |
| PerplexityBot | ALLOWED (implicit) | No explicit entry |
| Bingbot | ALLOWED (implicit) | No explicit entry |
| Google-Extended | ALLOWED (implicit) | No explicit entry |
| Applebot-Extended | ALLOWED (implicit) | No explicit entry |
| CCBot | ALLOWED (implicit) | Not blocked — training crawl allowed |
| anthropic-ai | ALLOWED (implicit) | Not blocked |
| cohere-ai | ALLOWED (implicit) | Not blocked |

**Finding:** All AI crawlers are allowed. The absence of explicit `User-agent: GPTBot / Allow: /` entries means there is no affirmative trust signal for crawlers that check for opt-in consent. This is a missed signal, not a blocker.

Blocked paths (`/dashboard/`, `/admin/`, `/api/`, `/auth/`, `/credits/`, `/pro/`, `/messages/`) are correct. No public GEO-relevant content is blocked.

Sitemap correctly declared: `Sitemap: https://www.lescordistes.com/sitemap.xml`

---

## 2. llms.txt + llms-full.txt Assessment

### llms.txt — Format Compliance

| Check | Status |
|-------|--------|
| Single H1 title | PASS |
| Blockquote mission statement | PASS |
| `Updated:` field (2026-05-02) | PASS |
| `Author:` field | PASS |
| `License:` CC-BY 4.0 | PASS (see note) |
| `## Docs` section | PASS (24 links) |
| `## Optional` section | PASS |
| Citable data block | PASS — 7 statistics with specificity |
| Coverage: services, geography, model | PASS |

**License note:** License is CC-BY 4.0, not RSL 1.0. RSL 1.0 is for restricting training use. CC-BY 4.0 is permissive — appropriate here since the intent is to be cited and recommended. No change needed.

**Content quality (strong):**  
- Platform identity paragraph: self-contained, definitional, 78 words — citable directly.  
- Verification block (73 words): names specific articles (Code du travail L6314-1), process, and document list — high E-E-A-T density.  
- Stats block: 7 data points with units (350-600 €/j, 8-25 €/m², 30-50% savings, 48h delays) — directly extractable.  
- Docs section links all key pages with inline descriptions — acts as a site knowledge graph for LLMs.

**Gap:** No SFETH URL, no irata.org URL, no OPPBTP reference in llms.txt. External authority links increase trust signals for LLMs performing entity verification.

### llms-full.txt

- 44,610 chars / 419 lines — appropriately sized (not too large for ingestion)
- Concatenates: llms.txt + 13 lexique entries + 10 blog FAQs = comprehensive knowledge graph
- Dynamically generated with 24h cache — freshness is good
- Lexique entries average ~100 words each — well within extraction range
- Blog FAQ entries in Q/A format with question prefix — directly parseable
- Generation timestamp present at end of file

---

## 3. Citability Assessment by Page

### /faq (Hub FAQ centralisé)
**Schema:** 1 parent `@graph` with 20 individual `QAPage` nodes + `CollectionPage` + `BreadcrumbList`

| Metric | Value |
|--------|-------|
| QAPage schemas | 20 (note: llms.txt says 22 — 2 may be missing) |
| All have `acceptedAnswer` | Yes |
| Avg answer word count | 111 words |
| In 134-167 sweet spot | 1 / 20 (5%) |
| Question-phrased H2/H3 | 21 / 31 (68%) |
| Authority signals | R.4323 ×9, CQP ×60, IRATA ×48 |
| LesCordistes mentions | 455 (inflated by nav/footer repetition) |

**Gap:** 19/20 answers are below the 134-word citability floor. Answers average 111 words — expandable by 25-50 words each without losing directness. This is the single highest-ROI citability fix.

**Strength:** 20 individual QAPage schemas (not a single FAQPage) means each Q/A is addressable as a standalone entity — correct implementation for LLM extraction.

---

### /blog/cordiste-vs-nacelle-vs-echafaudage (Comparatif)
**Schema:** `BlogPosting` + `FAQPage` (6 questions) + `BreadcrumbList`

| Metric | Value |
|--------|-------|
| Total word count | ~8,100 |
| Author attributed | Anthony Profit (in schema + in-text) |
| datePublished | 2026-05-04 |
| Image in BlogPosting | Yes (dynamic OG) |
| HTML table | 0 (CSS grid only — invisible to LLMs) |
| FAQPage questions | 6 |
| Avg FAQ answer words | 90 words (below 134 floor) |
| Question-phrased H2/H3 | 1 / 18 (6%) |
| Regulatory references | R.4323-58, R.4323-69, décret 2004-924 |

**Critical gap — No HTML table:** The comparison table is CSS grid. LLMs parsing raw HTML cannot extract tabular comparison data. This is the central value proposition of the article (cordiste vs nacelle vs échafaudage side-by-side). Converting to `<table>` with `<th>` headers is essential for AI citation of comparison data.

**Gap:** Only 1 of 18 H2/H3 headings is phrased as a question. The section titles describe content instead of answering the reader's query (e.g., "La nacelle élévatrice (PEMP) : avantages, limites et tarifs" vs "Quand utiliser une nacelle plutôt qu'un cordiste ?").

**Strength:** BlogPosting schema is correctly wired with author, dates, and image. 6 FAQPage questions are well-formed if slightly short.

---

### /cordiste-copropriete (Persona page)
**Schema:** `WebPage` + `Service` + `HowTo` (4 steps) + `BreadcrumbList` + `FAQPage`

| Metric | Value |
|--------|-------|
| Total word count | ~6,861 |
| HowTo steps | 4 |
| Question-phrased H2/H3 | 0 / 23 |
| Legal references | Loi 1965 art. 24/25, L132-1 |
| Tarif examples | 3 concrete cases (R+5 examples) |
| Author attribution | None visible |

**Gap:** Zero question-phrased headings on a page targeting syndics who search "comment gérer le ravalement en copropriété". The FAQ section exists but headings are declarative, not interrogative.

---

### /cordiste-paris (Local city page)
**Schema:** `Service` + `BreadcrumbList` + `FAQPage`

| Metric | Value |
|--------|-------|
| Total word count | ~3,200 (estimated) |
| Question-phrased H2/H3 | 3 / 21 |
| R.4323 mentions | 0 |
| ABF/regulatory context | Present (Haussmann, UNESCO) |

**Strength:** Specific local authority signals (ABF, arrêté de voirie, Île-de-France pricing premium).

---

### Homepage
**Schema:** `WebSite` + `Organization/ProfessionalService` + `FAQPage`

| Metric | Value |
|--------|-------|
| FAQPage schema | Yes |
| Question-phrased H2/H3 | 5 / 21 |
| SSR confirmed | Yes — content in HTML before JS |
| IRATA ×17, CQP ×17, R.4323 ×4 | Strong |

---

### /lexique (Dictionary)
**Schema:** `DefinedTermSet` + `BreadcrumbList`

13 terms with 70-150 word definitions — good citability range. No `DefinedTerm` per-term schema found in page (only `DefinedTermSet` at collection level). Individual term pages at `/lexique/[slug]` likely have `DefinedTerm` schemas.

---

## 4. Authority & Brand Signal Analysis

| Signal | Status |
|--------|--------|
| Named authors in schema | Anthony Profit (comparatif, llms.txt), Benjamin De Oliveira (llms.txt) |
| Author pages | `/auteur/anthony-profit`, `/auteur/benjamin-de-oliveira` listed in llms.txt |
| LinkedIn links | 2 (both authors) |
| Wikipedia entity | NOT PRESENT |
| Reddit community | NOT PRESENT |
| YouTube channel | NOT PRESENT |
| irata.org backlink/mention | NOT IN llms.txt |
| SFETH mention | NOT IN llms.txt |
| Google Maps / GBP | Linked in llms.txt |
| Code du travail references | R.4323-58, L6314-1, L4741-1, R.4532-44 |
| Pricing transparency | Excellent — 7 price points with units and sourcing |

**Critical correlation gap:** YouTube presence correlates ~0.737 with AI citations (strongest signal). Reddit presence correlates high. Neither exists. Wikipedia entity would provide definitive entity recognition across all LLMs.

**Strength:** Legal and regulatory citation density is high (R.4323-58 appears on 5 of 6 pages audited). This is the strongest E-E-A-T signal for a specialist domain — no general competitor will match this specificity.

---

## 5. Technical Accessibility

| Check | Status |
|-------|--------|
| SSR (Next.js App Router) | CONFIRMED — content in raw HTML on all pages |
| No `__NEXT_DATA__` client shell | CONFIRMED — App Router SSR |
| `lang="fr"` | CONFIRMED |
| Canonical with www | CONFIRMED (`SEO_BASE_URL = https://www.lescordistes.com`) |
| Sitemap in robots.txt | CONFIRMED |
| IndexNow GitHub Action | CONFIRMED (`.github/workflows/indexnow-on-deploy.yml`) |
| IndexNow → Bing Copilot signal | ACTIVE |
| CSP in report-only mode | CONFIRMED (no crawl blocking) |
| HTML tables for data | MISSING in comparatif (CSS grid only) |

---

## 6. Platform-Specific Scores

| Platform | Score | Reasoning |
|----------|-------|-----------|
| Google AI Overviews | 72 | FAQPage + QAPage schemas strong; FAQ answers too short; SSR confirmed |
| Perplexity | 75 | llms.txt well-formed; citable stats; needs table markup |
| Bing Copilot | 74 | IndexNow active; no explicit Bingbot rule; llms.txt linked |
| ChatGPT | 60 | No Wikipedia entity; no YouTube; Reddit absent; less brand salience |

---

## Top 5 GEO Opportunities (Prioritized by Impact)

### 1. Expand FAQ answers to 134-167 words [HIGH IMPACT | Effort: Medium]
**Pages:** /faq (20 answers avg 111 words)  
**Action:** Add 25-50 words per answer with a concrete example, regulatory precision, or secondary use case. Do not add filler — add a second fact or nuance that makes the answer self-contained without the question.  
**Impact:** Directly targets the AI citation sweet spot. 19/20 answers are currently below threshold.

### 2. Convert CSS grid comparison table to semantic HTML `<table>` [HIGH IMPACT | Effort: Low]
**Page:** /blog/cordiste-vs-nacelle-vs-echafaudage  
**Action:** Replace the CSS grid comparison block with a native `<table>` using `<thead>`, `<th scope="col">`, `<th scope="row">`. Add a `<caption>`.  
**Impact:** LLMs cannot extract CSS grid tabular data. This is the most citable element of the highest-value GEO article. ChatGPT and Perplexity frequently cite comparison tables — but only when marked up as tables.

### 3. Add explicit bot rules in robots.txt [MEDIUM IMPACT | Effort: Very Low]
**Action:**  
```
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
```
**Impact:** Explicit `Allow` entries are trust signals that prevent misinterpretation if crawlers default to deny for ambiguous wildcards in future policy changes. CCBot (Common Crawl / training) can remain under `*` since no specific training restriction is intended.

### 4. Add irata.org, sfeth.fr, oppbtp.fr links in llms.txt [MEDIUM IMPACT | Effort: Very Low]
**Page:** /llms.txt  
**Action:** In the `## Vérification des cordistes` section, add outbound links to irata.org technician verification, sfeth.fr, and oppbtp.fr as reference authorities.  
**Impact:** LLMs verify entity claims by cross-referencing known authorities. Citing the sources that validate the certifications adds epistemic credibility. Cost: 3 lines in llms.txt.

### 5. Rephrase H2/H3 headings in comparatif and copropriete as questions [MEDIUM IMPACT | Effort: Low]
**Pages:** /blog/cordiste-vs-nacelle-vs-echafaudage (1/18 question headings), /cordiste-copropriete (0/23)  
**Action examples:**  
- "La nacelle élévatrice (PEMP) : avantages, limites et tarifs" → "Quand une nacelle est-elle préférable à un cordiste ?"  
- "Tarifs concrets : 3 exemples copropriété R+5" → "Combien coûte un cordiste pour une copropriété R+5 ?"  
- "Cadre légal copropriété" → "Quelle loi oblige une copropriété à ravaler sa façade ?"  
**Impact:** Question headings are the primary matching signal for "People Also Ask" / AI Overview query matching. Each H2 rephrased as a question = a new query interception point.

---

## Summary Table

| Dimension | Score | Main Gap | Quick Win Available |
|-----------|-------|----------|---------------------|
| Citability | 70/100 | FAQ answers 111w avg (need 134+) | Expand 5 answers per sprint |
| Structural Readability | 78/100 | Comparatif has 1/18 question H2/H3 | Rephrase headings |
| Multi-Modal | 55/100 | No HTML table; OG image dynamic but no schema image array | Add `<table>` to comparatif |
| Authority Signals | 72/100 | No Wikipedia, Reddit, YouTube | Add irata.org/sfeth links to llms.txt |
| Technical Accessibility | 82/100 | No explicit bot Allow entries | 5-line robots.txt addition |

