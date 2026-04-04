'use client'

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation'
import Link from 'next/link';
import { PRIORITY_CITIES, SEO_SERVICES, getLocalReviews } from '../../constants/seoData';
import { getEditorialContent } from '../../constants/seoUniqueContent';
import { TrustBadges } from '../../components/seo/TrustBadges';
import { SEOInternalLinks } from '../../components/seo/SEOInternalLinks';
import { SEOLocalReviews } from '../../components/seo/SEOLocalReviews';
import { SEOLocalStats } from '../../components/seo/SEOLocalStats';
import { Button } from '../../components/ui/Button';

interface Props {
    citySlug?: string;
}

export const CitySEOPage: React.FC<Props> = ({ citySlug: propCitySlug }) => {
    const { city: paramCity } = useParams<{ city: string }>();
    const citySlug = propCitySlug || paramCity;
    
    const cityData = useMemo(() => PRIORITY_CITIES.find(c => c.slug === citySlug), [citySlug]);

    if (!cityData) {
        return null;
    }

    const { name, lat, lng, region, department, country } = cityData;
    const { rating, count } = useMemo(() => getLocalReviews(name), [name]);
    const editorial = useMemo(() => getEditorialContent(citySlug as string), [citySlug]);

    const codeISO = country || "FR";

    // Structured Data: LocalBusiness & FAQPage
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "LocalBusiness",
                "name": `LesCordistes.com - ${name}`,
                "image": "https://lescordistes.com/images/default-hero.jpg",
                "url": `https://lescordistes.com/cordiste-${citySlug}`,
                "priceRange": "$$",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": rating,
                    "reviewCount": count
                },
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": name,
                    "addressRegion": region,
                    "addressCountry": codeISO
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": lat,
                    "longitude": lng
                },
                "areaServed": {
                    "@type": "GeoCircle",
                    "geoMidpoint": {
                        "@type": "GeoCoordinates",
                        "latitude": lat,
                        "longitude": lng
                    },
                    "geoRadius": "30000"
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": `Quel est le prix d'un cordiste à ${name} ?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Le tarif d'une intervention sur cordes à ${name} dépend de la complexité de l'accès et du type de travaux (urbain, industriel). En moyenne, comptez entre 350€ et 600€ HT par jour et par cordiste. Publiez votre besoin sur LesCordistes.com pour obtenir des devis précis.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `Vos cordistes intervenant à ${name} sont-ils certifiés ?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Oui, tous les professionnels inscrits sur notre plateforme possèdent des certifications obligatoires (CQP, IRATA) garantissant une sécurité maximale lors des travaux en hauteur dans la région."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            

            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        Entreprise de Travaux sur Cordes à {name} : <br/><span className="text-brand-blue-light">Experts en Accès Difficiles</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        Spécialistes des travaux en hauteur pour le nettoyage, la maintenance industrielle et le génie civil dans le secteur de {name}.
                    </p>
                    <Link href="/post-job" state={{ type: 'standard' }}>
                        <Button size="lg" className="bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-3 text-lg">
                            Publiez votre besoin en 3 min - Devis sous 48h
                        </Button>
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
                        <li><strong>Sécurité maximale</strong> : Tous nos cordistes utilisent des doubles cordes (travail et sécurité) selon la réglementation en vigueur.</li>
                    </ul>
                </div>

                <div className="mb-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    <iframe 
                        width="100%" 
                        height="350" 
                        style={{ border: 0 }} 
                        loading="lazy" 
                        allowFullScreen 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.05}%2C${lat-0.04}%2C${lng+0.05}%2C${lat+0.04}&layer=mapnik&marker=${lat}%2C${lng}`}
                    ></iframe>
                    <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-200 flex justify-between items-center">
                        <span>Zone géographique d'intervention sur cordes autour de <strong>{name}</strong>, {department} ({region})</span>
                        <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline font-medium">Agrandir la carte</a>
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-4">Nos services d'accès difficiles à {name}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {['urbain', 'industriel', 'genie_civil'].map(clusterType => (
                            <div key={clusterType} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-xl font-bold text-brand-blue capitalize mb-4">
                                    {clusterType.replace('_', ' ')}
                                </h3>
                                <ul className="space-y-3">
                                    {SEO_SERVICES.filter(s => s.cluster === clusterType).map(service => (
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
                            <p className="text-slate-600">Le tarif d'une intervention sur cordes à {name} dépend de la complexité de l'accès et du type de travaux (urbain, industriel). En moyenne, comptez entre 350€ et 600€ HT par jour et par cordiste.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Vos cordistes intervenant à {name} sont-ils certifiés ?</h3>
                            <p className="text-slate-600">Oui, tous les professionnels inscrits sur notre plateforme possèdent des certifications obligatoires (CQP, IRATA) garantissant une sécurité maximale lors des travaux en hauteur dans la région.</p>
                        </div>
                    </div>
                </div>

                <SEOInternalLinks currentCitySlug={citySlug} />
            </div>
        </div>
    );
};
