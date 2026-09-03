import type { LifecycleStage } from '@/lib/types/crm'
import { STAGE_META } from './crmLabels'

type Props = {
    stage: LifecycleStage
    size?: 'sm' | 'md'
    /** Décrit la règle de calcul au survol. Désactivé dans les tableaux denses. */
    withHint?: boolean
}

/**
 * Pastille de stage. La couleur est un renfort, jamais le porteur de sens : le
 * libellé est toujours écrit, et `dormant` ajoute un liseré discontinu pour
 * rester distinguable sans perception des couleurs.
 *
 * Composant pur — rendu indifféremment côté serveur ou client.
 */
export function StageBadge({ stage, size = 'md', withHint = false }: Props) {
    const meta = STAGE_META[stage]
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${
                size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
            } ${meta.badge}`}
            title={withHint ? meta.hint : undefined}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
            {meta.label}
        </span>
    )
}
