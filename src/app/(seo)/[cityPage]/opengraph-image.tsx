import { ImageResponse } from 'next/og'
import { PRIORITY_CITIES } from '@/constants/seoData'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
    params: Promise<{ cityPage: string }>
}

export default async function OgImage({ params }: Props) {
    const { cityPage } = await params

    // Extraire le slug ville : "cordiste-paris" → "paris"
    const citySlug = cityPage.replace(/^cordiste-/, '')
    const city = PRIORITY_CITIES.find((c) => c.slug === citySlug)
    const cityName = city?.name ?? citySlug.charAt(0).toUpperCase() + citySlug.slice(1)
    const region = city?.region ?? 'France'

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0f1e3a 0%, #243355 60%, #1a3a6b 100%)',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Top accent */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #243355, #5B8DDB)',
                    display: 'flex',
                }} />

                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px',
                    width: '400px', height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(91,141,219,0.12)',
                    display: 'flex',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '30%',
                    width: '300px', height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(91,141,219,0.08)',
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
                    {/* Top: region badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(91,141,219,0.15)',
                        border: '1px solid rgba(91,141,219,0.3)',
                        borderRadius: '50px',
                        padding: '8px 20px',
                        width: 'fit-content',
                    }}>
                        <span style={{ color: '#5B8DDB', fontSize: '18px' }}>📍</span>
                        <span style={{ color: '#5B8DDB', fontSize: '18px', fontWeight: '600' }}>
                            {region}
                        </span>
                    </div>

                    {/* Middle: main message */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '22px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                        }}>
                            Cordiste professionnel
                        </div>
                        <div style={{
                            color: 'white',
                            fontSize: '68px',
                            fontWeight: '800',
                            lineHeight: '1.0',
                            letterSpacing: '-2px',
                        }}>
                            {cityName}
                        </div>
                        <div style={{
                            color: '#5B8DDB',
                            fontSize: '28px',
                            fontWeight: '600',
                        }}>
                            Travaux en hauteur · Accès difficiles
                        </div>
                    </div>

                    {/* Bottom: tags + branding */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['CQP', 'IRATA', 'Devis 48h'].map((tag) => (
                                <div key={tag} style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '6px',
                                    padding: '6px 14px',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '16px',
                                    display: 'flex',
                                }}>
                                    {tag}
                                </div>
                            ))}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '18px' }}>
                            lescordistes.com
                        </div>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
