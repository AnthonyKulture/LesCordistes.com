'use client'

import React, { useState } from 'react';
import { Shield, HelpCircle, Building, Home, Factory, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../components/ui/Toast';
import { CREDIT_PACKS } from '../constants/creditPacks';
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
            router.push('/login');
            return;
        }

        setIsProcessing(packId);
        
        try {
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packId,
                    amount,
                    userId: user.id,
                    email: user.email,
                    stripePriceId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Erreur lors de la création de la session');
            }

            if (data.url) {
                posthog.capture('checkout_initiated', { pack_id: packId, credits_amount: amount, stripe_price_id: stripePriceId });
                // Redirect user to Stripe checkout
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

    const packs = CREDIT_PACKS;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            
            <div className="container max-w-5xl">
                
                {isCanceled && (
                    <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="font-bold">Paiement annulé</p>
                                <p className="text-sm opacity-90">Votre transaction n'a pas abouti. Aucun crédit n'a été décompté.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => router.replace('/credits')}
                            className="text-xs font-bold uppercase tracking-widest hover:underline"
                        >
                            Fermer
                        </button>
                    </div>
                )}

                {/* Banner */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Acheter des crédits</h1>
                    <p className="text-slate-600 max-w-xl mx-auto">
                        Utilisez vos crédits pour débloquer les coordonnées des clients.
                        <strong> 1 crédit = 1 contact client débloqué.</strong>
                    </p>
                    <p className="mt-2 font-bold text-slate-900">Solde actuel : {balance} crédit{balance !== 1 ? 's' : ''}</p>
                </div>



                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {packs.map((pack) => (
                                <div 
                                    key={pack.id} 
                                    className={`bg-white rounded-2xl p-6 relative flex flex-col ${
                                        pack.popular 
                                        ? 'border-2 border-brand-blue shadow-lg scale-105 z-10' 
                                        : 'border border-slate-200 shadow-sm hover:shadow-md transition-shadow'
                                    }`}
                                >
                                    {pack.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                                            Le plus populaire
                                        </div>
                                    )}
                                    
                                    {pack.discount && (
                                        <div className="absolute top-4 right-4 bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-xs">
                                            {pack.discount}
                                        </div>
                                    )}

                                    <div className="text-center mt-4 mb-6">
                                        <h3 className="text-2xl font-bold text-slate-900">{pack.credits} Crédits</h3>
                                        <p className="text-sm text-slate-500 mt-1">{pack.description}</p>
                                    </div>

                                    <div className="text-center mb-8 pb-6 border-b border-slate-100">
                                        <div className="text-4xl font-bold text-slate-900 mb-1">{pack.price}€</div>
                                        <div className="text-sm text-slate-400">Soit {(pack.price / pack.credits).toFixed(2)}€ / crédit</div>
                                    </div>

                                    <div className="mt-auto">
                                        <Button 
                                            variant={pack.popular ? "primary" : "outline"} 
                                            className="w-full"
                                            onClick={() => handleBuyCredits(pack.id, pack.credits, pack.stripePriceId)}
                                            isLoading={isProcessing === pack.id}
                                            disabled={isProcessing !== null && isProcessing !== pack.id}
                                        >
                                            Acheter le pack
                                        </Button>
                                    </div>
                                </div>
                            ))}
                </div>
                
                {/* Visual Explainer for segmented pricing */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Un coût de déblocage juste, adapté au potentiel du chantier</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                <Home className="text-slate-600" size={24} />
                            </div>
                            <span className="bg-white text-slate-800 font-bold px-3 py-1 rounded-full text-sm shadow-sm mb-3">1 Crédit</span>
                            <h3 className="font-bold text-slate-900 mb-2">Petits travaux / Particuliers</h3>
                            <p className="text-sm text-slate-500">Ex: Nettoyage de vitres, petite zinguerie, purge ponctuelle courte durée.</p>
                        </div>
                        <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-blue-50">
                                <Building className="text-brand-blue" size={24} />
                            </div>
                            <span className="bg-brand-blue text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm mb-3">3 Crédits</span>
                            <h3 className="font-bold text-slate-900 mb-2">Travaux Bâtiment / Copro</h3>
                            <p className="text-sm text-slate-500">Ex: Peinture complète de façade, grand ravalement, filets anti-pigeons.</p>
                        </div>
                        <div className="p-5 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-orange-50">
                                <Factory className="text-orange-600" size={24} />
                            </div>
                            <span className="bg-orange-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm mb-3">5 Crédits</span>
                            <h3 className="font-bold text-slate-900 mb-2">Expertise / Industrie / Gros chantiers</h3>
                            <p className="text-sm text-slate-500">Ex: Pale d'éolienne, pylônes haute tension, chantiers offshore, interventions complexes de grande envergure.</p>
                        </div>
                    </div>
                </div>
                
                {/* FAQ / Trust section */}
                <div className="grid md:grid-cols-2 gap-6 pb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Shield className="text-slate-600" size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">Paiement 100% sécurisé</h4>
                            <p className="text-sm text-slate-600">Vos paiements sont traités de manière sécurisée par Stripe. Nous ne stockons aucune information bancaire.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <HelpCircle className="text-slate-600" size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">Durée de validité</h4>
                            <p className="text-sm text-slate-600">Vos crédits n'ont aucune date d'expiration. Achetez-les maintenant, utilisez-les quand vous en avez besoin.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
