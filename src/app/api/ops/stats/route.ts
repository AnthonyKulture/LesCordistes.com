import { requireAdmin } from '@/lib/ops/guard'
import { fetchOpsStats } from '@/lib/ops/fetchOpsStats'

export const dynamic = 'force-dynamic'

// Délègue à fetchOpsStats : même source que le pré-chargement serveur de
// admin/page.tsx (RPC unique admin_dashboard_stats, repli 16 requêtes).
// L'ancienne duplication des 16 requêtes dans cette route a été retirée.
export async function GET() {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const stats = await fetchOpsStats()
    if (!stats) {
        return Response.json({ error: 'stats unavailable' }, { status: 500 })
    }

    // Données admin authentifiées : jamais de cache partagé (edge/CDN)
    return Response.json(stats, {
        headers: { 'Cache-Control': 'private, no-store' },
    })
}
