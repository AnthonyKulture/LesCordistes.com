'use client'

import React from 'react';
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
                        <li><strong>Dénomination sociale :</strong> Anthony PROFIT — Micro-entrepreneur</li>
                        <li><strong>Siège social :</strong> 2 rue Pierre Pietri, 06000 Nice</li>
                        <li><strong>SIRET :</strong> 850 723 552 00020</li>
                        <li><strong>Directeur de la publication :</strong> Anthony PROFIT</li>
                        <li><strong>Contact :</strong> anthony@lescordistes.com</li>
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
                        <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                        <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
                        <li><strong>Site :</strong> <a href="https://vercel.com" className="text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
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
            title: "Cadre professionnel et conformité métier",
            icon: <Shield className="text-brand-blue" />,
            content: (
                <div className="space-y-3">
                    <p>LesCordistes.com s'inscrit dans le cadre réglementaire français du travail sur cordes :</p>
                    <ul className="space-y-1 text-slate-600">
                        <li><strong>Code du travail :</strong> articles L6314-1 (qualification professionnelle) et R.4323-58 (travail en hauteur sur cordes)</li>
                        <li><strong>Arrêté du 4 août 2005</strong> relatif à la prévention des risques de chute lors d'opérations sur cordes</li>
                        <li><strong>Diplôme de référence :</strong> CQP Cordiste — Certificat de Qualification Professionnelle inscrit au RNCP, délivré par France Compétences</li>
                        <li><strong>Norme internationale :</strong> IRATA International (Industrial Rope Access Trade Association)</li>
                    </ul>
                    <p className="text-sm">Organismes de référence du secteur consultés pour nos contenus techniques : <strong>OPPBTP</strong> (Organisme Professionnel de Prévention du Bâtiment et des Travaux Publics), <strong>SFETH</strong> (Syndicat Français des Entreprises de Travaux en Hauteur), <strong>INRS</strong> (Institut National de Recherche et de Sécurité — recommandation R408).</p>
                </div>
            )
        },
        {
            title: "Assurance Responsabilité Civile Professionnelle",
            icon: <Shield className="text-brand-blue" />,
            content: (
                <div className="space-y-2">
                    <p>L'éditeur du site est couvert par une assurance Responsabilité Civile Professionnelle conforme à l'activité d'intermédiation technique :</p>
                    <ul className="space-y-1 text-slate-600">
                        <li><strong>Compagnie :</strong> à compléter par l'éditeur</li>
                        <li><strong>Numéro de police :</strong> à compléter par l'éditeur</li>
                        <li><strong>Garantie territoriale :</strong> France métropolitaine</li>
                    </ul>
                    <p className="text-xs italic text-slate-500">L'activité de la plateforme est une mise en relation technique, sans intervention sur les chantiers. La RC Pro de chaque cordiste publié est vérifiée par notre équipe avant activation de son profil (cf. <a href="/verification-pros" className="text-brand-blue hover:underline">processus de vérification</a>).</p>
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
