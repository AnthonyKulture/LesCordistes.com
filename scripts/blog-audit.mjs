#!/usr/bin/env node
/**
 * blog-audit.mjs — Audit de couverture éditoriale du blog LesCordistes.
 *
 * Croise les articles publiés (src/constants/seoBlog.ts) avec la matrice
 * éditoriale (.claude/editorial/taxonomy.json) et produit le brief du
 * prochain article : cluster en déficit, persona et format imposés.
 *
 * Usage :
 *   node scripts/blog-audit.mjs            # les deux audiences
 *   node scripts/blog-audit.mjs pro        # côté cordistes
 *   node scripts/blog-audit.mjs client     # côté clients
 *   node scripts/blog-audit.mjs pro --json # sortie machine
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BLOG = join(ROOT, 'src/constants/seoBlog.ts')
const TAXO = join(ROOT, '.claude/editorial/taxonomy.json')

/** Fenêtre d'exclusion : un cluster/format/persona des N derniers articles est interdit. */
const RECENT_WINDOW = 4

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const audience = args.find((a) => a === 'pro' || a === 'client') ?? null

const taxonomy = JSON.parse(readFileSync(TAXO, 'utf8'))
const source = readFileSync(BLOG, 'utf8')

// --- Extraction des articles publiés -----------------------------------------

const published = []
const slugRe = /^\s{8}slug: '([^']+)'/gm
let m
while ((m = slugRe.exec(source)) !== null) {
    const slug = m[1]
    const tail = source.slice(m.index, m.index + 4000)
    const grab = (field) => tail.match(new RegExp(`${field}: '([^']*)'`))?.[1] ?? null
    published.push({
        slug,
        title: grab('title'),
        category: grab('category'),
        datePublished: grab('datePublished'),
        offset: m.index,
    })
}

if (published.length === 0) {
    console.error('✗ Aucun article détecté dans seoBlog.ts — le parseur est à revoir.')
    process.exit(1)
}

// Ordre de publication = ordre dans le tableau (le plus récent en dernier).
const byRecency = [...published].reverse()

// --- Étiquetage ---------------------------------------------------------------

const untagged = []
for (const a of published) {
    const tags = taxonomy.articles[a.slug]
    if (!tags) {
        untagged.push(a.slug)
        a.cluster = null
        continue
    }
    Object.assign(a, tags)
    a.audience = taxonomy.clusters[tags.cluster]?.audience ?? null
}

// --- Comptages ---------------------------------------------------------------

const count = (key) => {
    const out = {}
    for (const a of published) if (a[key]) out[a[key]] = (out[a[key]] ?? 0) + 1
    return out
}
const byCluster = count('cluster')
const byPersona = count('persona')
const byFormat = count('format')

const recent = byRecency.slice(0, RECENT_WINDOW)
const recentClusters = new Set(recent.map((a) => a.cluster).filter(Boolean))
const recentFormats = new Set(recent.map((a) => a.format).filter(Boolean))
const recentPersonas = new Set(recent.map((a) => a.persona).filter(Boolean))

// --- Sélection du prochain sujet ---------------------------------------------

const isFrozen = (c) => /GEL|SATUR/i.test(taxonomy.clusters[c].note ?? '')

function rankClusters(aud) {
    return Object.entries(taxonomy.clusters)
        .filter(([, c]) => c.audience === aud)
        .map(([id, c]) => {
            const n = byCluster[id] ?? 0
            const blockers = []
            if (isFrozen(id)) blockers.push('gelé/saturé')
            if (recentClusters.has(id)) blockers.push(`servi dans les ${RECENT_WINDOW} derniers`)
            return { id, label: c.label, count: n, blockers, priorite: c.priorite ?? 2, cluster: c }
        })
        .sort((a, b) => a.blockers.length - b.blockers.length || a.count - b.count || b.priorite - a.priorite || a.id.localeCompare(b.id))
}

