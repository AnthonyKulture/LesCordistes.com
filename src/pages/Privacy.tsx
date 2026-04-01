import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Clock, UserCheck, HardDrive, FileText, Mail } from 'lucide-react';

export const Privacy: React.FC = () => {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Politique de Confidentialité (RGPD) - LesCordistes.com",
        "description": "Consultez notre politique de protection des données personnelles (RGPD). Apprenez comment nous collectons, utilisons et protégeons vos données sur LesCordistes.com.",
        "publisher": {
            "@type": "Organization",
            "name": "LesCordistes.com"
        }
    };

    const sections = [
        {
            title: "1. Responsable du Traitement",
            icon: <UserCheck className="text-brand-blue" />,
            content: "La plateforme LesCordistes.com est responsable du traitement des données à caractère personnel collectées sur le site. Pour toute question relative à vos données, vous pouvez contacter notre service support via l'adresse email de contact figurant dans les mentions légales."
        },
        {
            title: "2. Données Collectées et Finalités",
            icon: <Eye className="text-brand-blue" />,
            content: (
                <div className="space-y-4">
                    <p>Nous collectons uniquement les données strictement nécessaires à la mise en relation B2B/B2C et à la qualification des travaux en hauteur.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-2">Pour les Clients :</h4>
                            <p className="text-sm text-slate-600">Nom, prénom, société, e-mail, téléphone, localisation du chantier et description du besoin (incluant photos).</p>
                            <p className="text-xs text-slate-500 mt-2"><strong>Finalité :</strong> Qualifier la mission et permettre la mise en relation avec des pros pertinents.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-2">Pour les Professionnels :</h4>
                            <p className="text-sm text-slate-600">Raison sociale, spécialités, zone d'intervention, documents d'assurance et de certification (CQP/IRATA).</p>
                            <p className="text-xs text-slate-500 mt-2"><strong>Finalité :</strong> Valider le profil pro, assurer la visibilité et gérer les transactions commerciales.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Partage et Destinataires",
            icon: <Shield className="text-brand-blue" />,
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Consentement de Mise en Relation :</strong> En déposant une mission, le Client consent explicitement à ce que ses coordonnées soient transmises aux professionnels ayant acquis le lead.</li>
                    <li><strong>Nombre Limité :</strong> Le partage des coordonnées est restreint à un nombre limité de professionnels pour garantir la qualité de l'expérience.</li>
                    <li><strong>Sous-traitants :</strong> Les données de paiement sont traitées exclusivement par notre prestataire sécurisé (Stripe). Aucune donnée bancaire n'est stockée chez nous.</li>
                </ul>
            )
        },
        {
            title: "4. Durée de Conservation",
            icon: <Clock className="text-brand-blue" />,
            content: (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <div className="font-bold text-brand-blue">Compte</div>
                        <div className="text-xs text-slate-600">Tant qu'actif</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <div className="font-bold text-brand-blue">Missions</div>
                        <div className="text-xs text-slate-600">3 ans</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <div className="font-bold text-brand-blue">Factures</div>
                        <div className="text-xs text-slate-600">10 ans</div>
                    </div>
                </div>
            )
        },
        {
            title: "5. Sécurité et Hébergement",
            icon: <HardDrive className="text-brand-blue" />,
            content: "Nous mettons en œuvre des mesures de sécurité robustes : authentification sécurisée, protection anti-spam, et hébergement sur des serveurs conformes aux normes européennes (RGPD compliant)."
        },
        {
            title: "6. Vos Droits",
            icon: <FileText className="text-brand-blue" />,
            content: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Vous pouvez exercer ces droits depuis votre tableau de bord ou en contactant le support."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <Helmet>
                <title>Politique de Confidentialité (RGPD) - LesCordistes.com</title>
                <meta name="description" content="Découvrez comment LesCordistes.com protège vos données personnelles conformément au RGPD. Transparence, sécurité et contrôle de vos informations." />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Lock size={16} />
                        RGPD Compliance Certifiée
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                        Politique de <span className="text-brand-blue">Confidentialité</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Protection des données et respect de votre vie privée.
                    </p>
                    <div className="w-24 h-1 bg-brand-blue mx-auto mt-6 rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 gap-6">
                    {sections.map((section, idx) => (
                        <motion.section
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                            </div>
                            <div className="text-slate-600 leading-relaxed">
                                {section.content}
                            </div>
                        </motion.section>
                    ))}
                </div>

                <section className="mt-12 bg-brand-blue rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Shield size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="shrink-0 p-4 bg-white/10 rounded-2xl">
                            <Mail size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Une question sur vos données ?</h3>
                            <p className="opacity-90">
                                Notre délégué à la protection des données est à votre disposition pour toute demande d'exercice de vos droits ou information complémentaire.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="text-center mt-12 text-slate-400 text-sm">
                    <p>Dernière mise à jour : 24 mars 2026. Cette politique peut être amenée à évoluer.</p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
