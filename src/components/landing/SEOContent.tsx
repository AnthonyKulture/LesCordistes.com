import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const QUESTIONS: Array<{ question: string; answer: React.ReactNode; cta?: { label: string; href: string } }> = [
    {
        question: "Quel est le prix d'un cordiste en France ?",
        answer: (
            <>
                Un cordiste certifié facture en moyenne <strong>350 € à 600 € HT par jour</strong> selon la complexité du chantier. Pour un nettoyage de façade, comptez <strong>8 € à 25 €/m²</strong> selon la salissure et la technique. Le travail sur cordes coûte <strong>30 % à 50 % moins cher qu'un échafaudage</strong> grâce à l'absence de montage et d'occupation du domaine public.
            </>
        ),
        cta: { label: 'Détail des tarifs cordiste', href: '/prix-cordiste' },
    },
    {
        question: "Quelles certifications exiger d'un cordiste qualifié ?",
        answer: (
            <>
                Le <strong>CQP Cordiste</strong> (Certificat de Qualification Professionnelle) est <strong>obligatoire en France</strong> pour tout travail sur cordes (Code du travail, art. L6314-1 et R.4323-58). La certification <strong>IRATA International</strong> (norme britannique) s'ajoute pour l'industrie lourde. Une attestation <strong>RC Pro</strong> à jour est indispensable pour couvrir d'éventuels dommages matériels ou corporels causés à un tiers.
            </>
        ),
        cta: { label: 'Notre processus de vérification', href: '/verification-pros' },
    },
    {
        question: 'En combien de temps recevoir des devis sur LesCordistes.com ?',
        answer: (
            <>
                Vous publiez votre besoin en 3 minutes et recevez vos premiers devis sous <strong>48 heures ouvrées</strong> (express 24 h sur demande). Notre réseau compte <strong>50 cordistes certifiés vérifiés</strong> couvrant toutes les grandes villes de France (Paris, Marseille, Lyon, Toulouse, Lille, Bordeaux, Nantes, Nice, Strasbourg…). Le dépôt est gratuit, sans commission sur la transaction.
            </>
        ),
        cta: { label: 'Publier une mission', href: '/post-job' },
    },
]

export const SEOContent: React.FC = () => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div className="order-2 md:order-1 relative md:sticky md:top-24">
                        <div className="absolute -inset-4 bg-brand-blue/10 rounded-3xl transform rotate-3 z-0" />
                        <Image
                            src="/lescordistes.com-new-00.webp"
                            alt="Cordiste professionnel réalisant un ravalement de façade"
                            width={600}
                            height={500}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 600px"
                            quality={70}
                            className="relative z-10 w-full h-[500px] object-cover rounded-2xl shadow-xl"
                        />
                        <ul className="relative z-10 mt-6 space-y-3">
                            {[
                                { title: 'Polyvalence', desc: 'Façade, toiture, industrie, génie civil, éolien.' },
                                { title: 'Sécurité absolue', desc: 'Formation rigoureuse et équipement normé EPI.' },
                                { title: 'Économie', desc: 'Pas de nacelle, pas d\'occupation du domaine public.' },
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="text-brand-blue-light mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-700 text-sm md:text-base">
                                        <strong>{item.title} :</strong> {item.desc}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="order-1 md:order-2 space-y-10">
                        <div>
                            <p className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-3">
                                Cordistes &amp; travaux en hauteur
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                                Les questions que tout le monde se pose avant de réserver un cordiste
                            </h2>
                        </div>

                        {QUESTIONS.map((item, idx) => (
                            <article key={idx} className="border-l-4 border-brand-blue pl-6 py-2">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-snug">
                                    {item.question}
                                </h3>
                                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                                    {item.answer}
                                </p>
                                {item.cta && (
                                    <Link
                                        href={item.cta.href}
                                        className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-brand-blue-light hover:underline"
                                    >
                                        {item.cta.label} →
                                    </Link>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
