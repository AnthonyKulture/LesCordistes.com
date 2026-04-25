import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PRIORITY_CITIES, SEO_SERVICES } from '@/constants/seoData'
import { getEditorialContent } from '@/constants/seoUniqueContent'
import { SEO_PHONE, SEO_EMAIL, SEO_BRAND_NAME, SEO_BASE_URL, SEO_LOGO, SEO_OPENING_HOURS, SEO_SAME_AS, SEO_POSTAL_ADDRESS } from '@/constants/seoConfig'
import { TrustBadges } from '@/components/seo/TrustBadges'
import { SEOInternalLinks } from '@/components/seo/SEOInternalLinks'
import { SEOLocalReviews } from '@/components/seo/SEOLocalReviews'
import { SEOLocalStats } from '@/components/seo/SEOLocalStats'
import Link from 'next/link'

interface Props {
    params: Promise<{ cityPage: string }>
}

export async function generateStaticParams() {
    return PRIORITY_CITIES.map((city) => ({
        cityPage: `cordiste-${city.slug}`,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { cityPage } = await params
    if (!cityPage.startsWith('cordiste-')) return {}
    const citySlug = cityPage.replace('cordiste-', '')
    const city = PRIORITY_CITIES.find((c) => c.slug === citySlug)
    if (!city) return {}

    const editorial = getEditorialContent(citySlug)

    const desc = editorial.metaDescription ?? `Cordiste qualifié à ${city.name} pour vos travaux en accès difficile. Devis gratuit sous 48 h. Experts certifiés CQP/IRATA.`
    return {
        title: `Cordiste ${city.name} : travaux en hauteur`,
        description: desc.length > 160 ? `${desc.slice(0, 157)}…` : desc,
        alternates: { canonical: `${SEO_BASE_URL}/cordiste-${citySlug}` },
        openGraph: {
            title: `Cordiste ${city.name} : travaux en hauteur · LesCordistes`,
            description: desc.length > 160 ? `${desc.slice(0, 157)}…` : desc,
            url: `${SEO_BASE_URL}/cordiste-${citySlug}`,
        },
        other: {
            'geo.region': `FR-${city.department}`,
            'geo.placename': city.name,
            'geo.position': `${city.lat};${city.lng}`,
        },
    }
}

export default async function CitySEOPage({ params }: Props) {
    const { cityPage } = await params
    if (!cityPage.startsWith('cordiste-')) notFound()

    const citySlug = cityPage.replace('cordiste-', '')
    const cityData = PRIORITY_CITIES.find((c) => c.slug === citySlug)
    if (!cityData) notFound()

    const { name, lat, lng, region, department, country } = cityData
    const editorial = getEditorialContent(citySlug)
    const codeISO = country || 'FR'

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Service',
                '@id': `${SEO_BASE_URL}/cordiste-${citySlug}#service`,
                serviceType: 'Travaux sur cordes',
                name: `Cordistes à ${name}`,
                url: `${SEO_BASE_URL}/cordiste-${citySlug}`,
                areaServed: {
                    '@type': 'City',
                    name,
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: name,
                        addressRegion: region,
                        addressCountry: codeISO,
                    },
                    geo: {
                        '@type': 'GeoCoordinates',
                        latitude: lat.toFixed(5),
                        longitude: lng.toFixed(5),
                    },
                },
                provider: {
                    '@type': ['Organization', 'ProfessionalService'],
                    '@id': `${SEO_BASE_URL}/#organization`,
                    name: SEO_BRAND_NAME,
                    image: {
                        '@type': 'ImageObject',
                        url: SEO_LOGO,
                        width: 1200,
                        height: 630,
                    },
                    url: SEO_BASE_URL,
                    telephone: SEO_PHONE,
                    email: SEO_EMAIL,
                    address: SEO_POSTAL_ADDRESS,
                    priceRange: '$$',
                    openingHoursSpecification: SEO_OPENING_HOURS,
                    ...(SEO_SAME_AS.length > 0 && { sameAs: SEO_SAME_AS }),
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                    { '@type': 'ListItem', position: 2, name: `Cordiste ${name}`, item: `${SEO_BASE_URL}/cordiste-${citySlug}` },
                ],
            },
            {
                '@type': 'FAQPage',
                mainEntityOfPage: `${SEO_BASE_URL}/cordiste-${citySlug}`,
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: `Quel est le prix d'un cordiste à ${name} ?`,
                        acceptedAnswer: { '@type': 'Answer', text: `Le tarif d'une intervention sur cordes à ${name} varie selon la complexité de l'accès, la hauteur et le type de prestation. En moyenne, comptez entre 350 € et 600 € HT par jour et par technicien. Pour un nettoyage de façade, le prix oscille entre 8 et 25 €/m². Obtenez un devis gratuit et personnalisé sous 48h via notre plateforme.` },
                    },
                    {
                        '@type': 'Question',
                        name: `Vos cordistes intervenant à ${name} sont-ils certifiés ?`,
                        acceptedAnswer: { '@type': 'Answer', text: `Oui. Tout professionnel inscrit sur LesCordistes.com doit justifier d'une certification CQP Cordiste (obligatoire en France selon le code du travail) ou IRATA (norme internationale industrie lourde), et présenter une attestation RC Pro valide. Ces documents sont vérifiés par notre équipe avant toute mise en relation à ${name} ou ailleurs.` },
                    },
                    {
                        '@type': 'Question',
                        name: `Combien de temps pour obtenir un cordiste à ${name} ?`,
                        acceptedAnswer: { '@type': 'Answer', text: `Grâce à notre réseau de cordistes certifiés présents dans l'agglomération de ${name} et dans un rayon de 30 km, vous recevez vos premiers devis sous 48h après publication de votre besoin. Pour les interventions urgentes (sécurisation de site, sinistre), une mise en relation express sous 24h est possible sur demande.` },
                    },
                    {
                        '@type': 'Question',
                        name: `Comment trouver un cordiste près de ${name} ?`,
                        acceptedAnswer: { '@type': 'Answer', text: `Publiez votre besoin en 3 minutes sur LesCordistes.com : décrivez les travaux, la localisation et vos contraintes d'accès. Notre système identifie automatiquement les cordistes certifiés disponibles dans un rayon de 30 km autour de ${name} et leur transmet votre demande. Vous comparez les devis et choisissez librement, sans commission.` },
                    },
                ],
            },
        ],
    }

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        Entreprise de Travaux sur Cordes à {name} :{' '}
                        <br />
                        <span className="text-brand-blue-light">Experts en Accès Difficiles</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        Spécialistes des travaux en hauteur pour le nettoyage, la maintenance industrielle et le génie civil dans le secteur de {name}.
                    </p>
                    <Link
                        href="/post-job"
                        className="inline-block bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-3 text-lg font-bold rounded-xl transition-colors"
                    >
                        Publiez votre besoin en 3 min - Devis sous 48h
                    </Link>
                </div>
            </div>

            <div className="container max-w-5xl py-12">
                <SEOLocalStats cityName={name} />

                <div className="prose prose-lg max-w-none text-slate-700 mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">{editorial.hubTitle}</h2>
                    <p>{editorial.paragraph1}</p>
                    <p>{editorial.paragraph2}</p>

                    <h3>Les avantages de l'accès sur cordes</h3>
                    <ul>
                        <li><strong>Rapidité de déploiement</strong> : Pas d'installation d'échafaudages complexes.</li>
                        <li><strong>Autorisations simplifiées</strong> : Pas de demande d'occupation du domaine public nécessaire dans 90% des cas.</li>
                        <li><strong>Économie substantielle</strong> : Les coûts logistiques sont drastiquement réduits.</li>
                        <li><strong>Sécurité maximale</strong> : Tous nos cordistes utilisent des doubles cordes selon la réglementation en vigueur.</li>
                    </ul>
                </div>

                {editorial.reglementationLocale && (
                    <div className="mb-16 bg-blue-50 rounded-2xl p-8 border border-blue-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{editorial.reglementationLocale.title}</h2>
                        <p className="text-slate-700 leading-relaxed">{editorial.reglementationLocale.content}</p>
                    </div>
                )}

                {editorial.tarifsLocaux && (
                    <div className="mb-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tarifs cordiste à {name}</h2>
                        <div className="flex items-center gap-6 mb-4">
                            <div className="text-center bg-white rounded-xl p-4 border border-slate-200 min-w-[120px]">
                                <p className="text-sm text-slate-500 mb-1">À partir de</p>
                                <p className="text-3xl font-black text-brand-blue">{editorial.tarifsLocaux.min}€</p>
                                <p className="text-xs text-slate-400">HT / jour</p>
                            </div>
                            <div className="text-slate-400 text-2xl font-light">—</div>
                            <div className="text-center bg-white rounded-xl p-4 border border-slate-200 min-w-[120px]">
                                <p className="text-sm text-slate-500 mb-1">Jusqu'à</p>
                                <p className="text-3xl font-black text-brand-blue">{editorial.tarifsLocaux.max}€</p>
                                <p className="text-xs text-slate-400">HT / jour</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm">{editorial.tarifsLocaux.context}</p>
                        <p className="text-slate-500 text-xs mt-3">* Tarifs indicatifs par technicien et par jour. Le devis définitif dépend de la complexité d'accès, de la hauteur et des habilitations requises.</p>
                    </div>
                )}

                {editorial.projetsTypes && editorial.projetsTypes.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Projets types à {name}</h2>
                        <div className="space-y-4">
                            {editorial.projetsTypes.map((projet, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{projet.titre}</h3>
                                    <p className="text-slate-600">{projet.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    <iframe
                        width="100%"
                        height="350"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(`cordiste ${name} France`)}&output=embed&zoom=12`}
                    />
                    <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-200 flex justify-between items-center">
                        <span>Zone géographique d'intervention sur cordes autour de <strong>{name}</strong>, {department} ({region})</span>
                        <a href={`https://www.google.com/maps/search/cordiste+${encodeURIComponent(name)}+France`} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline font-medium">Agrandir la carte</a>
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-4">Nos services d'accès difficiles à {name}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {(['urbain', 'industriel', 'genie_civil'] as const).map((clusterType) => (
                            <div key={clusterType} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-xl font-bold text-brand-blue capitalize mb-4">
                                    {clusterType.replace('_', ' ')}
                                </h3>
                                <ul className="space-y-3">
                                    {SEO_SERVICES.filter((s) => s.cluster === clusterType).map((service) => (
                                        <li key={service.id}>
                                            <Link
                                                href={`/cordiste-${citySlug}/${service.slug}`}
                                                className="font-semibold text-slate-900 hover:text-brand-blue group flex items-start gap-2"
                                            >
                                                <span className="text-brand-blue group-hover:translate-x-1 transition-transform">→</span>
                                                {service.name}
                                            </Link>
                                            <p className="text-sm text-slate-500 mt-1 pl-6">{service.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <TrustBadges />
                <SEOLocalReviews cityName={name} />

                <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">FAQ : Engager un pro à {name}</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Quel est le prix d'une intervention à {name} ?</h3>
                            <p className="text-slate-600">Le tarif d'une intervention sur cordes à {name} dépend de la complexité de l'accès et du type de travaux. En moyenne, comptez entre 350€ et 600€ HT par jour et par cordiste.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Vos cordistes intervenant à {name} sont-ils certifiés ?</h3>
                            <p className="text-slate-600">Oui, tous les professionnels inscrits sur notre plateforme possèdent des certifications obligatoires (CQP, IRATA) garantissant une sécurité maximale lors des travaux en hauteur.</p>
                        </div>
                    </div>
                </div>

                <SEOInternalLinks currentCitySlug={citySlug} />
            </div>
        </div>
    )
}
