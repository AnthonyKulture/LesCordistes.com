import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminShell } from '@/components/admin/AdminShell'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Admin Ops · LesCordistes',
    robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const supabase = (await createSupabaseServerClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/connexion?next=/admin')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') redirect('/dashboard')

    const { count: pendingCount } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

    return (
        <AdminShell
            adminEmail={profile?.email ?? user.email ?? ''}
            adminName={profile?.full_name ?? null}
            pendingCount={pendingCount ?? 0}
        >
            {children}
        </AdminShell>
    )
}
