import type { Metadata } from 'next'
import Link from 'next/link'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

export const metadata: Metadata = {
    title: 'Cordiste ou Échafaudage : Que Choisir ? Comparatif Complet',
    description: 'Cordiste vs échafaudage : quand choisir l\'un ou l\'autre ? Comparatif coût, délai, autorisations et contraintes. Guide pratique pour maîtres d\'ouvrage et gestionnaires de bâtiments.',
    alternates: { canonical: `${SEO_BASE_URL}/cordiste-vs-echafaudage` },
    openGraph: {
        title: 'Cordiste ou Échafaudage : Comparatif et Guide de Choix',
        description: 'Cordiste vs échafaudage : comparatif complet coût, délai, autorisations et cas d\'usage. Faites le bon choix pour vos travaux en hauteur.',
        url: `${SEO_BASE_URL}/cordiste-vs-echafaudage`,
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Article',
            '@id': `${SEO_BASE_URL}/cordiste-vs-echafaudage#article`,
            headline: 'Cordiste ou échafaudage : que choisir et quand ?',
            description: 'Comparatif complet entre travaux sur cordes et échafaudage : coûts, délais, autorisations, avantages et cas d\'usage concrets pour vous aider à faire le bon choix.',
            url: `${SEO_BASE_URL}/cordiste-vs-echafaudage`,
            inLanguage: 'fr',
            datePublished: '2025-01-01',
            dateModified: '2026-04-11',
            author: {
                '@type': 'Organization',
                '@id': `${SEO_BASE_URL}/#organization`,
                name: SEO_BRAND_NAME,
            },
            publisher: {
                '@type': 'Organization',
                '@id': `${SEO_BASE_URL}/#organization`,
                name: SEO_BRAND_NAME,
            },
            mainEntityOfPage: `${SEO_BASE_URL}/cordiste-vs-echafaudage`,
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'Cordiste vs Échafaudage', item: `${SEO_BASE_URL}/cordiste-vs-echafaudage` },
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'Dans quels cas un cordiste est-il obligatoire ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Le travail sur cordes s\'impose lorsque l\'installation d\'un échafaudage est impossible ou économiquement disproportionnée : voirie étroite ou impossible à bloquer, façades classées interdisant la fixation d\'une structure, zones industrielles à risques (SEVESO, nucléaire), structures en hauteur isolées (pylônes, cheminées, falaises), ou urgences nécessitant une intervention sous 24-48h sans délai de montage.' },
                },
                {
                    '@type': 'Question',
                    name: 'L\'échafaudage est-il toujours plus sûr que le travail sur cordes ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Non. Le travail sur cordes est réglementé par le Code du travail (art. R4323-59 à R4323-89) et implique des cordistes titulaires du CQP ou de la certification IRATA internationale. Ces techniciens utilisent des systèmes redondants (deux cordes indépendantes) qui offrent un niveau de sécurité équivalent voire supérieur à un échafaudage mal monté ou mal maintenu.' },
                },
                {
                    '@type': 'Question',
                    name: 'Faut-il une autorisation pour faire intervenir un cordiste ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Dans la grande majorité des cas, non. Le travail sur cordes ne nécessite pas d\'autorisation d\'occupation du domaine public (AOT) car aucune structure n\'est installée sur la voie publique. En revanche, une Autorisation de Travaux est parfois requise pour les bâtiments classés ou protégés. Un plan de prévention doit être établi si le client est une entreprise (art. R4512-2 du Code du travail).' },
                },
                {
                    '@type': 'Question',
                    name: 'Peut-on combiner cordiste et échafaudage sur le même chantier ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Oui, c\'est une approche courante sur les grands chantiers de ravalement. L\'échafaudage couvre les niveaux bas accessibles facilement, tandis que les cordistes prennent en charge les zones hautes ou les éléments architecturaux complexes (corniches, balcons, lucarnes) que l\'échafaudage ne peut pas atteindre. Cette combinaison optimise les coûts globaux sur les façades de grande hauteur.' },
                },
            ],
        },
    ],
}

