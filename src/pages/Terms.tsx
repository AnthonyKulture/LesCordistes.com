import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Scale, Lock, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

export const Terms: React.FC = () => {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Conditions Générales d’Utilisation (CGU) - LesCordistes.com",
        "description": "Consultez les CGU de LesCordistes.com. Notre rôle d'intermédiaire, vos engagements en sécurité et protection des données (RGPD).",
        "publisher": {
            "@type": "Organization",
            "name": "LesCordistes.com"
        }
    };

    const sections = [
        {
            icon: <FileText className="text-brand-blue" />,
            title: "Article 1 : Objet et Services",
            content: (
                <>
                    <p>La plateforme LesCordistes.com est un outil de mise en relation dédié exclusivement aux travaux en hauteur, accès difficiles, inspection, maintenance et nettoyage. Elle permet :</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Aux Clients (B2B/B2C)</strong> : De déposer gratuitement des besoins de travaux via un formulaire guidé.</li>
                        <li><strong>Aux Professionnels</strong> : De consulter des missions qualifiées et d'accéder aux coordonnées des Clients via un système de crédits payants.</li>
                    </ul>
                </>
            )
        },
        {
            icon: <Scale className="text-amber-500" />,
            title: "Article 2 : Rôle de \"Simple Intermédiaire\" (Exclusion de Responsabilité)",
            content: (
                <div className="space-y-3">
                    <p>LesCordistes.com agit en tant qu'opérateur de plateforme en ligne.</p>
                    <p><strong>Indépendance</strong> : La plateforme n'est ni une entreprise de travaux, ni un cabinet d'expertise, ni l'employeur des cordistes.</p>
                    <p><strong>Absence de solidarité</strong> : Le contrat de prestation est conclu exclusivement entre le Client et le Professionnel. La plateforme n'est pas solidaire des obligations contractuelles, des retards, des malfaçons ou des accidents survenant sur le chantier.</p>
                    <p><strong>Paiement des travaux</strong> : Les transactions relatives aux chantiers s'effectuent hors plateforme.</p>
                </div>
            )
        },
        {
            icon: <CheckCircle className="text-green-500" />,
            title: "Article 3 : Validation et Modération des Missions",
            content: (
                <div className="space-y-3">
                    <p>Pour garantir la qualité du service, aucune mission n'est publiée sans validation interne par l'administrateur.</p>
                    <p>La plateforme se réserve le droit de refuser toute demande incomplète, incohérente ou ne relevant pas des travaux en hauteur.</p>
                    <p>Le délai de validation peut varier selon la complexité de la demande.</p>
                </div>
            )
        },
        {
            icon: <Shield className="text-brand-blue" />,
            title: "Article 4 : Engagements du Professionnel (Sécurité et Assurance)",
            content: (
                <div className="space-y-3">
                    <p>L'accès aux leads est réservé aux professionnels ayant complété leur profil.</p>
                    <p><strong>Certifications</strong> : Le professionnel s'engage à détenir les certifications requises (ex: CQP Cordiste, IRATA) pour les interventions sollicitées.</p>
                    <p><strong>Assurances</strong> : Le professionnel doit être à jour de ses assurances RC Pro et Décennale. Bien que la plateforme puisse demander copie de ces documents, il appartient au Client de vérifier leur validité finale avant toute signature de devis.</p>
                </div>
            )
        },
        {
            icon: <AlertTriangle className="text-brand-blue" />,
            title: "Article 5 : Système de Mise en Relation et Crédits",
            content: (
                <div className="space-y-3">
                    <p><strong>Accès aux coordonnées</strong> : Le professionnel utilise des crédits pour débloquer le contact (nom, email, téléphone) du Client.</p>
                    <p><strong>Limitation</strong> : Pour garantir la pertinence des réponses, la plateforme peut limiter le nombre de professionnels autorisés à acheter un même lead.</p>
                    <p><strong>Garantie Lead Invalide</strong> : En cas de coordonnées manifestement erronées, un remboursement en crédits peut être effectué après vérification manuelle par l'administrateur.</p>
                </div>
            )
        },
        {
            icon: <Lock className="text-indigo-500" />,
            title: "Article 6 : Données Personnelles (RGPD)",
            content: (
                <div className="space-y-3">
                    <p>Conformément au RGPD, les données collectées (localisation, description du besoin, photos) sont utilisées pour la qualification et la mise en relation.</p>
                    <p>Le Client consent à ce que ses coordonnées soient transmises aux professionnels ayant acquis le lead correspondant à sa mission.</p>
                    <p>Tout utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données.</p>
                </div>
            )
        },
        {
            icon: <Scale className="text-slate-600" />,
            title: "Article 7 : Loi Applicable et Litiges",
            content: (
                <p>Les présentes CGU sont soumises au droit français. Tout litige relatif à l'utilisation de la plateforme sera soumis aux tribunaux compétents du siège social de l'éditeur.</p>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <Helmet>
                <title>Conditions Générales d’Utilisation (CGU) - LesCordistes.com</title>
                <meta name="description" content="Consultez les CGU de LesCordistes.com. Notre rôle d'intermédiaire, vos engagements en sécurité et protection des données (RGPD)." />
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
                    <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                        Conditions Générales <span className="text-brand-blue">d’Utilisation</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Version optimisée pour la sécurité et la qualité de service.
                    </p>
                    <div className="w-24 h-1 bg-brand-blue mx-auto mt-6 rounded-full" />
                </motion.div>

                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <motion.section
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                            </div>
                            <div className="text-slate-600 leading-relaxed pl-2 border-l-2 border-slate-100 ml-6">
                                {section.content}
                            </div>
                        </motion.section>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-center text-slate-400 text-sm"
                >
                    <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
