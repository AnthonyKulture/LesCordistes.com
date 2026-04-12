import type { Metadata } from 'next'
import Link from 'next/link'
import { SEO_BASE_URL, SEO_BRAND_NAME } from '@/constants/seoConfig'

export const metadata: Metadata = {
    title: 'Prix d\'un Cordiste en 2025 : Tarifs, Devis et Facteurs',
    description: 'Combien coûte un cordiste ? Tarifs de 350 à 800 €/jour selon la prestation, la région et les habilitations. Guide complet avec tableau de prix et conseils pour obtenir un devis.',
    alternates: { canonical: `${SEO_BASE_URL}/prix-cordiste` },
    openGraph: {
        title: 'Prix d\'un Cordiste en 2025 : Tarifs et Devis',
        description: 'Tarifs de 350 à 800 €/jour selon la prestation. Guide complet pour budgétiser vos travaux en hauteur sans échafaudage.',
        url: `${SEO_BASE_URL}/prix-cordiste`,
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Article',
            '@id': `${SEO_BASE_URL}/prix-cordiste#article`,
            headline: 'Prix d\'un cordiste en 2025 : tarifs, facteurs et comment obtenir un devis',
            description: 'Guide complet des tarifs d\'intervention cordiste en France : 350 à 800 €/jour selon la prestation, la région et les habilitations requises.',
            url: `${SEO_BASE_URL}/prix-cordiste`,
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
            mainEntityOfPage: `${SEO_BASE_URL}/prix-cordiste`,
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SEO_BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'Prix d\'un cordiste', item: `${SEO_BASE_URL}/prix-cordiste` },
            ],
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'Quel est le tarif journalier d\'un cordiste ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Un cordiste facture en moyenne entre 350 € et 600 € HT par jour et par technicien pour une prestation standard en province. À Paris et sur la Côte d\'Azur, les tarifs montent à 800 € HT/jour. Ces montants incluent la main-d\'œuvre, les équipements EPI et la mise en place. Les déplacements et locations éventuelles de matériel spécifique sont facturés en sus.' },
                },
                {
                    '@type': 'Question',
                    name: 'Comment est calculé le prix d\'un nettoyage de façade par cordiste ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Le prix d\'un nettoyage de façade par cordiste oscille entre 8 et 25 € HT par m² selon la nature du support (béton, pierre, brique, verre), la hauteur du bâtiment, le degré d\'encrassement et l\'accessibilité. La méthode de nettoyage (haute pression, laser, chimique) influence également le tarif. Un devis précis ne peut être établi qu\'après visite technique du site.' },
                },
                {
                    '@type': 'Question',
                    name: 'Le cordiste est-il moins cher que l\'échafaudage ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Pour des interventions ponctuelles ou sur des façades difficiles d\'accès, le cordiste revient significativement moins cher que l\'échafaudage. La location d\'un échafaudage de façade pour un immeuble R+5 coûte entre 3 000 et 8 000 € HT pour 2 à 3 semaines, sans compter la main-d\'œuvre ni les éventuelles autorisations de voirie (AOT). Un cordiste peut réaliser la même prestation en 2 à 5 jours pour 700 à 2 500 € HT.' },
                },
                {
                    '@type': 'Question',
                    name: 'Quels facteurs font varier le prix d\'un cordiste ?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Le tarif d\'un cordiste dépend de : (1) le type de prestation (nettoyage, ravalement, inspection CND, sécurisation) ; (2) la hauteur et la complexité de l\'accès ; (3) les habilitations requises (ATEX, nucléaire, sites militaires) ; (4) la région (Paris et Côte d\'Azur sont 25 à 35 % plus chers) ; (5) les conditions d\'intervention (météo alpine, environnement marin). Un devis gratuit permet d\'obtenir un tarif précis sous 48h.' },
                },
            ],
        },
    ],
}

