import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { JobBoard } from '@/views/JobBoard'
import { SEO_BASE_URL } from '@/constants/seoConfig'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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

async function getRecentJobs(): Promise<JobLite[]> {
    try {
        const supabase = await createSupabaseServerClient()
        // SSR : seulement les 'live' pour le JSON-LD ItemList (pas pertinent
        // d'indexer les expired comme "missions disponibles" pour SEO).
        const { data } = await supabase
            .from('jobs')
            .select('id, slug, title, description, location_city, location_department, category, created_at')
            .eq('status', 'live')
            .order('created_at', { ascending: false })
            .limit(30)
        return (data ?? []) as JobLite[]
    } catch {
        return []
    }
}

export default async function JobsPage() {
    const jobs = await getRecentJobs()

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

            {/* SSR SEO header — visible et crawlable. Le JobBoard interactif suit en dessous. */}
            <section className="bg-slate-900 text-white pt-24 pb-12">
                <div className="container max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-black mb-4">
                        Missions cordistes disponibles partout en France
                    </h1>
                    <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
                        Toutes les missions visibles gratuitement. Pour les pros : 1 crédit suffit pour
                        accéder aux coordonnées du client, sans commission sur le chantier.
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
                <JobBoard />
            </Suspense>
        </>
    )
}