const COMPARATIF = [
    { critere: 'Délai de mise en œuvre', cordiste: '24 à 48h', echafaudage: '1 à 3 semaines' },
    { critere: 'Autorisation de voirie (AOT)', cordiste: 'Rarement requise', echafaudage: 'Souvent obligatoire' },
    { critere: 'Coût pour façade R+5 (300 m²)', cordiste: '2 000 – 4 000 € HT', echafaudage: '7 000 – 14 000 € HT' },
    { critere: 'Impact sur la voie publique', cordiste: 'Nul ou minimal', echafaudage: 'Fort (trottoir, stationnement)' },
    { critere: 'Perturbation des occupants', cordiste: 'Faible', echafaudage: 'Élevée (obstructions, bruit)' },
    { critere: 'Accès aux zones complexes', cordiste: 'Excellent (falaises, IGH, pylônes)', echafaudage: 'Limité (terrain plat requis)' },
    { critere: 'Adapté aux travaux lourds (maçonnerie, ITE)', cordiste: 'Partiel', echafaudage: 'Optimal' },
    { critere: 'Durée de chantier > 3 semaines', cordiste: 'Moins efficace', echafaudage: 'Avantageux' },
    { critere: 'Zones classées / Monuments Historiques', cordiste: 'Idéal (sans fixation lourde)', echafaudage: 'Possible avec autorisation ABF' },
    { critere: 'Urgence (sécurisation, sinistre)', cordiste: 'Intervention sous 24h possible', echafaudage: 'Délai minimum 5-7 jours' },
]

const CAS_CORDISTE = [
    { titre: 'Voirie étroite ou impossible à fermer', desc: 'Ruelles historiques, rues commerçantes, centre-villes piétonniers : l\'installation d\'un échafaudage exige souvent la fermeture de la rue. Impossible dans beaucoup de contextes. Le cordiste ne bloque rien.' },
    { titre: 'Bâtiment classé ou inscrit', desc: 'Les Monuments Historiques, les secteurs sauvegardés et les AVAP limitent ou interdisent la fixation de structures sur la façade. Le travail sur cordes s\'ancre sur la toiture ou des points discrets, sans endommager l\'ouvrage.' },
    { titre: 'Urgence et délais courts', desc: 'Un sinistre, une façade qui se décroche, un élément menaçant à purger : le cordiste est mobilisable sous 24 à 48h. Pas de délai de montage, pas d\'instruction administrative.' },
    { titre: 'Structures industrielles isolées', desc: 'Cheminées, silos, pylônes, éoliennes, falaises : ces structures ne peuvent pas être échafaudées. Le travail sur cordes est la seule solution réglementairement reconnue (art. R4323-59 du Code du travail).' },
    { titre: 'Environnements à risques (SEVESO, nucléaire)', desc: 'Les sites classés exigent des techniciens habilités et une mobilisation légère. L\'échafaudage représente un risque supplémentaire dans ces environnements. Les cordistes certifiés interviennent avec un empreinte minimale.' },
    { titre: 'Travaux ponctuels sur zones précises', desc: 'Remplacement d\'un joint, d\'une vitre, d\'une section de gouttière, inspection d\'un balcon : mobiliser un échafaudage complet est économiquement absurde. Le cordiste cible précisément la zone concernée.' },
]

const CAS_ECHAFAUDAGE = [
    { titre: 'Chantier de longue durée (> 3 semaines)', desc: 'Sur un ravalement complet de façade mobilisant plusieurs corps de métiers (maçons, peintres, façadiers) pendant plusieurs semaines, l\'échafaudage permet à tous d\'intervenir en parallèle.' },
    { titre: 'Travaux lourds avec charge importante', desc: 'Les travaux d\'isolation thermique par l\'extérieur (ITE), de maçonnerie lourde ou de décoffrage nécessitent une plateforme de travail stable et large pour manipuler des matériaux volumineux.' },
    { titre: 'Surfaces continues basses (RDC à R+2)', desc: 'Pour les façades basses à portée facile, l\'échafaudage reste économique si le chantier est de longue durée, car son coût de location se rentabilise sur la durée.' },
    { titre: 'Contraintes de terrain permettant l\'installation', desc: 'Si la voirie est large, le trottoir peut être neutralisé et l\'autorisation obtenue sans difficulté, l\'échafaudage peut être une option complémentaire pour les zones basses.' },
]

