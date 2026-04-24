import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { JobDetail } from '@/views/JobDetail'
import type { Job } from '@/types'

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

async function getJob(slug: string): Promise<Job | null> {
    try {
        const supabase = await createSupabaseServerClient()
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'live')
            .single()
        if (error || !data) return null
        return data as Job
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const job = await getJob(slug)

    if (!job) {
        return {
            title: 'Mission introuvable — LesCordistes',
        }
    }

    const category = categoryLabels[job.category] ?? 'Travaux en hauteur'
    const title = `${job.title} — ${job.location_city} | LesCordistes`
    const description = `Mission de ${category.toLowerCase()} à ${job.location_city}. ${job.description.slice(0, 120).replace(/\n/g, ' ')}…`

    return {
        title,
        description,
        alternates: {
            canonical: `https://lescordistes.com/jobs/${slug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://lescordistes.com/jobs/${slug}`,
            type: 'article',
            images: job.photos_url?.[0]
                ? [{ url: job.photos_url[0], width: 1200, height: 630, alt: job.title }]
                : [{ url: '/lescordistes.com-3.webp', width: 1200, height: 630 }],
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
        ...(job.deadline ? { validThrough: job.deadline } : {}),
        employmentType: job.contract_type === 'subcontracting' ? 'CONTRACTOR' : 'OTHER',
        hiringOrganization: {
            '@type': 'Organization',
            name: 'LesCordistes.com',
            sameAs: 'https://lescordistes.com',
            logo: 'https://lescordistes.com/lescordistes.com-white-logo.png',
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
        url: `https://lescordistes.com/jobs/${slug}`,
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
