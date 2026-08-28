import type { Metadata } from 'next'
import { cache } from 'react'
import { createSupabasePublicReadClient } from '@/lib/supabase-server'
import { PublicProfile } from '@/views/PublicProfile'
import { SEO_BASE_URL } from '@/constants/seoConfig'
import { PROFILE_PUBLIC_COLUMNS } from '@/constants/jobColumns'
import type { Profile } from '@/types'

export const revalidate = 60

// Voir jobs/[slug] : sans generateStaticParams, `revalidate` est inopérant sur un
// segment dynamique. [] = aucun prérendu au build, mais cache ISR au premier hit.
export async function generateStaticParams() {
    return []
}

interface Props {
    params: Promise<{ id: string }>
}

// Client public sans cookies : garde la page statique/ISR (createSupabaseServerClient
// lit les cookies et forcerait un rendu dynamique par requête).
// Colonnes publiques uniquement : le payload RSC est lisible dans le source de
// la page par n'importe qui — email, téléphone et SIRET n'ont rien à y faire.
const getPro = cache(async (id: string): Promise<Profile | null> => {
    try {
        const supabase = createSupabasePublicReadClient()
        const { data, error } = await supabase
            .from('profiles')
            .select(PROFILE_PUBLIC_COLUMNS)
            .eq('id', id)
            .eq('role', 'pro')
            .single()
        if (error || !data) return null
        return data as Profile
    } catch {
        return null
    }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const pro = await getPro(id)

    if (!pro) {
        return {
            title: 'Profil introuvable',
            robots: { index: false, follow: true },
        }
    }

    const name = pro.full_name || 'Cordiste professionnel'
    const mainCity = pro.intervention_zones?.[0] || 'France'
    const skills = pro.skills?.slice(0, 3).join(', ') || 'accès difficile'
    const title = `${name} · Cordiste à ${mainCity}`
    const description = `Profil de ${name}, cordiste professionnel intervenant à ${mainCity}. Spécialités : ${skills}. Certifications CQP / IRATA déclarées sur LesCordistes.`

    return {
        title,
        description,
        alternates: {
            canonical: `${SEO_BASE_URL}/pros/${id}`,
        },
        openGraph: {
            title,
            description,
            url: `${SEO_BASE_URL}/pros/${id}`,
            type: 'profile',
        },
    }
}

export default async function PublicProfilePage({ params }: Props) {
    const { id } = await params
    const pro = await getPro(id)

    return <PublicProfile initialPro={pro} />
}
