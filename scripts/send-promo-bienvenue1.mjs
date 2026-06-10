#!/usr/bin/env node
/**
 * Campagne email BIENVENUE1 — 1 crédit offert aux pros sans aucun unlock.
 *
 * Usage:
 *   node scripts/send-promo-bienvenue1.mjs              # dry-run (juste la liste)
 *   node scripts/send-promo-bienvenue1.mjs --send       # envoi réel
 *   node scripts/send-promo-bienvenue1.mjs --send --only=email@x.fr   # test sur un seul
 *
 * Lit .env.local pour VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Idempotent : log les sends dans .promo-campaign-sent.log (skip si déjà envoyé).
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LOG_FILE = path.join(ROOT, '.promo-campaign-sent.log')
const CAMPAIGN_ID = 'BIENVENUE1'

// Charge .env.local manuellement (pas de dotenv)
function loadEnv() {
    const envPath = path.join(ROOT, '.env.local')
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local introuvable à', envPath)
        process.exit(1)
    }
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
}

loadEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Manque VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans .env.local')
    process.exit(1)
}

const args = process.argv.slice(2)
const SEND     = args.includes('--send')
const ONLY     = args.find(a => a.startsWith('--only='))?.split('=')[1] || null

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

// Charge le log d'envoi (idempotence)
function loadSentLog() {
    if (!fs.existsSync(LOG_FILE)) return new Set()
    return new Set(
        fs.readFileSync(LOG_FILE, 'utf8')
          .split('\n')
          .filter(l => l.startsWith(CAMPAIGN_ID + ':'))
          .map(l => l.split(':')[1])
    )
}

function appendSent(userId, email) {
    fs.appendFileSync(LOG_FILE, `${CAMPAIGN_ID}:${userId}:${email}:${new Date().toISOString()}\n`)
}

async function fetchTargets() {
    // 1) Tous les pros
    const { data: pros, error: e1 } = await supabase
        .from('profiles')
        .select('id, email, first_name, full_name, role')
        .eq('role', 'pro')
    if (e1) throw e1

    // 2) IDs avec au moins 1 unlock
    const { data: unlocks, error: e2 } = await supabase
        .from('unlocked_leads')
        .select('pro_id')
    if (e2) throw e2
    const unlockedSet = new Set((unlocks || []).map(u => u.pro_id))

    // 3) Filtre : pros SANS aucun unlock + email présent
    return pros.filter(p => p.email && !unlockedSet.has(p.id))
}

function getFirstName(p) {
    if (p.first_name) return p.first_name
    if (p.full_name) return p.full_name.split(' ')[0]
    return ''
}

async function sendOne(pro) {
    const prenom = getFirstName(pro)
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: pro.email,
            subject: 'Votre crédit offert vous attend (1 crédit gratuit)',
            templateId: 'pro-credit-offer',
            data: {
                prenom,
                unsubscribeUrl: 'https://www.lescordistes.com/optout',
            },
        }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${text}`)
    return text
}

async function main() {
    console.log(`\n🎁 Campagne ${CAMPAIGN_ID}`)
    console.log(`Mode : ${SEND ? '🔴 SEND' : '🟢 DRY-RUN'}${ONLY ? ` (only=${ONLY})` : ''}`)
    console.log('─'.repeat(60))

    let targets = await fetchTargets()
    if (ONLY) targets = targets.filter(p => p.email === ONLY)

    const sent = loadSentLog()
    const fresh = targets.filter(p => !sent.has(p.id))
    const skipped = targets.length - fresh.length

    console.log(`Cibles : ${targets.length} pros sans unlock`)
    console.log(`Skip (déjà envoyé) : ${skipped}`)
    console.log(`À envoyer : ${fresh.length}`)
    console.log('')

    fresh.forEach((p, i) => {
        console.log(`  ${String(i + 1).padStart(2)}. ${p.email}  —  ${getFirstName(p) || '(sans prénom)'}`)
    })

    if (!SEND) {
        console.log(`\nℹ️  Dry-run terminé. Pour envoyer : node scripts/send-promo-bienvenue1.mjs --send`)
        return
    }

    if (fresh.length === 0) {
        console.log('\n✅ Rien à envoyer.')
        return
    }

    console.log(`\n⏳ Envoi en cours…`)
    let ok = 0, fail = 0
    for (const pro of fresh) {
        try {
            await sendOne(pro)
            appendSent(pro.id, pro.email)
            ok++
            console.log(`  ✅ ${pro.email}`)
        } catch (err) {
            fail++
            console.log(`  ❌ ${pro.email}  —  ${err.message}`)
        }
        // Throttle léger pour Resend (largement sous la limite, mais propre)
        await new Promise(r => setTimeout(r, 250))
    }

    console.log(`\n📊 Récap : ${ok} envoyés, ${fail} échecs`)
}

main().catch(err => {
    console.error('💥', err)
    process.exit(1)
})
