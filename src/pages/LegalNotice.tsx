import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Building2, Globe, Shield, Scale, Info, MapPin } from 'lucide-react';

export const LegalNotice: React.FC = () => {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Mentions Légales - LesCordistes.com",
        "description": "Consultez les mentions légales de LesCordistes.com. Informations sur l'éditeur, l'hébergeur et les conditions d'activité de la plateforme.",
        "publisher": {
            "@type": "Organization",
            "name": "LesCordistes.com"
        }
    };

    const sections = [
        {
            title: "1. Éditeur du Site",
            icon: <Building2 className="text-brand-blue" />,
            content: (
                <div className="space-y-2">
                    <p>Le site LesCordistes.com est édité par :</p>
                    <ul className="space-y-1 text-slate-600">
                        <li><strong>Dénomination sociale :</strong> [À compléter : Nom de votre structure, ex: SAS LesCordistes]</li>
                        <li><strong>Siège social :</strong> [À compléter : Adresse complète du siège]</li>
                        <li><strong>SIREN/SIRET :</strong> [À compléter]</li>
                        <li><strong>TVA Intracommunautaire :</strong> [À compléter]</li>
                        <li><strong>Directeur de la publication :</strong> [À compléter : Votre Nom et Prénom]</li>
                        <li><strong>Contact :</strong> [À compléter : Adresse email de support dédiée]</li>
                    </ul>
                </div>
            )
        },
        {
            title: "2. Hébergement du Site",
            icon: <Globe className="text-brand-blue" />,
            content: (
                <div className="space-y-2">
                    <p>Le site est hébergé par :</p>
                    <ul className="space-y-1 text-slate-600">
                        <li><strong>Nom de l'hébergeur :</strong> [À compléter : ex. AWS, OVH, Hostinger]</li>
                        <li><strong>Adresse :</strong> [À compléter]</li>
                        <li><strong>Contact :</strong> [À compléter : Numéro de téléphone ou email]</li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Activité de la Plateforme",
            icon: <Info className="text-brand-blue" />,
            content: (
                <div className="space-y-3">
                    <p>LesCordistes.com est une plateforme de mise en relation dédiée aux travaux sur cordes et en hauteur.</p>
                    <p><strong>Objet :</strong> La plateforme permet le dépôt de missions par les clients, la validation interne, et la mise en relation avec des professionnels via un système de crédits payants.</p>
                    <p><strong>Rôle :</strong> Agit en tant que simple intermédiaire technique entre les Clients (particuliers, syndics, industriels) et les Professionnels.</p>
                </div>
            )
        },
        {
            title: "4. Propriété Intellectuelle",
            icon: <Shield className="text-brand-blue" />,
            content: "L'ensemble des éléments constituant le site (textes, graphismes, logos, images) est la propriété exclusive de l'éditeur, sauf mention contraire. Toute reproduction ou représentation totale ou partielle du site sans autorisation est interdite."
        },
        {
            title: "5. Protection des Données",
            icon: <Scale className="text-brand-blue" />,
            content: "Conformément au RGPD, les utilisateurs disposent d'un droit d'accès, de rectification et de suppression de leurs données. La plateforme utilise des protocoles sécurisés pour protéger les échanges."
        },
        {
            title: "6. Loi Applicable",
            icon: <MapPin className="text-brand-blue" />,
            content: "Les présentes mentions sont soumises au droit français. Tout litige relatif à l'utilisation de la plateforme sera soumis aux tribunaux compétents du siège social de l'éditeur."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <Helmet>
                <title>Mentions Légales - LesCordistes.com</title>
                <meta name="description" content="Informations légales concernant l'éditeur et l'hébergeur du site LesCordistes.com." />
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
                        Mentions <span className="text-brand-blue">Légales</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Informations obligatoires concernant l'exploitation du site.
                    </p>
                    <div className="w-24 h-1 bg-brand-blue mx-auto mt-6 rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, idx) => (
                        <motion.section
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                            </div>
                            <div className="text-slate-600 leading-relaxed text-sm flex-grow">
                                {section.content}
                            </div>
                        </motion.section>
                    ))}
                </div>

                <div className="text-center mt-12 text-slate-400 text-xs">
                    <p>Dernière mise à jour : 24 mars 2026</p>
                </div>
            </div>
        </div>
    );
};

export default LegalNotice;
