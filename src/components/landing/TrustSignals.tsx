import React from 'react'
import Link from 'next/link'
import { Shield, FileCheck, MapPin, Scale } from 'lucide-react'

const SIGNALS: Array<{ icon: typeof Shield; title: string; desc: string; href?: string }> = [
    {
        icon: Shield,
        title: 'Vérifiés CQP / IRATA',
        desc: '50 cordistes certifiés avant publication',
        href: '/verification-pros',
    },
    {
        icon: FileCheck,
        title: 'RC Pro & Kbis contrôlés',
        desc: 'Documents validés en interne sous 1 jour ouvré',
        href: '/verification-pros',
    },
    {
        icon: MapPin,
        title: 'Toutes les grandes villes',
        desc: 'Réseau actif Paris, Lyon, Marseille…',
        href: '/jobs',
    },
    {
        icon: Scale,
        title: 'Conforme R.4323-58',
        desc: 'Code du travail · arrêté 4 août 2005',
        href: '/mentions-legales',
    },
]

export const TrustSignals: React.FC = () => {
    return (
        <section className="py-16 bg-slate-50 border-y border-slate-200 relative z-10">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {SIGNALS.map((s, idx) => {
                        const Icon = s.icon
                        if (s.href) {
                            return (
                                <Link key={idx} href={s.href} className="text-center group block">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 group-hover:bg-blue-50 transition-colors border border-slate-200 shadow-sm">
                                        <Icon className="text-brand-blue-light" size={28} strokeWidth={1.8} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                                    <p className="text-sm text-slate-600 leading-snug">{s.desc}</p>
                                </Link>
                            )
                        }
                        return (
                            <div key={idx} className="text-center group cursor-default">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 group-hover:bg-blue-50 transition-colors border border-slate-200 shadow-sm">
                                    <Icon className="text-brand-blue-light" size={28} strokeWidth={1.8} />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                                <p className="text-sm text-slate-600 leading-snug">{s.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
