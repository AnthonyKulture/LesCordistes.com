import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, HelpCircle, AlertTriangle, Building, Home, Factory } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../hooks/useCredits';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { CREDIT_PACKS } from '../constants/creditPacks';

export const Credits: React.FC = () => {
    const { user } = useAuth();
    const { balance, addCredits } = useCredits();
    const navigate = useNavigate();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleBuyCredits = async (packId: string, amount: number) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsProcessing(packId);
        
        // Mode démo / Simulation de paiement
        try {
            await new Promise(r => setTimeout(r, 800));
            await addCredits.mutateAsync({
                amount: amount,
                description: `Achat pack ${packId} – ${amount} crédits (Mode Démo)`,
            });
            toast.success(`Simulation : Vous avez ajouté ${amount} crédits à votre compte ! (Mode Démo)`);
            setIsProcessing(null);
            queryClient.invalidateQueries({ queryKey: ['credits'] });
            queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la simulation d\'achat');
            setIsProcessing(null);
        }
    };

    const packs = CREDIT_PACKS;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <Helmet>
                <title>Acheter des crédits | LesCordistes.com</title>
                <meta name="description" content="Achetez des packs de crédits pour débloquer les coordonnées des clients et postuler aux missions de travaux en hauteur sur LesCordistes.com." />
                <link rel="canonical" href="https://lescordistes.com/credits" />
            </Helmet>
            <div className="container max-w-5xl">
                
                {/* P-M06: Bandeau mode démo visible */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Acheter des crédits</h1>
                    <p className="text-slate-600 max-w-xl mx-auto">
                        Utilisez vos crédits pour débloquer les coordonnées des clients.
                        <strong> 1 crédit = 1 contact client débloqué.</strong>
                    </p>
                    <p className="mt-2 font-bold text-slate-900">Solde actuel : {balance} crédit{balance !== 1 ? 's' : ''}</p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2 rounded-full">
                        <AlertTriangle size={15} />
                        Mode démo — Le paiement Stripe n'est pas encore activé
                    </div>
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
                                            onClick={() => handleBuyCredits(pack.id, pack.credits)}
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
