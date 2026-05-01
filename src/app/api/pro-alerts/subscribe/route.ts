import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { FRENCH_DEPARTMENTS } from '@/constants/departments'

const VALID_DEPT_CODES = new Set(FRENCH_DEPARTMENTS.map(d => d.code))

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const email = typeof body?.email === 'string' ? body.email.trim() : ''
        const rawDepts = Array.isArray(body?.departments) ? body.departments : []
        const source = typeof body?.source === 'string' ? body.source.slice(0, 80) : 'jobs_page'

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const departments = Array.from(
            new Set(
                rawDepts
                    .filter((d: unknown): d is string => typeof d === 'string')
                    .map((d: string) => d.trim().toUpperCase())
                    .filter((d: string) => VALID_DEPT_CODES.has(d))
            )
        )

        if (departments.length === 0) {
            return NextResponse.json(
                { error: 'Sélectionnez au moins un département' },
                { status: 400 }
            )
        }
        if (departments.length > 20) {
            return NextResponse.json(
                { error: 'Maximum 20 départements par alerte' },
                { status: 400 }
            )
        }

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const admin = createSupabaseAdminClient() as any

        const { data, error } = await admin.rpc('subscribe_pro_alert', {
            p_email: email,
            p_departments: departments,
            p_source: source,
            p_metadata: {
                ua: req.headers.get('user-agent')?.slice(0, 200) ?? null,
                ts: new Date().toISOString(),
            },
        })

        if (error) {
            console.error('[pro-alerts/subscribe] RPC error:', error.message)
            return NextResponse.json(
                { error: 'Erreur interne. Réessayez dans un instant.' },
                { status: 500 }
            )
        }

        if (!data?.ok) {
            const code = data?.error ?? 'unknown'
            const message = code === 'invalid_email'
                ? 'Email invalide'
                : code === 'no_departments'
                    ? 'Sélectionnez au moins un département'
                    : 'Inscription impossible'
            return NextResponse.json({ error: message }, { status: 400 })
        }

        return NextResponse.json({
            ok: true,
            action: data.action,
            departments: data.departments,
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[pro-alerts/subscribe] error:', msg)
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
    }
}
