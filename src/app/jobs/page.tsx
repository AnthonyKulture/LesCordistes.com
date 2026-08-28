import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { JobBoard } from '@/views/JobBoard'
import { SEO_BASE_URL } from '@/constants/seoConfig'
import { createSupabasePublicReadClient } from '@/lib/supabase-server'
import { JOB_CARD_COLUMNS } from '@/constants/jobColumns'
import type { Job } from '@/types'

export const revalidate = 60 // ISR: re-render au plus toutes les 60 secondes

export const metadata: Metadata = {
    title: 'Missions cordistes en France',
    description: "Missions cordistes disponibles partout en France : nettoyage façade, maintenance industrielle, génie civil. Postulez sans intermédiaire.",
    alternates: {
        canonical: `${SEO_BASE_URL}/jobs`,
    },
    openGraph: {
        title: 'Missions cordistes en France · LesCordistes',
        description: "Missions cordistes disponibles partout en France : nettoyage façade, maintenance industrielle, génie civil.",
        url: `${SEO_BASE_URL}/jobs`,
        images: [{ url: `${SEO_BASE_URL}/lescordistes.com-3.webp`, width: 1200, height: 630 }],
    },
}

interface JobLite {
    id: string
    slug: string | null
    title: string
    description: string
    location_city: string
    location_department: string | null
    category: string
    created_at: string
}

// Doit rester aligné sur PAGE_SIZE dans src/views/JobBoard.tsx : c'est la taille
// de la première page que JobBoard demande, donc celle de son initialData.
const BOARD_PAGE_SIZE = 50

interface JobsPageData {
    seoJobs: JobLite[]
    boardJobs: Job[]
    fetchedAt: number
}

async function getJobsPageData(): Promise<JobsPageData> {
    try {
        // Client anonyme : aucune session, aucun cookie lu → l'ISR reste active.
        // Les deux requêtes ne portent que des données publiques (RLS `anon`).
        const supabase = createSupabasePublicReadClient()

        const [seo, board] = await Promise.all([
            // SSR : seulement les 'live' pour le JSON-LD ItemList (pas pertinent
            // d'indexer les expired comme "missions disponibles" pour SEO).
            supabase
                .from('jobs')
                .select('id, slug, title, description, location_city, location_department, category, created_at')
                .eq('status', 'live')
                .order('created_at', { ascending: false })
                .limit(30),
            // Requête identique à celle de JobBoard → sert d'initialData au client.
            supabase
                .from('jobs')
                .select(`${JOB_CARD_COLUMNS}, creator:profiles!created_by(role)`)
                .in('status', ['live', 'expired', 'completed'])
                .order('created_at', { ascending: false })
                .limit(BOARD_PAGE_SIZE),
        ])

        return {
            seoJobs: (seo.data ?? []) as JobLite[],
            boardJobs: (board.data ?? []) as Job[],
            fetchedAt: Date.now(),
        }
    } catch {
        return { seoJobs: [], boardJobs: [], fetchedAt: Date.now() }
    }
}

export default async function JobsPage() {
    const { seoJobs: jobs, boardJobs, fetchedAt } = await getJobsPageData()

    const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Missions cordistes disponibles · LesCordistes',
        url: `${SEO_BASE_URL}/jobs`,
        numberOfItems: jobs.length,
        itemListElement: jobs.map((j, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: j.slug ? `${SEO_BASE_URL}/jobs/${j.slug}` : `${SEO_BASE_URL}/jobs`,
            name: j.title,
        })),
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
            />

            {/* SSR SEO header — visible et crawlable. Compact + design plus brandé.
                Padding symétrique top/bottom pour centrage vertical visuel. */}
            <section className="bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-light text-white py-10 md:py-16">
                <div style={{ textAlign: 'center' }} className="mx-auto max-w-2xl px-4 sm:px-6">
                    <h1 className="text-xl md:text-3xl font-black mb-2 md:mb-3 leading-tight">
                        Missions cordistes
                        <br className="md:hidden" />
                        <span className="hidden md:inline"> </span>
                        partout en France
                    </h1>
                    <p className="text-xs md:text-base text-slate-100/90 leading-relaxed">
                        Consultation libre. Côté pros : <strong className="text-white">1 à 5 crédits</strong> selon la mission pour accéder aux coordonnées
                        <span className="hidden md:inline"> — </span>
                        <br className="md:hidden" />
                        <strong className="text-white">zéro commission</strong> sur le chantier.
                    </p>
                </div>
            </section>

            {/* Maillage interne SSR pour les crawlers — caché visuellement (les missions sont dans le JobBoard) */}
            <div className="sr-only">
                {jobs.length > 0 && (
                    <ul>
                        {jobs.map((j) => (
                            <li key={j.id}>
                                {j.slug ? (
                                    <Link href={`/jobs/${j.slug}`}>{j.title} — {j.location_city}</Link>
                                ) : (
                                    <span>{j.title} — {j.location_city}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                <h2>Comment fonctionnent les missions cordistes sur LesCordistes.com&nbsp;?</h2>
                <p>
                    Les clients (particuliers, entreprises, collectivités) publient leur besoin en 3 minutes
                    via le formulaire <Link href="/post-job">Publier un projet</Link>. Les cordistes professionnels
                    inscrits parcourent le tableau des missions, identifient celles qui correspondent à leur
                    profil et leur zone d'intervention (rayon moyen de 30 km), puis débloquent les coordonnées
                    du client avec un crédit. Le devis et la négociation s'effectuent ensuite en direct, sans
                    intermédiaire.
                </p>
                <h2>Vous êtes cordiste&nbsp;?</h2>
                <p>
                    Créez votre profil gratuit sur <Link href="/inscription-cordiste">/inscription-cordiste</Link>,
                    téléchargez vos certifications (CQP Cordiste ou IRATA) et votre attestation RC Pro. Une fois
                    votre compte validé, vous pouvez débloquer toute mission qui vous intéresse en quelques
                    secondes.
                </p>
            </div>

            <Suspense fallback={null}>
                {/* initialData seulement si le SSR a réellement ramené des lignes :
                    un tableau vide serait servi comme "aucune mission" pendant tout
                    le staleTime en cas d'échec de la requête serveur. */}
                <JobBoard
                    initialJobs={boardJobs.length > 0 ? boardJobs : undefined}
                    initialJobsUpdatedAt={fetchedAt}
                />
            </Suspense>
        </>
    )
}
