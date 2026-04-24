import { ImageResponse } from 'next/og'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Job } from '@/types'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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

const categoryColors: Record<string, string> = {
    cleaning: '#0ea5e9',
    construction: '#f59e0b',
    masonry: '#8b5cf6',
    painting: '#ec4899',
    industry: '#f97316',
    event: '#10b981',
    other: '#5B8DDB',
}

interface Props {
    params: Promise<{ slug: string }>
}

async function getJob(slug: string): Promise<Job | null> {
    try {
        const supabase = await createSupabaseServerClient()
        const { data } = await supabase
            .from('jobs')
            .select('title, location_city, category, description')
            .eq('slug', slug)
            .eq('status', 'live')
            .single()
        return (data as Job) ?? null
    } catch {
        return null
    }
}

export default async function OgImage({ params }: Props) {
    const { slug } = await params
    const job = await getJob(slug)

    const title = job?.title ?? 'Mission cordiste'
    const city = job?.location_city ?? ''
    const category = job ? (categoryLabels[job.category] ?? 'Travaux en hauteur') : 'Travaux en hauteur'
    const color = job ? (categoryColors[job.category] ?? '#5B8DDB') : '#5B8DDB'
    const excerpt = job
        ? job.description.slice(0, 100).replace(/\n/g, ' ') + '…'
        : 'Accès difficile · Professionnel certifié'

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0f1e3a 0%, #243355 70%, #1a3a6b 100%)',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Color accent bar */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '6px',
                    background: color,
                    display: 'flex',
                }} />

                {/* Decorative circle */}
                <div style={{
                    position: 'absolute', top: '-100px', right: '-100px',
                    width: '450px', height: '450px',
                    borderRadius: '50%',
                    background: `${color}18`,
                    display: 'flex',
                }} />

                {/* Content */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    padding: '55px 70px',
                }}>
                    {/* Top: category badge + city */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            background: color,
                            color: 'white',
                            borderRadius: '8px',
                            padding: '6px 16px',
                            fontSize: '18px',
                            fontWeight: '700',
                            display: 'flex',
                        }}>
                            {category}
                        </div>
                        {city && (
                            <div style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '18px',
                                display: 'flex',
                            }}>
                                📍 {city}
                            </div>
                        )}
                    </div>

                    {/* Middle: job title */}
                    <div style={{
                        color: 'white',
                        fontSize: title.length > 50 ? '42px' : '52px',
                        fontWeight: '800',
                        lineHeight: '1.15',
                        letterSpacing: '-0.5px',
                    }}>
                        {title}
                    </div>

                    {/* Bottom: excerpt + branding */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '20px',
                            lineHeight: '1.4',
                        }}>
                            {excerpt}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                background: '#5B8DDB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>LC</span>
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>
                                lescordistes.com
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
