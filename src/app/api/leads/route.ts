import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

const CONSENT_SOURCES = ['wizard', 'city-hero', 'blog'] as const

export async function POST(req: NextRequest) {
    try {
        const { email, phone, category, city, step_reached, source, consent, consent_source } =
            await req.json()

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const admin = createSupabaseAdminClient()

        const basePayload = {
            email: email.toLowerCase().trim(),
            phone: phone || null,
            category: category || null,
            city: city || null,
            step_reached: step_reached ?? 1,
            source: source || 'wizard_step1',
            updated_at: new Date().toISOString(),
        }

        // Opt-in explicite (décision client 2026-09-01) : les champs consent
        // ne sont posés QUE si la case a été cochée. En upsert, les colonnes
        // absentes du payload ne sont pas touchées : un lead déjà consenti qui
        // resoumet sans cocher conserve son consentement.
        const hasConsent = consent === true
        const consentPayload = hasConsent
            ? {
                  ...basePayload,
                  consent_at: new Date().toISOString(),
                  consent_source:
                      typeof consent_source === 'string' &&
                      (CONSENT_SOURCES as readonly string[]).includes(consent_source)
                          ? consent_source
                          : null,
              }
            : basePayload

        let { error } = await (admin as any)
            .from('leads')
            .upsert(consentPayload, { onConflict: 'email' })

        // Colonne inconnue : migration 20260901c pas encore passée.
        // PostgREST renvoie PGRST204 ("column not found in schema cache") pour
        // une colonne absente du payload d'écriture — 42703 gardé par ceinture.
        // On rejoue sans les champs consent — jamais de lead perdu pour une
        // migration en retard.
        if ((error?.code === 'PGRST204' || error?.code === '42703') && hasConsent) {
            ;({ error } = await (admin as any)
                .from('leads')
                .upsert(basePayload, { onConflict: 'email' }))
        }

        if (error) {
            console.error('Lead upsert error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ ok: true })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('leads POST error:', msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
