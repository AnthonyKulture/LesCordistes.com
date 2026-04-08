import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PRIORITY_CITIES, SEO_SERVICES, getServiceCityContext, DEFAULT_SERVICE_FAQS } from '@/constants/seoData'
import { getEditorialContent } from '@/constants/seoUniqueContent'
import { SEO_PHONE, SEO_EMAIL, SEO_BRAND_NAME, SEO_BASE_URL, SEO_LOGO, SEO_OPENING_HOURS, SEO_SAME_AS } from '@/constants/seoConfig'
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
    const editorial = getEditorialContent(citySlug)
    const serviceContext = getServiceCityContext(serviceSlug, citySlug)
    const faqs = serviceData.faqs ?? DEFAULT_SERVICE_FAQS
    const codeISO = country || 'FR'

    const isGrandPublic = serviceData.cluster === 'grand_public'
    const h1 = serviceData.h1Template?.replace('{city}', name) || `${serviceName} à ${name}`
    const intro = serviceData.introTemplate?.replace('{city}', name) || description

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Service',
                '@id': `${SEO_BASE_URL}/cordiste-${citySlug}/${serviceSlug}#service`,
                name: `${serviceName} à ${name}`,
                serviceType: serviceName,
                description,
                areaServed: { '@type': 'City', name },
                provider: {
                    '@type': 'LocalBusiness',
                    '@id': `${SEO_BASE_URL}/cordiste-${citySlug}`,
                    name: SEO_BRAND_NAME,
                    image: SEO_LOGO,
                    telephone: SEO_PHONE,
                    email: SEO_EMAIL,
                    openingHoursSpecification: SEO_OPENING_HOURS,
                    ...(SEO_SAME_AS.length > 0 && { sameAs: SEO_SAME_AS }),
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                    { '@type': 'ListItem', position: 2, name: `Cordiste ${name}`, item: `${SEO_BASE_URL}/cordiste-${citySlug}` },
                    { '@type': 'ListItem', position: 3, name: serviceName, item: `${SEO_BASE_URL}/cordiste-${citySlug}/${serviceSlug}` },
                ],
            },
            {
                '@type': 'FAQPage',
                mainEntity: faqs.map((faq: { question: string; answer: string }) => ({
                    '@type': 'Question',
                    name: faq.question.replace(/\{city\}/g, name),
                    acceptedAnswer: { '@type': 'Answer', text: faq.answer.replace(/\{city\}/g, name) },
                })),
            },
        ],
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
                    <p>{serviceContext ? serviceContext.intro : editorial.paragraph1}</p>
                    {!serviceContext && (
                        <p>Pour des interventions complexes comme le <strong>{serviceName.toLowerCase()}</strong>, nos techniciens {editorial.paragraph2.toLowerCase()}</p>
                    )}

                    <h3>Cas d'intervention typiques — {serviceName} à {name}</h3>
                    <ul>
                        {serviceContext
                            ? serviceContext.useCases.map((uc: string, i: number) => (
                                <li key={i}><strong>{uc}</strong></li>
                              ))
                            : keywords.map((kw: string, i: number) => (
                                <li key={i}>
                                    <strong>{kw.charAt(0).toUpperCase() + kw.slice(1)}</strong> : Prestation professionnelle certifiée sur l'agglomération de {name} et ses alentours.
                                </li>
                              ))
                        }
                    </ul>
                </div>

                <div className="mb-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    <iframe
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(`${serviceName} cordiste ${name} France`)}&output=embed&zoom=12`}
                    />
                    <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-200">
                        <span>Périmètre d'action certifié <strong>{serviceName}</strong> - {name} ({department})</span>
                    </div>
                </div>

                <TrustBadges />
                <SEOLocalReviews cityName={name} serviceName={serviceName} />

                <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
                        FAQ : {serviceName} à {name}
                    </h2>
                    <div className="space-y-6">
                        {faqs.map((faq: { question: string; answer: string }, i: number) => (
                            <div key={i}>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {faq.question.replace(/\{city\}/g, name)}
                                </h3>
                                <p className="text-slate-600">
                                    {faq.answer.replace(/\{city\}/g, name)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <SEOInternalLinks currentCitySlug={citySlug} />
            </div>
        </div>
    )
}
