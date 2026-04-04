import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PRIORITY_CITIES, SEO_SERVICES, getLocalReviews } from '@/constants/seoData'
import { getEditorialContent } from '@/constants/seoUniqueContent'
import { TrustBadges } from '@/components/seo/TrustBadges'
import { SEOInternalLinks } from '@/components/seo/SEOInternalLinks'
import { SEOLocalReviews } from '@/components/seo/SEOLocalReviews'
import { SEOLocalStats } from '@/components/seo/SEOLocalStats'

interface Props {
    params: Promise<{ cityPage: string; service: string }>
}

export async function generateStaticParams() {
    const params: { cityPage: string; service: string }[] = []
    PRIORITY_CITIES.forEach((city) => {
        SEO_SERVICES.forEach((service) => {
            params.push({
                cityPage: `cordiste-${city.slug}`,
                service: service.slug,
            })
        })
    })
    return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { cityPage, service: serviceSlug } = await params
    if (!cityPage.startsWith('cordiste-')) return {}
    const citySlug = cityPage.replace('cordiste-', '')
    const city = PRIORITY_CITIES.find((c) => c.slug === citySlug)
    const serviceData = SEO_SERVICES.find((s) => s.slug === serviceSlug)
    if (!city || !serviceData) return {}

    const titleTemplate = serviceData.metaTitle?.replace('{city}', city.name)
    const descTemplate = serviceData.metaDesc?.replace('{city}', city.name)

    return {
        title: titleTemplate || `${serviceData.name} à ${city.name} — Cordiste Certifié`,
        description: descTemplate || `Besoin de ${serviceData.name.toLowerCase()} à ${city.name} ? Nos cordistes certifiés interviennent en accès difficile. Devis rapide, sécurité garantie CQP/IRATA.`,
        alternates: { canonical: `https://lescordistes.com/cordiste-${citySlug}/${serviceSlug}` },
        openGraph: {
            title: titleTemplate || `${serviceData.name} à ${city.name} — Intervention Cordiste`,
            description: descTemplate || `Cordiste certifié pour ${serviceData.name.toLowerCase()} à ${city.name}. Devis sous 48h.`,
            url: `https://lescordistes.com/cordiste-${citySlug}/${serviceSlug}`,
        },
        other: {
            'geo.region': `FR-${city.department}`,
            'geo.placename': city.name,
            'geo.position': `${city.lat};${city.lng}`,
        },
    }
}

export default async function CityServiceSEOPage({ params }: Props) {
    const { cityPage, service: serviceSlug } = await params
    if (!cityPage.startsWith('cordiste-')) notFound()

    const citySlug = cityPage.replace('cordiste-', '')
    const cityData = PRIORITY_CITIES.find((c) => c.slug === citySlug)
    const serviceData = SEO_SERVICES.find((s) => s.slug === serviceSlug)
    if (!cityData || !serviceData) notFound()

    const { name, lat, lng, department, country } = cityData
    const { name: serviceName, description, keywords } = serviceData
    const { rating, count } = getLocalReviews(name, serviceName)
    const editorial = getEditorialContent(citySlug)
    const codeISO = country || 'FR'

    const isGrandPublic = serviceData.cluster === 'grand_public'
    const h1 = serviceData.h1Template?.replace('{city}', name) || `${serviceName} à ${name}`
    const intro = serviceData.introTemplate?.replace('{city}', name) || description

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: serviceName,
        provider: {
            '@type': 'LocalBusiness',
            name: `LesCordistes.com - Spécialiste ${serviceName} à ${name}`,
            image: 'https://lescordistes.com/lescordistes.com-3.webp',
        },
        areaServed: { '@type': 'City', name },
        description,
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: count,
        },
    }

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container max-w-4xl text-center">
                    <div className="mb-4">
                        <Link href={`/cordiste-${citySlug}`} className="text-brand-blue-light hover:text-white text-sm font-semibold uppercase tracking-wider transition-colors">
                            ← Retour à {name}
                        </Link>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        {isGrandPublic ? (
                            h1
                        ) : (
                            <>{serviceName} à {name} :{' '}<br /><span className="text-brand-blue-light">Intervention sur Cordes</span></>
                        )}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">{intro}</p>
                    <Link
                        href="/post-job"
                        className="inline-block bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-3 text-lg font-bold rounded-xl transition-colors"
                    >
                        Demander un devis pour {serviceName.toLowerCase()}
                    </Link>
                </div>
            </div>

            <div className="container max-w-5xl py-12">
                <SEOLocalStats cityName={name} />

                <div className="prose prose-lg max-w-none text-slate-700 mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        L'expertise {serviceName.toLowerCase()} en accès difficile à {name}
                    </h2>
                    <p>{editorial.paragraph1}</p>
                    <p>Pour des interventions complexes comme le <strong>{serviceName.toLowerCase()}</strong>, nos techniciens {editorial.paragraph2.toLowerCase()}</p>

                    <h3>Champs d'intervention clés ({serviceName})</h3>
                    <ul>
                        {keywords.map((kw, i) => (
                            <li key={i}>
                                <strong>{kw.charAt(0).toUpperCase() + kw.slice(1)}</strong> : Prestation professionnelle certifiée sur l'agglomération de {name} et ses alentours.
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    <iframe
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03}%2C${lat - 0.02}%2C${lng + 0.03}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
                    />
                    <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-200">
                        <span>Périmètre d'action certifié <strong>{serviceName}</strong> - {name} ({department})</span>
                    </div>
                </div>

                <TrustBadges />
                <SEOLocalReviews cityName={name} serviceName={serviceName} />
                <SEOInternalLinks currentCitySlug={citySlug} />
            </div>
        </div>
    )
}
