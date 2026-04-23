// Audit trail des actions admin ops — toujours via service_role car la table
// admin_actions est protégée par RLS service_role-only en écriture.
// Cast `any` car @supabase/ssr v0.6 ↔ supabase-js v2.87 (cf. guard.ts).

import { createSupabaseAdminClient } from '@/lib/supabase-server'

export type AuditPayload = {
    action: string
    target_table: string
    target_id?: string | null
    payload?: Record<string, unknown>
    performed_by: string
}

export async function logAdminAction(input: AuditPayload): Promise<void> {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any
    const { error } = await admin.from('admin_actions').insert({
        action: input.action,
        target_table: input.target_table,
        target_id: input.target_id ?? null,
        payload: input.payload ?? {},
        performed_by: input.performed_by,
    })
    if (error) {
        console.error('[admin_actions] insert failed', { error, input })
    }
}
