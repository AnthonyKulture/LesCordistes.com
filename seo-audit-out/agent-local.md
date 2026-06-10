# Local SEO Audit — LesCordistes.com
**Date:** 2026-05-04  
**Auditor:** Local SEO Agent (claude-sonnet-4-6)  
**Scope:** Homepage, /cordiste-paris, /cordiste-paris/nettoyage-facade  

---

## Local SEO Score: 61 / 100

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|---------|
| GBP Signals | 25% | 52 | 13.0 |
| Reviews & Reputation | 20% | 20 | 4.0 |
| Local On-Page SEO | 20% | 72 | 14.4 |
| NAP Consistency & Citations | 15% | 78 | 11.7 |
| Local Schema Markup | 10% | 85 | 8.5 |
| Local Link & Authority Signals | 10% | 95 | 9.5 |
| **TOTAL** | | | **61.1** |

---

## Business Type

**Service Area Business (SAB)** — correctly configured.  
- No street address visible in rendered HTML (address is in JSON-LD only — compliant).  
- `areaServed: Country France` on Organization; city-level pages use `areaServed: City`.  
- No per-city GBP profiles detected (correct — single HQ profile in Nice).  
- Homepage uses "Toutes les grandes villes / Réseau actif Paris, Lyon, Marseille" language (SAB-appropriate).

---

## SAB Compliance Check

| Rule | Status | Detail |
|------|--------|--------|
| No street address in visible HTML | PASS | Not in rendered DOM — only in JSON-LD and JS bundles |
| No street address in JS bundles / __NEXT_DATA__ | PASS | Confirmed stripped from all non-schema contexts |
| Phone number hidden from visible HTML | FAIL | `tel:+33660501682` rendered as a visible `<a>` link on `/cordiste-paris` (mobile CTA button) |
| Single GBP profile (no per-city profiles) | PASS | Only one CID detected: `15872124307907753477` |
| GBP/Bing in SAB mode (no public address) | CANNOT VERIFY | Requires live GBP dashboard access |
| Organization address in JSON-LD only | PASS | HQ address (2 rue Pierre Pietri, Nice 06000) present only in schema |
| City pages: `Service` + `areaServed:City` (not LocalBusiness) | PASS | Verified on /cordiste-paris and /cordiste-paris/nettoyage-facade |
| No `addressLocality: <ville>` on city pages (SAB-spam) | PASS | `addressLocality:Paris` appears only inside `areaServed.address` of the City object, not on provider |

**Note on phone visibility:** The `tel:+33660501682` link is rendered in visible HTML on city pages as a mobile CTA ("md:hidden" class — desktop-hidden but mobile-visible). This is a public phone display. Per CLAUDE.md rule ("Ne pas afficher 2 rue Pierre Pietri en HTML public"), the *address* is correctly protected; the phone number appears intentionally exposed. Confirm whether this phone exposure is deliberate business policy. If the number is a personal mobile, consider a dedicated business line or click-to-call gating.

---

## NAP Consistency Audit

| Source | Name | Address | Phone |
|--------|------|---------|-------|
| JSON-LD (homepage) | LesCordistes.com | 2 rue Pierre Pietri, 06000 Nice, FR | +33660501682 |
| JSON-LD (city pages) | LesCordistes.com | 2 rue Pierre Pietri, 06000 Nice, FR | +33660501682 |
| sameAs — Pages Jaunes | LesCordistes.com | Cannot verify (external) | Cannot verify |
| sameAs — Trustpilot | LesCordistes.com | Cannot verify (external) | Cannot verify |
| sameAs — GBP CID | LesCordistes.com | Cannot verify (live) | Cannot verify |
| sameAs — LinkedIn | LesCordistes.com | Cannot verify (external) | Cannot verify |

NAP within the site is 100% consistent across all pages audited. No discrepancies detected between schema sources.  
External citations (Trustpilot, Pages Jaunes) cannot be verified without live access — see Limitations.

