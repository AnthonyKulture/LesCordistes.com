import React from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

const FEATURED_CITIES: Array<{ name: string; slug: string; tagline: string }> = [
    { name: 'Paris', slug: 'paris', tagline: 'IDF · Marais ABF · La Défense' },
    { name: 'Marseille', slug: 'marseille', tagline: 'Calanques · Vieux-Port · pétrochimie' },
    { name: 'Lyon', slug: 'lyon', tagline: 'Vieux-Lyon UNESCO · vallée chimie' },
    { name: 'Toulouse', slug: 'toulouse', tagline: 'Brique foraine · aéronautique Airbus' },
    { name: 'Lille', slug: 'lille', tagline: 'ZPPAUP · sheds filatures' },
    { name: 'Bordeaux', slug: 'bordeaux', tagline: 'Port de la Lune UNESCO · chais' },
    { name: 'Nantes', slug: 'nantes', tagline: 'Tuffeau ligérien · Île de Nantes' },
    { name: 'Nice', slug: 'nice', tagline: 'Vieux-Nice ABF · Promenade · embruns' },
    { name: 'Strasbourg', slug: 'strasbourg', tagline: 'Petite France UNESCO · Neustadt' },
    { name: 'Rennes', slug: 'rennes', tagline: 'Pans-de-bois · ardoise schiste' },
    { name: 'Grenoble', slug: 'grenoble', tagline: 'Bow-windows zinc · contrainte alpine' },
    { name: 'Montpellier', slug: 'montpellier', tagline: 'Écusson ABF · Antigone · cévenols' },
]

export const CityLinks: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                        Cordistes dans les <span className="text-brand-blue-light">grandes villes de France</span>
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Réseau de techniciens certifiés CQP/IRATA avec contextes locaux dédiés (réglementation ABF, climat, bâti). Cliquez sur votre ville pour découvrir nos interventions spécialisées.
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {FEATURED_CITIES.map((city) => (
                        <Link
                            key={city.slug}
                            href={`/cordiste-${city.slug}`}
                            className="group flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-brand-blue-light hover:bg-brand-blue/5 transition-colors"
                        >
                            <span className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-brand-blue-light">
                                <MapPin size={16} strokeWidth={2.2} className="text-brand-blue-light" />
                                Cordiste {city.name}
                            </span>
                            <span className="text-xs text-slate-500 leading-snug">{city.tagline}</span>
                        </Link>
                    ))}
                </div>
                <p className="mt-8 text-center text-sm text-slate-500">
                    Vous cherchez une autre ville ? Notre réseau couvre 60 villes en France.
                    <Link href="/jobs" className="ml-1 font-medium text-brand-blue-light hover:underline">
                        Voir toutes les missions
                    </Link>
                </p>
            </div>
        </section>
    )
}
