import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createSupabasePublicReadClient } from '@/lib/supabase-server'
import { PublicProfile } from '@/views/PublicProfile'
import { SEO_BASE_URL } from '@/constants/seoConfig'
import { PROFILE_PUBLIC_COLUMNS } from '@/constants/jobColumns'
import { isProfileIndexable } from '@/lib/profileSeo'
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
type ProLookup = { pro: Profile | null; missing: boolean }

const getPro = cache(async (id: string): Promise<ProLookup> => {
    try {
        const supabase = createSupabasePublicReadClient()

        const run = (cols: string) =>
            supabase.from('profiles').select(cols).eq('id', id).eq('role', 'pro').single()

        let { data, error } = await run(PROFILE_PUBLIC_COLUMNS)

        // 42703 = colonne inconnue : `seo_indexable` n'existe pas tant que la
        // migration 20260828i n'est pas passée. Sans ce repli, TOUTES les pages
        // profil casseraient si le déploiement précédait la migration.
        if (error && (error as { code?: string }).code === '42703') {
            const fallbackCols = PROFILE_PUBLIC_COLUMNS.split(', ')
                .filter((c) => c !== 'seo_indexable')
                .join(', ')
            ;({ data, error } = await run(fallbackCols))
        }

        // PGRST116 = `.single()` sans résultat : le profil n'existe pas (ou plus).
        // On le distingue d'un incident réseau/permission pour pouvoir répondre
        // un vrai 404 : servir 200 avec le nom d'une personne dont le compte est
        // supprimé retarde sa désindexation et contrarie le droit à l'effacement.
        if (error) {
            return { pro: null, missing: (error as { code?: string }).code === 'PGRST116' }
        }
        if (!data) return { pro: null, missing: true }
        return { pro: data as Profile, missing: false }
    } catch {
        return { pro: null, missing: false }
    }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const { pro } = await getPro(id)

    if (!pro) {
        return {
            title: 'Profil introuvable',
            robots: { index: false, follow: true },
        }
    }

    const name = pro.full_name?.trim() || 'Cordiste professionnel'
    const mainCity = pro.intervention_zones?.[0]
    const skills = pro.skills?.slice(0, 3).join(', ') || 'accès difficile'

    // Un profil peut être indexable SANS `intervention_zones` (bio + skills +
    // certifications suffisent à atteindre le seuil). Ne jamais produire
    // « Cordiste à France » dans un <title> indexé.
    const title = mainCity
        ? `${name} · Cordiste à ${mainCity}`
        : `${name} · Cordiste professionnel`
    const where = mainCity ? ` intervenant à ${mainCity}` : ''
    // Ne pas affirmer des certifications que le pro n'a pas déclarées.
    const certs = pro.certifications?.length
        ? ' Certifications CQP / IRATA déclarées sur LesCordistes.'
        : ''
    const description = `Profil de ${name}, cordiste professionnel${where}. Spécialités : ${skills}.${certs}`

    return {
        title,
        description,
        // Page toujours générée et accessible, mais hors index tant que le profil
        // est vide : même doctrine anti-doorway que les pages ville × service.
        // `follow` reste actif pour ne pas couper le maillage interne.
        robots: isProfileIndexable(pro) ? undefined : { index: false, follow: true },
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
    const { pro, missing } = await getPro(id)

    // Profil inexistant ou supprimé → vrai 404. Un incident transitoire (réseau,
    // permission) laisse au contraire la vue client tenter sa propre requête.
    if (missing) notFound()

    return <PublicProfile initialPro={pro} />
}