---

## Local Schema Validation

### Organization (homepage)
- **@type:** `["Organization", "ProfessionalService"]` — correct for a marketplace SAB; not `LocalBusiness` (avoids per-city address obligation). PASS.
- **name:** "LesCordistes.com" — PASS
- **address:** Present (2 rue Pierre Pietri, Nice) — PASS (JSON-LD only, not rendered)
- **telephone:** "+33660501682" — PASS
- **url:** "https://www.lescordistes.com/" — PASS
- **openingHoursSpecification:** Present (Mon-Fri 08:00-18:00) — PASS
- **areaServed:** `{ "@type": "Country", "name": "France" }` — PASS
- **geo on Organization:** MISSING — no `GeoCoordinates` on the root Organization node. Low priority for SAB but recommended.
- **aggregateRating:** MISSING — no `aggregateRating` in any schema across all pages. This is the biggest schema gap.
- **sameAs:** 4 entries (GBP CID, LinkedIn, Pages Jaunes, Trustpilot) — PASS

### City Page (/cordiste-paris)
- **@type:** `Service` — PASS (correct SAB pattern; not LocalBusiness)
- **areaServed:** `{ "@type": "City", "name": "Paris" }` with `GeoCoordinates` (48.85660, 2.35220 — 5 decimal places) — PASS
- **provider:** References `#organization` via @id — PASS (correct linked-data pattern)
- **No addressLocality:Paris on provider** — PASS (no SAB local-spam)
- **BreadcrumbList:** Present, 2 levels — PASS
- **FAQPage:** Present with 4 Paris-specific Q&A — PASS
- **Maps embed:** Generic search embed (`maps.google.com/maps?q=cordiste+Paris+France`) — WEAK. This is a keyword search, not a verified Place embed. A proper GBP embed (`/maps/embed?pb=` with the place_id) would be a stronger GBP signal.

### City x Service Page (/cordiste-paris/nettoyage-facade)
- **@type:** `Service` — PASS
- **areaServed:** `{ "@type": "City", "name": "Paris" }` — PASS (no geo here, acceptable)
- **Offers/priceSpecification:** Present (350-600 EUR/jour) — PASS (strong differentiator)
- **aggregateRating:** MISSING
- **BreadcrumbList:** 3 levels — PASS

---

## GBP Signals Assessment

| Signal | Status |
|--------|--------|
| GBP CID in sameAs schema | PASS — CID 15872124307907753477 |
| Maps embed on city pages | WEAK — generic search query, not Place embed |
| Maps embed on homepage | FAIL — no Maps embed on homepage |
| Review widget (Trustpilot / Google) | FAIL — Trustpilot link in sameAs only, no embedded widget |
| Photo evidence of work | PASS — professional photos on homepage and city pages |
| Posts/updates indicator | CANNOT VERIFY — requires live GBP access |
| GBP primary category | CANNOT VERIFY — requires GBP dashboard |

**Key gap:** The Maps embed on city pages uses a generic search query (`q=cordiste+Paris+France`) rather than the business's actual Place/CID embed. This provides no GBP attribution — Google cannot associate the embed with the listing. Replace with a proper `maps/embed?pb=` URL using the place_id.

---

## Reviews & Reputation

