import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate, Link } from 'react-router-dom';
import { SEO_GLOSSARY, GLOSSARY_CATEGORIES } from '../../constants/seoGlossary';
import { ArrowLeft } from 'lucide-react';

interface Props {
    slugProp?: string;
}

export const GlossaryArticle: React.FC<Props> = ({ slugProp }) => {
    const { slug: paramSlug } = useParams<{ slug: string }>();
    const slug = slugProp || paramSlug;
    
    const term = SEO_GLOSSARY.find(t => t.slug === slug);

    if (!term) return <Navigate to="/404" replace />;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        "name": term.title,
        "description": term.definition,
        "inDefinedTermSet": "https://lescordistes.com/lexique"
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <Helmet>
                <title>{term.title} - Définition Travaux en Hauteur | LesCordistes</title>
                <meta name="description" content={`Définition de ${term.title} : ${term.definition}. Comprendre les standards industriels du travail sur cordes et de l'accès difficile en sécurité.`} />
                <link rel="canonical" href={`https://lescordistes.com/lexique/${term.slug}`} />
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <div className="container max-w-3xl">
                <Link to="/lexique" className="inline-flex items-center text-brand-blue hover:text-brand-blue-light font-medium mb-10 group">
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Retour au dictionnaire
                </Link>

                <article className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-slate-200">
                    <div className="mb-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium text-sm">
                        {GLOSSARY_CATEGORIES[term.category]}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">{term.title}</h1>
                    
                    <div className="text-xl text-brand-blue-dark font-medium p-8 bg-brand-blue/5 rounded-2xl border border-brand-blue/20 mb-10 leading-relaxed shadow-inner">
                        {term.definition}
                    </div>
                    
                    <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-p:leading-loose">
                        <p>{term.content}</p>
                    </div>
                </article>

                <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Besoin d'un cordiste maîtrisant ces standards ?</h3>
                    <p className="text-slate-600 mb-8 max-w-lg">Publiez votre besoin sur la plateforme leader pour obtenir des devis rapides auprès de techniciens certifiés.</p>
                    <Link to="/post-job" className="bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-brand-blue/40 hover:-translate-y-1">
                        Demander un devis en ligne
                    </Link>
                </div>
            </div>
        </div>
    );
};
