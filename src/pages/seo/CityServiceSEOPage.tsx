import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PRIORITY_CITIES, SEO_SERVICES, getLocalReviews } from '../../constants/seoData';
import { getEditorialContent } from '../../constants/seoUniqueContent';
import { TrustBadges } from '../../components/seo/TrustBadges';
import { SEOInternalLinks } from '../../components/seo/SEOInternalLinks';
import { SEOLocalReviews } from '../../components/seo/SEOLocalReviews';
import { SEOLocalStats } from '../../components/seo/SEOLocalStats';
import { Button } from '../../components/ui/Button';

interface Props {
    citySlug?: string;
    serviceSlug?: string;
}

export const CityServiceSEOPage: React.FC<Props> = ({ citySlug: propCitySlug, serviceSlug: propServiceSlug }) => {
    const { city: paramCity, service: paramService } = useParams<{ city: string, service: string }>();
    const citySlug = propCitySlug || paramCity;
    const serviceSlug = propServiceSlug || paramService;
    
    const cityData = useMemo(() => PRIORITY_CITIES.find(c => c.slug === citySlug), [citySlug]);
    const serviceData = useMemo(() => SEO_SERVICES.find(s => s.slug === serviceSlug), [serviceSlug]);

    if (!cityData || !serviceData) {
        return <Navigate to="/404" replace />;
    }

    const { name, lat, lng, department, country } = cityData;
    const { name: serviceName, description, keywords } = serviceData;
    const { rating, count } = useMemo(() => getLocalReviews(name, serviceName), [name, serviceName]);
    const editorial = useMemo(() => getEditorialContent(citySlug as string), [citySlug]);

    const codeISO = country || "FR";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": serviceName,
        "provider": {
            "@type": "LocalBusiness",
            "name": `LesCordistes.com - Spécialiste ${serviceName} à ${name}`,
            "image": "https://lescordistes.com/images/default-hero.jpg"
        },
        "areaServed": {
            "@type": "City",
            "name": name
        },
        "description": description,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": count
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>{serviceName} intervention cordiste à {name} | LesCordistes</title>
                <meta name="description" content={`Besoin de ${serviceName.toLowerCase()} à ${name} ? Nos cordistes certifiés interviennent en accès difficile. Devis rapide, sécurité garantie avec CQP/IRATA.`} />
                <meta name="geo.region" content={`${codeISO}-${department}`} />
                <meta name="geo.placename" content={name} />
                <meta name="geo.position" content={`${lat};${lng}`} />
                <link rel="canonical" href={`https://lescordistes.com/cordiste-${citySlug}/${serviceSlug}`} />
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container max-w-4xl text-center">
                    <div className="mb-4">
                        <Link to={`/cordiste-${citySlug}`} className="text-brand-blue hover:text-brand-blue-light text-sm font-semibold uppercase tracking-wider">
                            ← Retour à {name}
                        </Link>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        {serviceName} à {name} : <br/><span className="text-brand-blue-light">Intervention sur Cordes</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        {description}
                    </p>
                    <Link to="/post-job" state={{ type: 'standard' }}>
                        <Button size="lg" className="bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-3 text-lg">
                            Demander un devis pour {serviceName.toLowerCase()}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="container max-w-5xl py-12">
                <SEOLocalStats cityName={name} />
                
                <div className="prose prose-lg max-w-none text-slate-700 mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">L'expertise {serviceName.toLowerCase()} en accès difficile à {name}</h2>
                    <p>{editorial.paragraph1}</p>
                    <p>Pour des interventions complexes comme le <strong>{serviceName.toLowerCase()}</strong>, nos techniciens {editorial.paragraph2.toLowerCase()}</p>
                    
                    <h3>Champs d'intervention clés ({serviceName})</h3>
                    <ul>
                        {keywords.map((kw, i) => (
                            <li key={i}><strong>{kw.charAt(0).toUpperCase() + kw.slice(1)}</strong> : Prestation professionnelle certifiée sur l'agglomération de {name} et ses alentours.</li>
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
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.03}%2C${lat-0.02}%2C${lng+0.03}%2C${lat+0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
                    ></iframe>
                    <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-200 flex justify-between items-center">
                        <span>Périmètre d'action certifié <strong>{serviceName}</strong> - {name} ({department})</span>
                    </div>
                </div>

                <TrustBadges />
                <SEOLocalReviews cityName={name} serviceName={serviceName} />
                <SEOInternalLinks currentCitySlug={citySlug} />
            </div>
        </div>
    );
};
