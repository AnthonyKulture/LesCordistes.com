'use client'

import React, { useState } from 'react';
import { Shield, HelpCircle, Building, Home, Factory, AlertTriangle, Search, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../components/ui/Toast';
import { CREDIT_PACKS } from '../constants/creditPacks';
import Link from 'next/link';
import posthog from 'posthog-js';

export const Credits: React.FC = () => {
    const { user } = useAuth();
    const { balance } = useCredits();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCanceled = searchParams.get('canceled') === 'true';
    const toast = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleBuyCredits = async (packId: string, amount: number, stripePriceId: string) => {
        if (!user) {
            router.push('/connexion?redirect=/credits');
            return;
        }

        setIsProcessing(packId);

        try {
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packId, amount, userId: user.id, email: user.email, stripePriceId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Erreur lors de la création de la session');
            }

            if (data.url) {
                posthog.capture('checkout_initiated', { pack_id: packId, credits_amount: amount });
                window.location.assign(data.url);
            } else {
                throw new Error('URL Stripe non reçue');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Une erreur est survenue avec le paiement.');
            setIsProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container max-w-5xl">

                {isCanceled && (
                    <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="font-bold">Paiement annulé</p>
                                <p className="text-sm opacity-90">Votre transaction n'a pas abouti. Aucun crédit n'a été décompté.</p>
                            </div>
                        </div>
                        <button onClick={() => router.replace('/credits')} className="text-xs font-bold uppercase tracking-widest hover:underline">
                            Fermer
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Comment ça fonctionne ?</h1>
                    <p className="text-slate-500 text-sm sm:text-base max-w-xl">
                        L'inscription et la consultation des chantiers sont <strong className="text-slate-700">100% gratuites</strong>. Vous payez uniquement pour accéder aux coordonnées d'un client.
                    </p>
                    {user && (
                        <p className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 font-bold px-4 py-2 rounded-full text-sm border border-green-100">
                            <CheckCircle2 size={16} />
                            Solde actuel : {balance} crédit{balance !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* How it works — mobile: list style, desktop: 3 columns */}
                <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-200 mb-8">
                    <h2 className="text-base font-bold text-slate-900 mb-5 uppercase tracking-wider text-center">Pour les cordistes — 3 étapes</h2>
                    <div className="flex flex-col gap-0 md:grid md:grid-cols-3 md:gap-6">
                        {[
                            { icon: Search, label: 'Parcourez les chantiers', desc: 'Consultez toutes les missions disponibles dans votre zone, gratuitement et sans limite.' },
                            { icon: CheckCircle2, label: 'Choisissez votre chantier', desc: 'Trouvez une mission qui correspond à vos compétences et à votre disponibilité.' },
                            { icon: Phone, label: 'Contactez le client', desc: 'Utilisez 1 crédit pour accéder au nom, téléphone et email du client. Vous le contactez directement.' },
                        ].map(({ icon: Icon, label, desc }, i) => (
                            <div key={i} className="flex items-start gap-4 md:flex-col md:items-center md:text-center py-4 md:py-0 border-b border-slate-100 last:border-0 md:border-0">
                                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-blue flex items-center justify-center text-white font-black text-sm md:mb-3">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-0.5">{label}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing */}
                <h2 className="text-lg font-bold text-slate-900 mb-4">Packs de crédits</h2>
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4 mb-8">
                    {CREDIT_PACKS.map((pack) => (
                        <div
                            key={pack.id}
                            className={`bg-white rounded-2xl p-5 relative flex flex-col ${
                                pack.popular
                                    ? 'border-2 border-brand-blue shadow-lg'
                                    : 'border border-slate-200 shadow-sm'
                            }`}
                        >
                            {pack.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                                    Le plus populaire
                                </div>
                            )}
                            <div className="flex items-center justify-between md:flex-col md:text-center mt-2 mb-4 md:mt-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{pack.credits} Crédits</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{pack.description}</p>
                                </div>
                                <div className="flex items-center gap-2 md:flex-col md:items-center md:mt-4 md:mb-2 md:pb-4 md:border-b md:border-slate-100 md:w-full">
                                    {pack.discount && (
                                        <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-xs">
                                            {pack.discount}
                                        </span>
                                    )}
                                    <div className="text-right md:text-center">
                                        <div className="text-3xl font-bold text-slate-900">{pack.price}€</div>
                                        <div className="text-xs text-slate-400">{pack.pricePerLead} / contact</div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block border-b border-slate-100 mb-4" />
                            <div className="mt-auto">
                                {user ? (
                                    <Button
                                        variant={pack.popular ? 'primary' : 'outline'}
                                        className="w-full"
                                        onClick={() => handleBuyCredits(pack.id, pack.credits, pack.stripePriceId)}
                                        isLoading={isProcessing === pack.id}
                                        disabled={isProcessing !== null && isProcessing !== pack.id}
                                    >
                                        Acheter le pack
                                    </Button>
                                ) : (
                                    <Link href="/inscription-cordiste">
                                        <Button variant={pack.popular ? 'primary' : 'outline'} className="w-full">
                                            Créer un compte <ArrowRight size={14} className="ml-1" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {!user && (
                    <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-6 mb-10 text-center">
                        <p className="text-slate-700 font-semibold mb-3">Déjà inscrit ?</p>
                        <Link href="/connexion?redirect=/credits">
                            <Button variant="outline" size="sm">Se connecter</Button>
                        </Link>
                    </div>
                )}

                {/* Cost by project type */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-10">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 text-center">Combien de crédits par chantier ?</h2>
                    <p className="text-sm text-slate-500 text-center mb-6">Le coût varie selon le potentiel du chantier — plus le chantier est important, plus le crédit est élevé.</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                <Home className="text-slate-600" size={24} />
                            </div>
                            <span className="bg-white text-slate-800 font-bold px-3 py-1 rounded-full text-sm shadow-sm mb-3">1 Crédit</span>
                            <h3 className="font-bold text-slate-900 mb-2">Petits travaux / Particuliers</h3>
                            <p className="text-sm text-slate-500">Ex : nettoyage de vitres, petite zinguerie, intervention ponctuelle.</p>
                        </div>
                        <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-blue-50">
                                <Building className="text-brand-blue" size={24} />
                            </div>
                            <span className="bg-brand-blue text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm mb-3">3 Crédits</span>
                            <h3 className="font-bold text-slate-900 mb-2">Bâtiment / Copropriété</h3>
                            <p className="text-sm text-slate-500">Ex : ravalement de façade, peinture complète, filets anti-pigeons.</p>
                        </div>
                        <div className="p-5 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-orange-50">
                                <Factory className="text-orange-600" size={24} />
                            </div>
                            <span className="bg-orange-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm mb-3">5 Crédits</span>
                            <h3 className="font-bold text-slate-900 mb-2">Industrie / Gros chantiers</h3>
                            <p className="text-sm text-slate-500">Ex : éoliennes, pylônes haute tension, chantiers offshore, interventions complexes.</p>
                        </div>
                    </div>
                </div>

                {/* Trust */}
                <div className="grid md:grid-cols-2 gap-6 pb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Shield className="text-slate-600" size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">Paiement 100% sécurisé</h4>
                            <p className="text-sm text-slate-600">Paiements traités par Stripe. Aucune information bancaire stockée sur nos serveurs.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <HelpCircle className="text-slate-600" size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">Crédits sans expiration</h4>
                            <p className="text-sm text-slate-600">Vos crédits n'ont aucune date limite. Achetez maintenant, utilisez quand vous voulez.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
