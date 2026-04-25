import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const SIZE = { width: 1200, height: 630 }

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const rawTitle = (searchParams.get('title') ?? 'LesCordistes').slice(0, 90)
    const rawKicker = (searchParams.get('kicker') ?? 'Plateforme nationale').slice(0, 40)

    return new ImageResponse(
        (
            <div
                style={{
                    width: `${SIZE.width}px`,
                    height: `${SIZE.height}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0f1e3a 0%, #243355 60%, #1a3a6b 100%)',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #243355, #5B8DDB)',
                    display: 'flex',
                }} />

                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px',
                    width: '420px', height: '420px',
                    borderRadius: '50%',
                    background: 'rgba(91,141,219,0.12)',
                    display: 'flex',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '20%',
                    width: '320px', height: '320px',
                    borderRadius: '50%',
                    background: 'rgba(91,141,219,0.08)',
                    display: 'flex',
                }} />

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    padding: '60px 80px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(91,141,219,0.15)',
                        border: '1px solid rgba(91,141,219,0.3)',
                        borderRadius: '50px',
                        padding: '10px 22px',
                        alignSelf: 'flex-start',
                    }}>
                        <span style={{ color: '#5B8DDB', fontSize: '18px', fontWeight: 600 }}>
                            {rawKicker}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{
                            color: '#ffffff',
                            fontSize: rawTitle.length > 60 ? '56px' : '72px',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                        }}>
                            {rawTitle}
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255,255,255,0.15)',
                        paddingTop: '24px',
                    }}>
                        <div style={{
                            color: '#ffffff',
                            fontSize: '28px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            display: 'flex',
                        }}>
                            LesCordistes.com
                        </div>
                        <div style={{
                            color: '#5B8DDB',
                            fontSize: '20px',
                            fontWeight: 500,
                            display: 'flex',
                        }}>
                            Plateforme nationale · Cordistes certifiés CQP/IRATA
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...SIZE,
            headers: {
                'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
            },
        },
    )
}
