import type { Metadata } from 'next'
import { cache } from 'react'
import { createSupabasePublicReadClient } from '@/lib/supabase-server'
import { JOB_PUBLIC_COLUMNS } from '@/constants/jobColumns'
import { JobDetail } from '@/views/JobDetail'
import { SEO_BASE_URL } from '@/constants/seoConfig'
import type { Job } from '@/types'

export const revalidate = 60 // ISR: même fenêtre de fraîcheur que /jobs

// Sans generateStaticParams, un segment dynamique reste `ƒ` : rendu à CHAQUE
// requête, `revalidate` ignoré. Retourner [] ne prérend rien au build (aucune
// dépendance à la base) mais rend la route éligible à l'ISR : chaque slug est
// généré au premier hit puis mis en cache pour la fenêtre ci-dessus.
export async function generateStaticParams() {
    return []
}

const categoryLabels: Record<string, string> = {
    cleaning: 'Nettoyage de façade',
    construction: 'Construction',
    masonry: 'Maçonnerie',
    painting: 'Peinture',
    industry: 'Industrie',
    event: 'Événementiel',
    securing: 'Sécurisation',
    telecom: 'Télécommunications',
    inspection: 'Inspection',
    repair: 'Dépannage',
    pruning: 'Élagage & Végétaux',
    other: 'Travaux en hauteur',
}

interface Props {
    params: Promise<{ slug: string }>
}

const getJob = cache(async (slug: string): Promise<Job | null> => {
    try {
        // Client anonyme : lecture publique, aucune session → l'ISR reste active.
        const supabase = createSupabasePublicReadClient()
        // 'live' (active), 'expired' (J+15) et 'completed' (terminée) accessibles publiquement.
        // 'pending', 'rejected', 'cancelled' restent cachés.
        const { data, error } = await supabase
            .from('jobs')
            .select(JOB_PUBLIC_COLUMNS)
            .eq('slug', slug)
            .in('status', ['live', 'expired', 'completed'])
            .single()
        if (error || !data) return null
        return data as Job
    } catch {
        return null
    }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const job = await getJob(slug)

    if (!job) {
        return {
            title: 'Mission introuvable — LesCordistes',
        }
    }

    const category = categoryLabels[job.category] ?? 'Travaux en hauteur'
    const title = `${job.title} · ${job.location_city} · LesCordistes`
    const description = `Mission de ${category.toLowerCase()} à ${job.location_city}. ${job.description.slice(0, 120).replace(/\n/g, ' ')}…`

    return {
        title,
        description,
        alternates: {
            canonical: `${SEO_BASE_URL}/jobs/${slug}`,
        },
        openGraph: {
            title,
            description,
            url: `${SEO_BASE_URL}/jobs/${slug}`,
            type: 'article',
            images: job.photos_url?.[0]
                ? [{ url: job.photos_url[0], width: 1200, height: 630, alt: job.title }]
                : [{ url: `${SEO_BASE_URL}/lescordistes.com-3.webp`, width: 1200, height: 630 }],
        },
    }
}

function buildJobPostingSchema(job: Job, slug: string) {
    const baseSalary = job.budget_min || job.budget_max || job.daily_rate
        ? {
            '@type': 'MonetaryAmount',
            currency: 'EUR',
            ...(job.daily_rate
                ? { value: { '@type': 'QuantitativeValue', value: job.daily_rate, unitText: 'DAY' } }
                : {
                    value: {
                        '@type': 'QuantitativeValue',
                        ...(job.budget_min ? { minValue: job.budget_min } : {}),
                        ...(job.budget_max ? { maxValue: job.budget_max } : {}),
                        unitText: 'TOTAL',
                    },
                }),
          }
        : undefined

    return {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.created_at,
        ...(job.deadline ? { validThrough: job.deadline } : job.expired_at ? { validThrough: job.expired_at } : {}),
        employmentType: job.contract_type === 'subcontracting' ? 'CONTRACTOR' : 'OTHER',
        hiringOrganization: {
            '@type': 'Organization',
            name: job.client_contact_info?.company_name || 'Confidentiel',
            ...(job.client_contact_info?.company_name ? {} : { sameAs: SEO_BASE_URL, logo: `${SEO_BASE_URL}/lescordistes.com-white-logo.png` })
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: job.location_city,
                addressCountry: 'FR',
                ...(job.location_department ? { addressRegion: job.location_department } : {}),
                ...(job.location_address ? { streetAddress: job.location_address } : {}),
            },
        },
        ...(baseSalary ? { baseSalary } : {}),
        url: `${SEO_BASE_URL}/jobs/${slug}`,
        ...(job.photos_url?.[0] ? { image: job.photos_url[0] } : {}),
        occupationalCategory: categoryLabels[job.category] ?? 'Travaux en hauteur',
        skills: 'Travaux sur cordes, accès difficile',
        jobBenefits: 'Mission ponctuelle, paiement à la prestation',
        identifier: {
            '@type': 'PropertyValue',
            name: 'LesCordistes',
            value: job.id,
        },
    }
}

export default async function JobDetailPage({ params }: Props) {
    const { slug } = await params
    const job = await getJob(slug)

    return (
        <>
            {job && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(buildJobPostingSchema(job, slug)),
                    }}
                />
            )}
            <JobDetail initialJob={job} />
        </>
    )
}
