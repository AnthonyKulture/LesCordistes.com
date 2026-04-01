import React from 'react';
import { Shield, Clock, Award, TrendingUp } from 'lucide-react';

const signals = [
    { icon: Shield, title: 'Sécurisé', desc: 'Certifications IRATA / CQP' },
    { icon: Clock, title: 'Rapide', desc: 'Devis travaux sur corde' },
    { icon: Award, title: 'Qualité', desc: 'Intervention sécurisée' },
    { icon: TrendingUp, title: 'Croissance', desc: '+150% cette année' }
];

export const TrustSignals: React.FC = () => {
    return (
        <section className="py-16 bg-slate-50 border-y border-slate-200 relative z-10">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {signals.map((s, idx) => (
                        <div key={idx} className="text-center group cursor-default">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4 group-hover:bg-blue-50 transition-colors">
                                <s.icon className="text-brand-blue-light" size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                            <p className="text-sm text-slate-600">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
