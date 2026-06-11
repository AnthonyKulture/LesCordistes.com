import { DashboardShell } from './DashboardShell'
import { fetchOpsStats } from '@/lib/ops/fetchOpsStats'

export const metadata = {
    title: 'Dashboard · Admin',
}

// ✅ Phase 2: Server Component async — données chargées AVANT hydratation,
// plus de spinner visible lors de la première ouverture du dashboard.
export default async function AdminDashboardPage() {
    const initialStats = await fetchOpsStats()
    return <DashboardShell initialStats={initialStats} />
}
