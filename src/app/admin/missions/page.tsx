import { MissionsList } from './MissionsList'
import { fetchAdminJobs, isMissionTabStatus, type MissionTabStatus } from './jobsQuery'
import { isCurrentUserAdmin } from '@/lib/ops/guard'

export const metadata = {
    title: 'Missions · Admin',
}

const DEFAULT_STATUS: MissionTabStatus = 'pending'

export default async function MissionsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const sp = await searchParams
    const status = isMissionTabStatus(sp.status) ? sp.status : DEFAULT_STATUS
    // Fail-closed : le layout redirige déjà les non-admins, mais layout et page sont
    // rendus concurremment — sans ce garde, la requête service_role partirait quand même.
    const initialJobs = (await isCurrentUserAdmin()) ? await fetchAdminJobs(status, 100) : null

    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Missions</h1>
                <p className="text-sm text-slate-500">Modération et suivi du flux de leads.</p>
            </header>
            <MissionsList initialStatus={status} initialJobs={initialJobs} />
        </div>
    )
}
