'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Job } from '../types'

export type JobContact = Job['client_contact_info']

/**
 * Coordonnées client d'une mission, via le RPC `get_job_contact`.
 *
 * La colonne `jobs.client_contact_info` n'est plus lisible directement par les
 * rôles anon/authenticated (migration 20260828-revoke-client-contact-info.sql).
 * Le RPC renvoie les coordonnées uniquement au propriétaire de la mission, à un
 * admin, ou à un pro ayant débloqué le lead — et NULL sinon.
 *
 * @param jobId  mission concernée
 * @param enabled  ne déclencher que quand l'accès est plausible (évite un appel
 *                 systématique qui renverrait NULL)
 */
export function useJobContact(jobId: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: ['job-contact', jobId],
        queryFn: async (): Promise<JobContact | null> => {
            if (!jobId) return null
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const { data, error } = await (supabase as any).rpc('get_job_contact', { p_job_id: jobId })
            if (error) throw error
            return (data ?? null) as JobContact | null
        },
        enabled: !!jobId && enabled,
        staleTime: 5 * 60 * 1000,
    })
}

/**
 * Version batch : coordonnées de plusieurs missions en un seul appel (RPC
 * `get_job_contacts`). Évite un N+1 sur les listes de leads débloqués.
 * Les missions non autorisées sont simplement absentes du résultat.
 */
export function useJobContacts(jobIds: string[] | undefined) {
    const ids = jobIds ?? []
    return useQuery({
        queryKey: ['job-contacts', [...ids].sort().join(',')],
        queryFn: async (): Promise<Record<string, JobContact>> => {
            if (ids.length === 0) return {}
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const { data, error } = await (supabase as any).rpc('get_job_contacts', { p_job_ids: ids })
            if (error) throw error
            const rows = (data ?? []) as Array<{ job_id: string; contact: JobContact }>
            return Object.fromEntries(rows.map(r => [r.job_id, r.contact]))
        },
        enabled: ids.length > 0,
        staleTime: 5 * 60 * 1000,
    })
}