const TARIFS = [
    { prestation: 'Nettoyage de façade', unite: 'm²', min: 8, max: 25, note: 'Selon support et encrassement' },
    { prestation: 'Lavage de vitres en hauteur', unite: 'm²', min: 5, max: 15, note: 'Par accès sur cordes' },
    { prestation: 'Ravalement / enduit façade', unite: 'm²', min: 25, max: 70, note: 'Hors matériaux' },
    { prestation: 'Nettoyage toiture / démoussage', unite: 'm²', min: 6, max: 20, note: 'Toiture simple pente' },
    { prestation: 'Purge rocheuse', unite: 'jour', min: 450, max: 800, note: 'Étude géotechnique en sus' },
    { prestation: 'Inspection CND industrielle', unite: 'jour', min: 500, max: 900, note: 'Habilitation et rapport inclus' },
    { prestation: 'Régie cordiste (tarif journalier)', unite: 'jour', min: 350, max: 600, note: 'Province — main-d\'œuvre seule' },
    { prestation: 'Régie cordiste (tarif journalier)', unite: 'jour', min: 500, max: 800, note: 'Paris / Côte d\'Azur' },
    { prestation: 'Traitement anti-pigeons / filets', unite: 'ml', min: 15, max: 45, note: 'Pose de filets ou pics' },
    { prestation: 'Calorifugeage tuyauteries', unite: 'ml', min: 40, max: 120, note: 'Hors matériaux isolants' },
]

const TOP_CITIES = [
    { name: 'Paris', slug: 'paris' },
    { name: 'Marseille', slug: 'marseille' },
    { name: 'Lyon', slug: 'lyon' },
    { name: 'Toulouse', slug: 'toulouse' },
    { name: 'Bordeaux', slug: 'bordeaux' },
    { name: 'Nantes', slug: 'nantes' },
    { name: 'Nice', slug: 'nice' },
    { name: 'Strasbourg', slug: 'strasbourg' },
    { name: 'Lille', slug: 'lille' },
    { name: 'Grenoble', slug: 'grenoble' },
    { name: 'Rennes', slug: 'rennes' },
    { name: 'Montpellier', slug: 'montpellier' },
]

