import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
        const { email, phone, category, city, step_reached, source } = await req.json()

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const admin = createSupabaseAdminClient()

        const { error } = await (admin as any).from('leads').upsert(
            {
                email: email.toLowerCase().trim(),
                phone: phone || null,
                category: category || null,
                city: city || null,
                step_reached: step_reached ?? 1,
                source: source || 'wizard_step1',
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
        )

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
