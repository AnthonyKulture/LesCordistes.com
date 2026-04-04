import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = { name: string; value: string; options: Record<string, unknown> }

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet: CookieToSet[]) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
                    )
                },
            },
        }
    )

    // PKCE flow (OAuth + magic link)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) return NextResponse.redirect(`${origin}${next}`)
    }

    // Token hash flow (email confirmation, password recovery)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
        if (!error) return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(`${origin}/connexion?error=auth_callback_error`)
}
