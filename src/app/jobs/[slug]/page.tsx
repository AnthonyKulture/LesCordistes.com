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

export default async function JobDetailPage({ params }: Props) {
    const { slug } = await params
    // Fetch server-side for SEO hydration (live jobs only)
    // Non-live jobs (pending/rejected) remain accessible client-side for owner/admin
    const job = await getJob(slug)

    return <JobDetail initialJob={job} />
}
