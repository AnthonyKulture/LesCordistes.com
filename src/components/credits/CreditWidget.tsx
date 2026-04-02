import React, { useState } from 'react';
import { Coins, TrendingUp, TrendingDown, Clock, X, Zap, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCredits } from '../../hooks/useCredits';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CREDIT_PACKS } from '../../constants/creditPacks';
import type { CreditTransaction } from '../../types';

interface CreditPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [purchasing, setPurchasing] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePurchase = async (packId: string, credits: number, stripePriceId: string) => {
        if (!user) return;
        setPurchasing(packId);
        try {
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packId,
                    amount: credits,
                    userId: user.id,
                    stripePriceId
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.assign(data.url);
            } else {
                throw new Error(data.message || 'Erreur Stripe');
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'initialisation du paiement.");
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Coins className="text-brand-blue" size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Acheter des crédits</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Chaque crédit = 1 lead débloqué (coordonnées client complètes)
                    </p>
                </div>

                <div className="space-y-3">
                    {CREDIT_PACKS.map(pack => (
                        <div
                            key={pack.credits}
                            className={`relative border-2 rounded-xl p-4 flex items-center justify-between ${
                                pack.popular
                                    ? 'border-brand-blue bg-brand-blue/5'
                                    : 'border-slate-200'
                            }`}
                        >
                            {pack.popular && (
                                <span className="absolute -top-2.5 left-4 text-xs font-bold px-2.5 py-0.5 bg-brand-blue text-white rounded-full">
                                    ⚡ Populaire
                                </span>
                            )}
                            <div>
                                <div className="font-bold text-slate-900">
                                    {pack.credits} crédits
                                    <span className="ml-2 text-sm font-normal text-slate-500">– {pack.label}</span>
                                </div>
                                <div className="text-xs text-slate-400">{pack.pricePerLead} par lead</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-slate-900">{pack.price}€</span>
                                <Button
                                    variant={pack.popular ? 'primary' : 'outline'}
                                    onClick={() => handlePurchase(pack.id, pack.credits, pack.stripePriceId)}
                                    isLoading={purchasing === pack.id}
                                >
                                    Acheter
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-slate-400 text-center mt-4">
                    💳 Paiement sécurisé — Les crédits n'expirent jamais
                </p>
            </div>
        </div>
    );
};


interface CreditWidgetProps {
    compact?: boolean;
}

export const CreditWidget: React.FC<CreditWidgetProps> = ({ compact = false }) => {
    const { balance, transactions, isLoading } = useCredits();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    if (isLoading) return null;

    if (compact) {
        return (
            <>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 rounded-full hover:bg-brand-blue/20 transition-colors"
                >
                    <Coins size={15} className="text-brand-blue" />
                    <span className="text-sm font-bold text-brand-blue">{balance}</span>
                    <span className="text-xs text-slate-500">crédits</span>
                </button>
                <CreditPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
            </>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                            <Coins size={20} className="text-brand-blue" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Solde de crédits</p>
                            <p className="text-2xl font-bold text-slate-900">{balance}</p>
                        </div>
                    </div>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <Zap size={16} /> Acheter
                    </Button>
                </div>

                {balance === 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4 text-sm text-amber-700">
                        ⚠️ Vous n'avez plus de crédits. Achetez-en pour débloquer les coordonnées des clients.
                    </div>
                )}

                {transactions.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                            <Clock size={14} />
                            Historique
                        </h3>
                        <div className="space-y-1.5">
                            {transactions.slice(0, 5).map((tx: CreditTransaction) => (
                                <div key={tx.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        {tx.type === 'purchase' ? (
                                            <TrendingUp size={14} className="text-green-500" />
                                        ) : (
                                            <TrendingDown size={14} className="text-red-400" />
                                        )}
                                        <span className="text-slate-600 truncate max-w-[180px]">
                                            {tx.description || tx.type}
                                        </span>
                                    </div>
                                    <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {transactions.length > 5 && (
                            <button
                                onClick={() => navigate('/credits')}
                                className="mt-2 text-xs text-brand-blue hover:underline flex items-center gap-1"
                            >
                                Voir tout l'historique <ExternalLink size={11} />
                            </button>
                        )}
                    </div>
                )}
            </div>
            <CreditPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
};