function pickNext(aud) {
    const ranked = rankClusters(aud)
    const eligible = ranked.filter((r) => r.blockers.length === 0)
    const chosen = eligible[0] ?? ranked[0]
    if (!chosen) return null

    const personas = chosen.cluster.personas ?? []
    const persona =
        personas.find((p) => !recentPersonas.has(p) && !byPersona[p]) ??
        personas.find((p) => !recentPersonas.has(p)) ??
        personas[0] ??
        null

    const formats = Object.keys(taxonomy.formats).filter((f) => f !== 'guide')
    const format =
        formats.find((f) => !recentFormats.has(f) && !byFormat[f]) ??
        formats.find((f) => !recentFormats.has(f)) ??
        formats[0]

    return { audience: aud, ...chosen, persona, format, runnersUp: eligible.slice(1, 4) }
}

const targets = audience ? [audience] : ['pro', 'client']
const briefs = targets.map(pickNext).filter(Boolean)

// --- Sortie ------------------------------------------------------------------

if (asJson) {
    console.log(JSON.stringify({ published: published.length, untagged, byCluster, byPersona, byFormat, briefs }, null, 2))
    process.exit(0)
}

const bar = (n, max) => '█'.repeat(n) + '·'.repeat(Math.max(0, max - n))
const maxCount = Math.max(1, ...Object.values(byCluster))

console.log(`\n═══ AUDIT ÉDITORIAL — ${published.length} articles publiés ═══\n`)

if (untagged.length) {
    console.log(`⚠  ${untagged.length} article(s) non étiqueté(s) dans taxonomy.json :`)
    untagged.forEach((s) => console.log(`   • ${s}`))
    console.log(`   → Ajoute-les dans "articles" avant de publier.\n`)
}

console.log(`── Derniers ${RECENT_WINDOW} publiés (fenêtre d'exclusion) ──`)
recent.forEach((a) => console.log(`   ${a.datePublished ?? '?'.padEnd(10)}  ${a.slug}\n              cluster=${a.cluster ?? '—'}  persona=${a.persona ?? '—'}  format=${a.format ?? '—'}`))

for (const aud of targets) {
    console.log(`\n── Couverture par cluster — côté ${aud.toUpperCase()} ──`)
    for (const r of rankClusters(aud)) {
        const flag = r.blockers.length ? ` ⛔ ${r.blockers.join(', ')}` : r.count === 0 ? ' ← VIERGE' : ''
        console.log(`   ${String(r.count).padStart(2)} ${bar(r.count, maxCount).padEnd(maxCount)}  ${r.id.padEnd(30)} ${r.label}${flag}`)
    }
}

console.log(`\n── Formats utilisés ──`)
for (const f of Object.keys(taxonomy.formats)) {
    const n = byFormat[f] ?? 0
    console.log(`   ${String(n).padStart(2)}  ${f.padEnd(14)} ${taxonomy.formats[f].label}${n === 0 ? ' ← jamais utilisé' : ''}`)
}

console.log(`\n══════════════ BRIEF IMPOSÉ ══════════════`)
for (const b of briefs) {
    const c = b.cluster
    console.log(`\n▸ CÔTÉ ${b.audience.toUpperCase()}`)
    console.log(`  Cluster  : ${b.id} — ${b.label}  (${b.count} article${b.count > 1 ? 's' : ''})`)
    console.log(`  Persona  : ${b.persona}  — ${taxonomy.personas[b.persona]?.label ?? '?'}`)
    console.log(`             douleur : ${taxonomy.personas[b.persona]?.douleur ?? '?'}`)
    console.log(`  Format   : ${b.format} — ${taxonomy.formats[b.format].label}`)
    console.log(`             ${taxonomy.formats[b.format].note}`)
    console.log(`  Requêtes à travailler :`)
    ;(c.requetes ?? []).forEach((q) => console.log(`             • ${q}`))
    if (c.note) console.log(`  Note     : ${c.note}`)
    if (b.blockers.length) console.log(`  ⚠ Aucun cluster libre — celui-ci est retenu par défaut (${b.blockers.join(', ')}).`)
    if (b.runnersUp.length) console.log(`  Replis   : ${b.runnersUp.map((r) => r.id).join(', ')}`)
}
console.log(`\n⚠ Le brief n'est pas une suggestion. Pour t'en écarter, il faut une raison factuelle`)
console.log(`  (cluster déjà couvert par le SEO programmatique, actualité majeure ailleurs) — à énoncer.\n`)
