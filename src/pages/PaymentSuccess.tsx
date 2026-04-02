import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';

export const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // Redirection automatique après 5 secondes vers le tableau de bord
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <Helmet>
                <title>Paiement Réussi - LesCordistes</title>
                <meta name="description" content="Confirmation de votre achat de crédits sur LesCordistes. Vos crédits sont maintenant disponibles." />
                <meta name="robots" content="noindex, follow" />
            </Helmet>

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="text-green-600" size={40} />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Paiement Réussi !</h1>
            
            <p className="text-slate-600 max-w-md mx-auto mb-8">
                Merci pour votre achat. Vos crédits ont été ajoutés à votre compte et sont prêts à être utilisés.
                {sessionId && <span className="block text-xs text-slate-400 mt-2">Réf. transaction : {sessionId.substring(0, 15)}...</span>}
            </p>

            <div className="flex gap-4">
                <Button onClick={() => navigate('/dashboard')} variant="primary">
                    Aller au Tableau de bord
                </Button>
                <Button onClick={() => navigate('/jobs')} variant="outline">
                    Voir les missions
                </Button>
            </div>
            
            <p className="text-sm text-slate-500 mt-8">Redirection automatique dans quelques secondes...</p>
        </div>
    );
};
