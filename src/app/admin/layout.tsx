import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getAdminIdentity } from '@/lib/ops/guard'
import { AdminShell } from '@/components/admin/AdminShell'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Admin Ops · LesCordistes',
    robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Identité mémoïsée par React.cache() : la page rendue en parallèle réutilise
    // cette même lecture au lieu d'en refaire une (getUser réseau + profiles).
    const { userId, role, fullName, email } = await getAdminIdentity()

    if (!userId) redirect('/connexion?next=/admin')
    if (role !== 'admin') redirect('/dashboard')

    // Rôle vérifié ci-dessus : on peut compter en service_role, ce qui évite
    // d'évaluer les 3 policies SELECT permissives de `jobs` (dont is_admin()).
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    const { count: pendingCount } = await admin
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

    return (
        <AdminShell
            adminEmail={email ?? ''}
            adminName={fullName}
            pendingCount={pendingCount ?? 0}
        >
            {children}
        </AdminShell>
    )
}