const TOP_SERVICES = [
    { name: 'Nettoyage de façade', slug: 'nettoyage-facade' },
    { name: 'Ravalement de façade', slug: 'ravalement-facade' },
    { name: 'Lavage de vitres', slug: 'lavage-vitres' },
    { name: 'Nettoyage de toiture', slug: 'nettoyage-toiture' },
]

const TOP_CITIES = [
    { name: 'Paris', slug: 'paris' },
    { name: 'Lyon', slug: 'lyon' },
    { name: 'Marseille', slug: 'marseille' },
    { name: 'Bordeaux', slug: 'bordeaux' },
    { name: 'Toulouse', slug: 'toulouse' },
    { name: 'Lille', slug: 'lille' },
]

export default function CordisteVsEchafaudalePage() {
    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        Cordiste ou Échafaudage :<br />
                        <span className="text-brand-blue-light">Que Choisir et Quand ?</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        Comparatif complet : coûts, délais, autorisations et cas d'usage concrets pour faire le bon choix sur votre chantier.
                    </p>
                    <Link
                        href="/post-job"
                        className="inline-block bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-3 text-lg font-bold rounded-xl transition-colors"
                    >
                        Obtenir un devis cordiste sous 48h
                    </Link>
                </div>
            </div>

            <div className="container max-w-5xl py-16">

                <div className="prose prose-lg max-w-none text-slate-700 mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Deux solutions complémentaires, pas interchangeables</h2>
                    <p>
                        Le travail sur cordes (technique d'accès et de positionnement par cordes, ou TAPC) et l'échafaudage sont deux réponses à un même problème : <strong>accéder à une zone en hauteur pour y effectuer des travaux</strong>. Mais ils ne répondent pas aux mêmes contraintes, ne coûtent pas pareil et ne s'adaptent pas aux mêmes contextes.
                    </p>
                    <p>
                        La réglementation française (Code du travail, art. R4323-59 à R4323-89) stipule que le travail sur cordes est une technique d'accès à part entière, avec ses propres exigences de formation (CQP Cordiste obligatoire), de matériel et de procédures. Ce n'est pas une solution de substitution dégradée : c'est une <strong>spécialité à part entière</strong>, plus adaptée dans de nombreux contextes urbains et industriels.
                    </p>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Tableau comparatif : cordiste vs échafaudage</h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="text-left p-4 font-semibold">Critère</th>
                                    <th className="text-center p-4 font-semibold text-brand-blue-light">Cordiste</th>
                                    <th className="text-center p-4 font-semibold">Échafaudage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARATIF.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="p-4 font-medium text-slate-900">{row.critere}</td>
                                        <td className="p-4 text-center text-brand-blue font-semibold">{row.cordiste}</td>
                                        <td className="p-4 text-center text-slate-600">{row.echafaudage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        <span className="inline-block bg-brand-blue text-white px-3 py-1 rounded-lg mr-2 text-lg">✓</span>
                        6 cas où le cordiste s'impose
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {CAS_CORDISTE.map((cas, i) => (
                            <div key={i} className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                <h3 className="font-bold text-slate-900 mb-2">{cas.titre}</h3>
                                <p className="text-slate-600 text-sm">{cas.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        <span className="inline-block bg-slate-600 text-white px-3 py-1 rounded-lg mr-2 text-lg">≈</span>
                        4 cas où l'échafaudage reste pertinent
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {CAS_ECHAFAUDAGE.map((cas, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-2">{cas.titre}</h3>
                                <p className="text-slate-600 text-sm">{cas.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Réglementation : ce que dit le Code du travail</h2>
                    <div className="prose prose-sm max-w-none text-slate-600">
                        <p>Le travail sur cordes est régi par les articles <strong>R4323-59 à R4323-89 du Code du travail</strong>. Ces textes définissent :</p>
                        <ul>
                            <li>L'obligation de formation spécifique pour les techniciens (CQP Cordiste ou certification IRATA)</li>
                            <li>L'utilisation obligatoire de deux cordes indépendantes (corde de travail + corde de sécurité)</li>
                            <li>La nécessité d'un plan de prévention entre l'entreprise utilisatrice et le prestataire (art. R4512-2)</li>
                            <li>L'exigence d'une analyse des risques et d'un PPSPS (Plan Particulier de Sécurité) sur les chantiers importants</li>
                        </ul>
                        <p>Le CQP Cordiste (Certificat de Qualification Professionnelle, art. L6314-1 du Code du travail) est la certification nationale obligatoire pour exercer en France. La certification IRATA est la référence internationale, notamment pour les chantiers pétroliers et offshore.</p>
                    </div>
                </div>

                <div className="mb-16 grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Services cordiste associés</h3>
                        <ul className="space-y-2">
                            {TOP_SERVICES.map((s) => (
                                <li key={s.slug}>
                                    <Link href={`/cordiste-paris/${s.slug}`} className="text-brand-blue hover:underline font-medium">
                                        → {s.name} par cordiste
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Trouver un cordiste près de chez vous</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {TOP_CITIES.map((city) => (
                                <Link
                                    key={city.slug}
                                    href={`/cordiste-${city.slug}`}
                                    className="text-center bg-slate-50 border border-slate-200 rounded-lg p-2 hover:border-brand-blue hover:text-brand-blue text-slate-700 transition-colors text-sm font-medium"
                                >
                                    {city.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">FAQ : cordiste vs échafaudage</h2>
                    <div className="space-y-6">
                        {[
                            { q: 'Dans quels cas un cordiste est-il obligatoire ?', r: 'Le travail sur cordes s\'impose lorsque l\'installation d\'un échafaudage est impossible ou économiquement disproportionnée : voirie étroite, façades classées, zones industrielles à risques, structures isolées (pylônes, cheminées, falaises), ou urgences nécessitant une intervention sous 24-48h.' },
                            { q: 'L\'échafaudage est-il toujours plus sûr que le travail sur cordes ?', r: 'Non. Le travail sur cordes impose des systèmes redondants (deux cordes indépendantes) et des techniciens certifiés CQP ou IRATA. Ce niveau de sécurité est équivalent, voire supérieur, à un échafaudage mal monté. Les deux solutions sont également réglementées en France.' },
                            { q: 'Faut-il une autorisation pour faire intervenir un cordiste ?', r: 'Non dans la grande majorité des cas : pas d\'AOT (autorisation d\'occupation du domaine public) car aucune structure n\'est installée au sol. Un plan de prévention est requis si le client est une entreprise (art. R4512-2 du Code du travail).' },
                            { q: 'Peut-on combiner cordiste et échafaudage sur le même chantier ?', r: 'Oui, c\'est fréquent sur les grands ravalements. L\'échafaudage couvre les niveaux bas, les cordistes prennent en charge les zones hautes ou les éléments architecturaux complexes inaccessibles à l\'échafaudage.' },
                        ].map((faq, i) => (
                            <div key={i}>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-slate-600">{faq.r}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-blue rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-3">Besoin d'un cordiste certifié ?</h2>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">Publiez votre besoin en 3 minutes. Nos cordistes CQP/IRATA vous contactent avec un devis adapté à votre contexte, sous 48h.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/post-job"
                            className="inline-block bg-white text-brand-blue hover:bg-slate-100 px-8 py-3 rounded-xl font-bold text-lg transition-colors"
                        >
                            Publier mon besoin — Gratuit
                        </Link>
                        <Link
                            href="/prix-cordiste"
                            className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-blue px-8 py-3 rounded-xl font-bold text-lg transition-colors"
                        >
                            Voir les tarifs détaillés
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
