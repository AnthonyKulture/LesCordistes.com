import { ProfilesList } from './ProfilesList'
import { fetchAdminProfiles, isAdminRole, type AdminRole } from './profilesQuery'
import { isCurrentUserAdmin } from '@/lib/ops/guard'

export const metadata = {
    title: 'Profils · Admin',
}

const DEFAULT_ROLE: AdminRole = 'pro'

export default async function ProfilesPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string }>
}) {
    const sp = await searchParams
    const role = isAdminRole(sp.role) ? sp.role : DEFAULT_ROLE
    // Fail-closed : le layout redirige déjà les non-admins, mais layout et page sont
    // rendus concurremment — sans ce garde, la requête service_role partirait quand même.
    const initialProfiles = (await isCurrentUserAdmin()) ? await fetchAdminProfiles(role, 200) : null

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Profils</h1>
                <p className="text-sm text-slate-500">Pros, clients, ajustement de crédits.</p>
            </header>
            <ProfilesList initialRole={role} initialProfiles={initialProfiles} />
        </div>
    )
}
