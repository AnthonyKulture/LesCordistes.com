import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'LesCordistes — Plateforme pour Professionnels du Travail sur Cordes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: 'linear-gradient(135deg, #0f1e3a 0%, #243355 60%, #1a3a6b 100%)',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px',
                    width: '400px', height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(91,141,219,0.15)',
                    display: 'flex',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '-60px',
                    width: '300px', height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(91,141,219,0.1)',
                    display: 'flex',
                }} />

                {/* Content */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '60px 70px',
                    gap: '20px',
                }}>
                    {/* Badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(91,141,219,0.2)',
                        border: '1px solid rgba(91,141,219,0.4)',
                        borderRadius: '50px',
                        padding: '8px 20px',
                        width: 'fit-content',
                    }}>
                        <div style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: '#5B8DDB',
                            display: 'flex',
                        }} />
                        <span style={{ color: '#5B8DDB', fontSize: '18px', fontWeight: '600' }}>
                            Plateforme N°1 en France
                        </span>
                    </div>

                    {/* Title */}
                    <div style={{
                        color: 'white',
                        fontSize: '56px',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        letterSpacing: '-1px',
                    }}>
                        Trouvez des{' '}
                        <span style={{ color: '#5B8DDB' }}>cordistes</span>
                        <br />
                        pour vos travaux en hauteur
                    </div>

                    {/* Subtitle */}
                    <div style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '24px',
                        fontWeight: '400',
                    }}>
                        Accès difficile · CQP & IRATA certifiés · Devis sous 48h
                    </div>

                    {/* Domain */}
                    <div style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '20px',
                        marginTop: '8px',
                    }}>
                        lescordistes.com
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
