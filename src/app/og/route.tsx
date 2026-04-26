import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const SIZE = { width: 1200, height: 630 }

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const rawTitle = (searchParams.get('title') ?? 'LesCordistes').slice(0, 90)
    const rawKicker = (searchParams.get('kicker') ?? 'Blog').slice(0, 40)

    const titleFontSize = rawTitle.length > 75 ? 44 : rawTitle.length > 55 ? 56 : 68

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0a1730 0%, #1a2d5a 50%, #243355 100%)',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-220px',
                        right: '-220px',
                        width: '620px',
                        height: '620px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(91,141,219,0.28) 0%, rgba(91,141,219,0) 70%)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-180px',
                        left: '-120px',
                        width: '520px',
                        height: '520px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(91,141,219,0.18) 0%, rgba(91,141,219,0) 70%)',
                        display: 'flex',
                    }}
                />

                <div
                    style={{
                        height: '6px',
                        background: 'linear-gradient(90deg, transparent 0%, #5B8DDB 50%, transparent 100%)',
                        display: 'flex',
                    }}
                />

                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '60px 110px',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(91,141,219,0.18)',
                            border: '1px solid rgba(91,141,219,0.45)',
                            borderRadius: '50px',
                            padding: '12px 28px',
                            marginBottom: '40px',
                        }}
                    >
                        <span
                            style={{
                                color: '#9DB8E5',
                                fontSize: '20px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {rawKicker}
                        </span>
                    </div>

                    <div
                        style={{
                            color: '#ffffff',
                            fontSize: `${titleFontSize}px`,
                            fontWeight: 800,
                            lineHeight: 1.15,
                            letterSpacing: '-0.025em',
                            maxWidth: '960px',
                            display: 'flex',
                            textAlign: 'center',
                        }}
                    >
                        {rawTitle}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        padding: '28px 40px',
                        borderTop: '1px solid rgba(255,255,255,0.12)',
                    }}
                >
                    <div
                        style={{
                            color: '#ffffff',
                            fontSize: '24px',
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            display: 'flex',
                        }}
                    >
                        LesCordistes.com
                    </div>
                    <div
                        style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: '#5B8DDB',
                            display: 'flex',
                        }}
                    />
                    <div
                        style={{
                            color: '#94a3b8',
                            fontSize: '18px',
                            fontWeight: 500,
                            display: 'flex',
                        }}
                    >
                        Plateforme nationale · CQP / IRATA
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