export default function PrixCordisteePage() {
    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        Prix d'un Cordiste en 2025 :<br />
                        <span className="text-brand-blue-light">Tarifs, Devis et Facteurs</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4">
                        De 350 à 800 €/jour selon la prestation et la région. Tout ce qu'il faut savoir pour budgétiser vos travaux en hauteur sans mauvaise surprise.
                    </p>
                    <p className="text-sm text-slate-400 mb-8">
                        Mis à jour : avril 2026 · Source : <span className="text-slate-300">LesCordistes.com</span> — analyse de devis sur réseau national de cordistes certifiés
                    </p>
                    <Link
                        href="/post-job"
                        className="inline-block bg-brand-blue hover:bg-brand-blue-light text-white px-8 py-3 text-lg font-bold rounded-xl transition-colors"
                    >
                        Obtenez un devis gratuit sous 48h
                    </Link>
                </div>
            </div>

            <div className="container max-w-5xl py-16">

                <div className="mb-12 bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-amber-900 mb-4">À retenir</h2>
                    <ul className="space-y-2 text-sm text-amber-800">
                        <li>→ <strong>Tarif journalier moyen</strong> : 350 à 600 €/jour HT en province, jusqu'à 800 €/jour HT à Paris et sur la Côte d'Azur.</li>
                        <li>→ <strong>Nettoyage de façade</strong> : 8 à 25 €/m² HT selon le support, la hauteur et la méthode employée.</li>
                        <li>→ <strong>Économie vs échafaudage</strong> : le cordiste coûte 2 à 4× moins cher sur les interventions ponctuelles (façade R+5 : 2 000–4 000 € vs 7 000–14 000 €).</li>
                        <li>→ <strong>Surcoût habilitations</strong> : sites SEVESO, nucléaires ou monuments historiques majorent le tarif de 20 à 45 %.</li>
                        <li>→ <strong>Minimum 2 techniciens</strong> obligatoires par chantier (opérateur + équipier sécurité) selon la réglementation.</li>
                    </ul>
                    <p className="text-xs text-amber-600 mt-4">Source : analyse de devis collectés via LesCordistes.com sur le réseau national de cordistes certifiés CQP/IRATA · Données 2025-2026</p>
                </div>

                <div className="prose prose-lg max-w-none text-slate-700 mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Combien coûte un cordiste ?</h2>
                    <p>
                        Le tarif d'un cordiste n'est pas un montant fixe : il varie en fonction du type de prestation, de la hauteur d'intervention, des habilitations requises et de la localisation géographique. En France, le tarif journalier moyen d'un technicien cordiste se situe entre <strong>350 € et 600 € HT par jour et par personne</strong> pour les interventions standard en province. Dans les marchés premium comme Paris ou la Côte d'Azur, ce tarif peut atteindre <strong>800 € HT/jour</strong>.
                    </p>
                    <p>
                        Pour les prestations facturées au mètre carré — nettoyage de façade, lavage de vitres, ravalement — les prix varient de 5 à 70 €/m² selon le type de support, le degré d'encrassement et la technique employée. Seul un devis établi après visite technique du site garantit un prix précis et adapté à votre chantier.
                    </p>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Tableau des tarifs cordiste par prestation</h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="text-left p-2 sm:p-4 font-semibold">Prestation</th>
                                    <th className="text-center p-2 sm:p-4 font-semibold hidden sm:table-cell">Unité</th>
                                    <th className="text-center p-2 sm:p-4 font-semibold whitespace-nowrap">Min HT</th>
                                    <th className="text-center p-2 sm:p-4 font-semibold whitespace-nowrap">Max HT</th>
                                    <th className="text-left p-4 font-semibold hidden md:table-cell">Remarque</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TARIFS.map((t, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="p-2 sm:p-4 font-medium text-slate-900">{t.prestation}</td>
                                        <td className="p-2 sm:p-4 text-center text-slate-600 hidden sm:table-cell">{t.unite}</td>
                                        <td className="p-2 sm:p-4 text-center font-bold text-brand-blue whitespace-nowrap">{t.min}€</td>
                                        <td className="p-2 sm:p-4 text-center font-bold text-brand-blue whitespace-nowrap">{t.max}€</td>
                                        <td className="p-4 text-slate-500 hidden md:table-cell text-xs">{t.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">* Tarifs indicatifs HT, hors TVA (20 %), hors déplacement et hors matériaux. Source : LesCordistes.com, analyse du réseau national de cordistes certifiés CQP/IRATA, mise à jour avril 2026.</p>
                </div>

                <div className="mb-16 grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Facteurs qui influencent le prix</h2>
                        <div className="space-y-4">
                            {[
                                { titre: 'Type de prestation', texte: 'Un nettoyage de façade est moins coûteux qu\'une inspection CND industrielle ou un calorifugeage de tuyauteries. Les prestations techniques spécialisées (nucléaire, ATEX, militaire) sont majorées de 20 à 45 %.' },
                                { titre: 'Hauteur et complexité d\'accès', texte: 'Plus la hauteur est importante, plus les équipements de protection sont lourds et la mise en sécurité longue. Au-delà de 40 m, un surcoût de préparation est généralement appliqué.' },
                                { titre: 'Habilitations requises', texte: 'Les sites classés SEVESO, nucléaires (CEA), militaires (base navale) ou inscrits aux Monuments Historiques imposent des certifications spécifiques qui majorent les tarifs de 20 à 40 %.' },
                                { titre: 'Région géographique', texte: 'Paris et la Côte d\'Azur : +25 à 35 %. Milieu alpin ou marin (embruns, gel, vent) : +10 à 20 %. Province standard : tarif de base.' },
                                { titre: 'Nombre de techniciens', texte: 'Les travaux en cordes nécessitent au minimum 2 personnes : un opérateur et un équipier sécurité. Certains chantiers imposent 3 ou 4 techniciens, ce qui multiplie le coût journalier.' },
                            ].map((f, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <h3 className="font-bold text-slate-900 mb-1">{f.titre}</h3>
                                    <p className="text-slate-600 text-sm">{f.texte}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Cordiste vs échafaudage : comparaison économique</h2>
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-6">
                            <h3 className="font-bold text-slate-900 mb-4">Exemple : nettoyage façade immeuble R+5 (300 m²)</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Échafaudage (location 3 sem.)', price: '4 500 – 8 000 €', cls: 'text-slate-900' },
                                    { label: 'Main-d\'œuvre sur échafaudage', price: '2 500 – 4 000 €', cls: 'text-slate-900' },
                                    { label: 'AOT (autorisation voirie)', price: '300 – 1 000 €', cls: 'text-slate-900' },
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center gap-3 py-2 border-b border-blue-100">
                                        <span className="text-slate-700 text-sm">{row.label}</span>
                                        <span className={`font-bold whitespace-nowrap shrink-0 ${row.cls}`}>{row.price}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center gap-3 py-2 font-bold text-red-600">
                                    <span className="text-sm">Total échafaudage</span>
                                    <span className="whitespace-nowrap shrink-0">7 300 – 13 000 €</span>
                                </div>
                                <div className="flex justify-between items-center gap-3 py-2 font-bold text-green-700 bg-green-50 rounded-lg px-3">
                                    <span className="text-sm">Total cordistes (3 j., 2 tech.)</span>
                                    <span className="whitespace-nowrap shrink-0">2 100 – 3 600 €</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">* Exemple indicatif. Les tarifs réels varient selon la ville et les spécificités du chantier.</p>
                        </div>
                        <Link
                            href="/cordiste-vs-echafaudage"
                            className="block text-center bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                        >
                            Guide complet : Cordiste vs Échafaudage →
                        </Link>
                    </div>
                </div>

                <div className="mb-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Tarifs par ville</h2>
                    <p className="text-slate-600 mb-6">Les tarifs varient selon le marché local. Consultez les pages dédiées pour connaître les fourchettes de prix spécifiques à votre zone :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {TOP_CITIES.map((city) => (
                            <Link
                                key={city.slug}
                                href={`/cordiste-${city.slug}`}
                                className="text-center bg-white border border-slate-200 rounded-xl p-3 hover:border-brand-blue hover:text-brand-blue font-medium text-slate-700 transition-colors text-sm"
                            >
                                Cordiste {city.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mb-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">FAQ : prix d'un cordiste</h2>
                    <div className="space-y-6">
                        {[
                            { q: 'Quel est le tarif journalier d\'un cordiste ?', r: 'Un cordiste facture en moyenne entre 350 € et 600 € HT par jour et par technicien pour une prestation standard en province. À Paris et sur la Côte d\'Azur, les tarifs montent à 700-800 € HT/jour. Ces montants incluent la main-d\'œuvre, les EPI et la mise en place. Les déplacements et matériaux sont facturés en sus.' },
                            { q: 'Comment est calculé le prix d\'un nettoyage de façade ?', r: 'Le prix au m² d\'un nettoyage de façade par cordiste oscille entre 8 et 25 € HT selon la nature du support (béton, pierre, brique, verre), la hauteur, l\'encrassement et la méthode (haute pression, laser, chimique). Un devis précis nécessite une visite technique préalable.' },
                            { q: 'Le cordiste est-il moins cher que l\'échafaudage ?', r: 'Pour des interventions ponctuelles sur des façades difficiles d\'accès, le cordiste revient significativement moins cher. La location d\'un échafaudage + main-d\'œuvre pour un immeuble R+5 peut atteindre 10 000 à 15 000 €. Les cordistes réalisent souvent la même prestation pour 2 000 à 4 000 €.' },
                            { q: 'La TVA s\'applique-t-elle sur les travaux de cordistes ?', r: 'Oui, les prestations de cordistes sont soumises à la TVA au taux normal de 20 % pour les chantiers industriels et neufs. Pour les travaux de rénovation énergétique sur des logements de plus de 2 ans, le taux réduit de 5,5 % ou 10 % peut s\'appliquer selon la nature des travaux. Vérifiez avec le prestataire.' },
                        ].map((faq, i) => (
                            <div key={i}>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-slate-600">{faq.r}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-blue rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-3">Obtenez votre devis gratuit sous 48h</h2>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">Décrivez votre besoin en 3 minutes. Nos cordistes certifiés disponibles dans votre zone vous contactent directement avec un devis détaillé.</p>
                    <Link
                        href="/post-job"
                        className="inline-block bg-white text-brand-blue hover:bg-slate-100 px-8 py-3 rounded-xl font-bold text-lg transition-colors"
                    >
                        Publier mon besoin — Gratuit
                    </Link>
                </div>
            </div>
        </div>
    )
}
