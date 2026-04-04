import React from 'react';
import Link from 'next/link';
import { PRIORITY_CITIES } from '../../constants/seoData';

export const SEOInternalLinks: React.FC<{ currentCitySlug?: string }> = ({ currentCitySlug }) => {
    const currentCity = PRIORITY_CITIES.find(c => c.slug === currentCitySlug);
    
    let linkedCities = PRIORITY_CITIES;
    let title = "Trouvez un cordiste vérifié en France";

    if (currentCity) {
        const sameRegion = PRIORITY_CITIES.filter(c => c.region === currentCity.region && c.slug !== currentCity.slug);
        
        if (sameRegion.length > 0) {
            linkedCities = sameRegion;
            title = `Cordistes à proximité en ${currentCity.region}`;
        } else {
            linkedCities = PRIORITY_CITIES.filter(c => ['paris', 'lyon', 'marseille', 'bordeaux'].includes(c.slug) && c.slug !== currentCity.slug);
            title = "Nos principaux pôles d'intervention nationaux";
        }
    }

    return (
        <div className="mt-16 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {linkedCities.map(city => (
                    <Link 
                        key={city.slug} 
                        href={`/cordiste-${city.slug}`}
                        className="text-sm bg-white border border-slate-200 text-slate-700 hover:text-brand-blue hover:border-brand-blue px-3 py-1.5 rounded-full transition-colors"
                    >
                        Cordiste à {city.name}
                    </Link>
                ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-sm">
                <Link href="/lexique" className="text-slate-500 hover:text-brand-blue flex items-center gap-2 transition-colors font-medium">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex justify-center items-center text-xs font-bold font-serif leading-none">i</span>
                    Consulter le Dictionnaire Officiel de l'Accès Difficile
                </Link>
            </div>
        </div>
    );
};
