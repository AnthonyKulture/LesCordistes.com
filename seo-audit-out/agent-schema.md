# Schema.org Audit — LesCordistes.com
Date: 2026-05-04

## Score: 74 / 100

---

## Schema Inventory per Page

| Page | Types Found | JSON Valid | @context |
|---|---|---|---|
| `/` (homepage) | WebSite, Organization/ProfessionalService, FAQPage | OK | https://schema.org |
| `/cordiste-paris` | Service, BreadcrumbList, FAQPage | OK | https://schema.org |
| `/cordiste-paris/nettoyage-facade` | Service, BreadcrumbList, FAQPage | OK | https://schema.org |
| `/cordiste-paris/lavage-vitres` | Service, BreadcrumbList, FAQPage | OK | https://schema.org |
| `/blog` | Blog (with 11 BlogPosting children) | OK | https://schema.org |
| `/lexique` | DefinedTermSet, BreadcrumbList | OK | https://schema.org |
| `/faq` | CollectionPage, BreadcrumbList, 20× QAPage | OK | https://schema.org |
| `/cordiste-copropriete` | WebPage, Service, HowTo, BreadcrumbList, FAQPage | OK | https://schema.org |
| `/blog/cordiste-vs-nacelle-vs-echafaudage` | BlogPosting, BreadcrumbList, FAQPage | OK | https://schema.org |

---

## Validation Results

### PASS

- All 9 blocks are valid JSON — zero parse errors.
- All `@context` values use `https://schema.org` (https, not http).
- Organization singleton rule respected: one `@id: https://www.lescordistes.com/#organization` defined on homepage, referenced by `@id` only on all downstream pages.
- SAB rule (no `addressLocality` on city Service node itself): PASS. The `addressLocality` is inside `areaServed.address` (describes the served city), not on the Service or its provider inline — this is correct usage. The provider is always referenced by `@id` only on city×service pages, never inline with a city address.
- BlogPosting (`/blog/cordiste-vs-nacelle-vs-echafaudage`): `author` (Person with @id, sameAs LinkedIn), `publisher` (Organization @id), `image` (ImageObject with width/height), `datePublished`, `dateModified`, `inLanguage` — all present and correct.
- BreadcrumbList: present on all appropriate pages, correct item count.
- QAPage (×20 on `/faq`): each has a unique `@id` and `mainEntity` (Question + Answer). Correct for LLM/AI citation use.
- DefinedTermSet on `/lexique`: correctly typed, unique `@id`.

### FAIL / WARNINGS

#### CRITICAL — HowTo on `/cordiste-copropriete`
`HowTo` rich results were removed by Google in September 2023. This schema type is now dead weight for Google rich results. It does not cause indexation harm but generates no SERP feature.
- Fix: Replace `HowTo` with additional `Service` detail or a second `ItemList` describing the workflow steps without the `HowTo` wrapper.

#### HIGH — Blog listing BlogPosting items missing `author` and `publisher`
The `Blog` node on `/blog` contains 11 `BlogPosting` children. None of them have `author` or `publisher` properties. Only `image`, `url`, `datePublished`, `dateModified`, `description`, `headline` are present.
Google requires `author` and `publisher` (with `name`) for Article rich results eligibility. The individual article page (`/blog/cordiste-vs-nacelle-vs-echafaudage`) correctly has them, but the listing schema does not.
- Fix: Add `"author": {"@type": "Person", "name": "Anthony Profit"}` and `"publisher": {"@type": "Organization", "@id": "https://www.lescordistes.com/#organization", "name": "LesCordistes.com"}` to each `BlogPosting` object inside the Blog listing.

#### MEDIUM — FAQPage on commercial pages (homepage, city, city×service, copropriete, blog article)
FAQPage rich results are restricted to government and healthcare sites since August 2023. These schemas produce no Google rich result on lescordistes.com. They remain beneficial for AI/LLM citation (GEO value), so flagged as informational only — do not remove if GEO is a priority.
- No action required unless cleaning up for minimal schema footprint.

#### MEDIUM — provider inlined with full address on `/cordiste-paris`
On the city page `/cordiste-paris`, the `provider` object is fully inlined (includes `address`, `telephone`, `email`, `openingHoursSpecification`, `sameAs`) instead of referencing by `@id` only. The other two city×service pages do the same.
This is not a rule violation per se (the address is Nice, the SAB siège, not Paris), but it bloats the schema and duplicates the Organization definition instead of resolving it via `@id`. Google resolves `@id` cross-graph references correctly.
- Fix: Slim the provider to `{"@id": "https://www.lescordistes.com/#organization"}` on city and city×service pages, relying on the homepage graph to define the full Organization.

#### LOW — No `AggregateRating` / `Review` anywhere
No review or rating schema exists on any page. The Trustpilot `sameAs` link on Organization is present but does not surface ratings in SERPs. Given the marketplace nature (pros rated by clients), an `AggregateRating` on the Organization or on Service pages would unlock star snippets.
- Requires having verifiable public rating data (Trustpilot or internal).

#### LOW — No `WebSite` / `SearchAction` on sub-pages
`potentialAction: SearchAction` (Sitelinks Searchbox) is correctly defined on the homepage `WebSite`. Sub-pages do not need it — this is correct behavior.

#### INFO — `/lexique` has DefinedTermSet but no individual DefinedTerm nodes
The DefinedTermSet node groups the lexique but the individual term entries have no standalone `DefinedTerm` schema with `@id`. If individual term pages exist (e.g., `/lexique/cordiste`), each should carry a `DefinedTerm` with `inDefinedTermSet` linking back. If they are anchor-only, this is acceptable.

---

## Missing Opportunities (ranked by impact)

| Rank | Type | Page(s) | Estimated Impact |
|---|---|---|---|
| 1 | Fix `author`+`publisher` on Blog listing BlogPosting | `/blog` | High — Article rich result eligibility for all blog cards |
| 2 | Remove or replace `HowTo` | `/cordiste-copropriete` | Medium — eliminates dead schema, replace with ItemList |
| 3 | Slim `provider` to `@id`-only reference | All city + city×service pages | Medium — correct @id graph linking, reduce payload |
| 4 | `AggregateRating` on Organization | Homepage | Medium — star snippet in brand SERP if Trustpilot data accessible |
| 5 | `VideoObject` | Future video content | Low — not applicable yet, no video pages detected |

---

## Fix 1 — Blog listing BlogPosting author/publisher (JSON-LD patch)

In the `Blog` node's `blogPost` array, each item should include:

```json
"author": {
  "@type": "Person",
  "@id": "https://www.lescordistes.com/auteur/anthony-profit#person",
  "name": "Anthony Profit"
},
"publisher": {
  "@type": "Organization",
  "@id": "https://www.lescordistes.com/#organization",
  "name": "LesCordistes.com"
}
```

## Fix 2 — Replace HowTo on /cordiste-copropriete

Replace the `HowTo` node with an `ItemList`:

```json
{
  "@type": "ItemList",
  "@id": "https://www.lescordistes.com/cordiste-copropriete#workflow",
  "name": "Comment obtenir et faire voter des devis cordistes en assemblée générale",
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "numberOfItems": 4,
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Publier le besoin de la copropriété"},
    {"@type": "ListItem", "position": 2, "name": "Recevoir et comparer les devis cordistes"},
    {"@type": "ListItem", "position": 3, "name": "Préparer le dossier AG"},
    {"@type": "ListItem", "position": 4, "name": "Démarrer le chantier après vote"}
  ]
}
```

## Fix 3 — Slim provider on city pages

```json
"provider": {
  "@id": "https://www.lescordistes.com/#organization"
}
```
