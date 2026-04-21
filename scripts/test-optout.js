#!/usr/bin/env node
/**
 * Test de la route GET /optout
 *
 * Prérequis :
 *   - Serveur Next.js en cours (npm run dev)
 *   - OPTOUT_SECRET et SUPABASE_SERVICE_ROLE_KEY dans .env.local
 *   - Un prospect existant en base → passer son UUID via --id=<uuid>
 *
 * Usage :
 *   node scripts/test-optout.js --id=<prospect_uuid> [--base=http://localhost:3000]
 */

const { createHmac } = require('crypto')

const args = Object.fromEntries(
    process.argv.slice(2).map(a => a.replace('--', '').split('='))
)

const BASE = args.base ?? 'http://localhost:3000'
const PROSPECT_ID = args.id

if (!PROSPECT_ID) {
    console.error('Usage: node scripts/test-optout.js --id=<prospect_uuid>')
    process.exit(1)
}

const SECRET = process.env.OPTOUT_SECRET
if (!SECRET) {
    console.error('Manquant: OPTOUT_SECRET (source .env.local ou export)')
    process.exit(1)
}

function generateToken(prospectId, secret) {
    const sig = createHmac('sha256', secret)
        .update(prospectId)
        .digest('hex')
        .slice(0, 16)
    return Buffer.from(`${prospectId}.${sig}`).toString('base64url')
}

async function hit(url, label) {
    const res = await fetch(url)
    const text = await res.text()
    const ok = res.status >= 200 && res.status < 300
    const icon = ok ? '✓' : '✗'
    console.log(`\n${icon} [${res.status}] ${label}`)
    const match = text.match(/<h1>(.*?)<\/h1>/)
    if (match) console.log(`   Page: "${match[1]}"`)
    return res.status
}

;(async () => {
    const validToken = generateToken(PROSPECT_ID, SECRET)
    const invalidToken = generateToken(PROSPECT_ID, SECRET + 'bad')
    const badToken = 'notavalidtoken'

    console.log(`\n=== Test optout — ${BASE} ===`)
    console.log(`Prospect ID : ${PROSPECT_ID}`)
    console.log(`Token valide: ${validToken}`)

    // 1. Sans token → 400
    await hit(`${BASE}/optout`, 'Sans token → attend 400')

    // 2. Token invalide → 400
    await hit(`${BASE}/optout?token=${invalidToken}`, 'Token invalide → attend 400')

    // 3. Token corrompu → 400
    await hit(`${BASE}/optout?token=${badToken}`, 'Token corrompu → attend 400')

    // 4. Premier appel valide → 200 (opt_out=true)
    const s1 = await hit(`${BASE}/optout?token=${validToken}`, '1er appel valide → attend 200 "Vous êtes désinscrit"')

    // 5. Deuxième appel (idempotence) → 200 "Déjà désinscrit"
    const s2 = await hit(`${BASE}/optout?token=${validToken}`, '2e appel (idempotence) → attend 200 "Déjà désinscrit"')

    console.log('\n=== Résumé ===')
    console.log(`Tests passés : ${[s1, s2].filter(s => s === 200).length}/2 succès attendus`)
    console.log('Vérifier manuellement en DB :')
    console.log(`  SELECT opt_out, status FROM prospects WHERE id = '${PROSPECT_ID}';`)
    console.log(`  SELECT kind, payload, created_by FROM activities WHERE prospect_id = '${PROSPECT_ID}' ORDER BY created_at DESC LIMIT 3;`)
})()