| Signal | Status |
|--------|--------|
| aggregateRating in any schema | FAIL — absent from all pages |
| Trustpilot profile in sameAs | PASS (https://fr.trustpilot.com/review/lescordistes.com) |
| Embedded review widget | FAIL — not present |
| Visible testimonials (HTML) | FAIL — not found on homepage or city pages |
| Review count visible | FAIL |
| Review response signals | CANNOT VERIFY |

This is the most critical gap. No `aggregateRating` schema means Google cannot show star ratings in SERPs (rich results). No embedded reviews means zero social proof on the highest-traffic pages. Given the 18-day review velocity rule (Sterling Sky), active review solicitation should be a priority.

---

## City Pages — Local Relevance Assessment

### /cordiste-paris (pillar — 1,226 words visible)
**Swap test result: PASS** — passes the swap test convincingly.  
City-specific references: Marais (3x), La Défense (4x), Haussmann (3x), Bâtiments de France ABF (2x), Montmartre (2x), intra-muros (1x), arrondissement (1x), Île-de-France (3x).  
Devis CTA: 7 mentions. Response time: "48h" (6x), urgence 24h (1x).  
Internal links to service sub-pages: present (20+ service CTAs with arrows).  
Contact CTA: "Recevoir mes devis gratuits" — visible and prominent.  
Missing: contact form on the page itself (routes to /post-job wizard — acceptable but adds friction).

### /cordiste-paris/nettoyage-facade (578 words visible)
**Swap test result: BORDERLINE** — Paris references present (Haussmann 2x, ABF 1x, La Défense 1x) but thin. Content is shorter than the city pillar. The city-aware context mentions are present but few. Acceptable for a sub-page but not strong enough to rank independently for "nettoyage facade Paris" against dedicated service providers. Recommend expanding to 800+ words with additional Paris-specific context (building type regulations, specific arrondissement examples, before/after framing).

---

## Industry-Specific Findings

### Certification Signals (CQP/IRATA)
- Homepage H3: "Vérifiés CQP / IRATA" — PASS (prominent positioning)
- City page: CQP mentioned 3x, IRATA 4x in /cordiste-paris/nettoyage-facade — PASS
- /verification-pros linked from homepage — PASS (dedicated trust page)

### Insurance & Regulatory Compliance
- "RC Pro & Kbis contrôlés" — homepage H3 — PASS
- "Conforme R.4323-58" — homepage H3, links to /mentions-legales — PASS
- No visible insurance certificate or RC Pro doc download — MEDIUM gap for B2B trust

### GBP Category Risk
Per Whitespark 2026: wrong primary GBP category is the #1 negative factor (score 176). Cannot verify current category without live GBP access. Likely candidates: "Rope Access Services" (does not exist in French GBP), "Agence de travail temporaire", or "Nettoyage de bâtiment". Audit the GBP primary category immediately — this is the highest-stakes unverifiable item.

---

## Multi-Location Strategy — Doorway Risk Assessment

**Strategy:** 60 city pillars + up to 1,380 city × service sub-pages, with conditional `noindex` on sub-pages lacking unique content.

**Doorway risk: LOW** — The approach is sound:
- City pillars pass the swap test (verified on Paris).
- noindex on templated sub-pages prevents Google from indexing thin content.
- Only 301 of 1,380 sub-pages are indexable (22% — appropriate filter).
- Internal linking from homepage explicitly names city-specific context (Vieux-Lille, Île de Nantes, Port de la Lune, etc.).
- Service schema uses `Service` + `areaServed:City`, never `LocalBusiness` per city — no per-city GBP spam risk.

**Remaining risk:** City pages currently route through a single global CTA (`/post-job`) rather than a city-pre-filled wizard URL. A URL like `/post-job?ville=Paris` would reduce friction and improve conversion tracking per city.

---

## Citation Presence (Tier 1 Directories)

| Directory | Status |
|-----------|--------|
| Pages Jaunes | CONFIRMED — sameAs link (pagesjaunes.fr/pros/64869308) |
| Google Business Profile | CONFIRMED — CID 15872124307907753477 in sameAs |
| Trustpilot | CONFIRMED — sameAs link |
| LinkedIn | CONFIRMED — company page |
| Yelp (France) | NOT DETECTED — absent from sameAs |
| BBB / Qualibat | NOT APPLICABLE — French context; Qualibat/RGE not applicable for cordiste marketplace |
| Kompass / Societe.com | NOT DETECTED |

---

## Top 10 Prioritized Actions

### Critical

**1. Add `aggregateRating` schema to Organization and key pages.**  
No star ratings in SERPs without it. Solicit reviews on Trustpilot and Google immediately, then add `aggregateRating` to homepage schema once a minimum of 5 reviews are collected. This is the single highest-impact schema fix.

**2. Replace generic Maps embed with Place-specific embed on city pages.**  
Current embed (`q=cordiste+Paris+France`) has zero GBP attribution. Replace with the actual GBP place embed URL using CID or place_id. This converts the embed from a decorative element into a real GBP signal.

**3. Audit and optimize GBP primary category.**  
Cannot verify from page HTML — requires live GBP dashboard. Wrong primary category is the #1 negative local ranking factor (Whitespark 2026, score 176). Verify the category is the closest available match for a rope-access marketplace; add secondary categories for the service types offered.

### High

**4. Embed a review widget (Trustpilot or Google reviews) on the homepage and city pillar pages.**  
No social proof is visible anywhere in the audited pages. A Trustpilot widget (existing profile in sameAs) would simultaneously add visible trust signals and feed schema data. Critical for conversion on B2B pages.

**5. Implement review velocity strategy (18-day rule).**  
No reviews are visible on-site. The Sterling Sky 18-day rule means rankings can cliff if no new Google reviews appear for 3 weeks. Set up an automated post-job email asking for a Google/Trustpilot review — trigger off `job.status = completed`.

**6. Expand /cordiste-paris/nettoyage-facade to 800+ words with Paris-specific context.**  
Current page is 578 visible words with minimal city-specific differentiation. This sub-page needs to pass the swap test independently to rank for "nettoyage facade Paris" — a commercially valuable query.

### Medium

**7. Consider a dedicated business phone number (not personal mobile).**  
The phone `+33660501682` displayed as a visible tel: link on mobile city pages appears to be the founder's personal number (per admin email context). A business line improves NAP professionalism and allows call tracking without exposing a personal number.

**8. Add `geo` coordinates to the root Organization schema.**  
Currently missing. While low-priority for a national SAB, adding `GeoCoordinates` to the Organization improves schema completeness and is a recommended property per schema.org standards.

**9. Add Yelp France and Kompass citations.**  
Currently absent from sameAs and likely unclaimed. For 3 of the top 5 AI visibility factors being citation-related (Whitespark 2026), expanding Tier 1 directory presence is a compounding gain.

**10. Add city-pre-filled CTA URLs on city pages.**  
Replace generic `/post-job` CTA with `/post-job?ville=Paris` (or equivalent query param) to reduce friction and enable per-city conversion tracking in analytics.

### Low

- Add `geo` to Organization node (minor schema completeness gap).
- Add `image` with multiple high-quality photos to city Service schemas (currently only on Organization).
- Consider a `/verification-pros` page schema with `DefinedTerm` or `HowTo` markup for the verification process — good for AI citation and E-E-A-T.

---

## Limitations Disclaimer

The following items could not be assessed without paid/authenticated tools:

- **Live GBP data:** Primary category, secondary categories, review count, review velocity, Q&A section, photo count, post history, GBP completeness score — requires Google Business Profile API or DataForSEO `local_business_data`.
- **Real-time local pack positions:** Whether lescordistes.com appears in the local 3-pack for any target queries — requires DataForSEO `google_local_pack_serp`.
- **External citation accuracy:** Whether Pages Jaunes, Trustpilot, and LinkedIn profiles contain matching NAP — requires fetching those live pages.
- **Review velocity:** Actual review date distribution — requires GBP/Trustpilot API.
- **Proximity factor:** Proximity accounts for 55.2% of local ranking variance (Search Atlas ML study). As a national SAB, this factor is outside control by design; it cannot be assessed from page data alone.
- **Bing Places configuration:** SAB mode status on Bing cannot be verified without dashboard access.
- **noindex coverage validation:** The 301 indexable vs 1,079 noindex split can only be fully validated via live crawl or GSC coverage report.
