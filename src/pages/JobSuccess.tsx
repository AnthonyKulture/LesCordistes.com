import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const JobSuccess: React.FC = () => {
    const location = useLocation();
    const isNewUser = location.state?.isNewUser || new URLSearchParams(location.search).get('new') === '1';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
            <div className="container max-w-2xl">
                <div className="bg-white rounded-xl shadow-md p-8 text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-4">
                        Projet publié avec succès !
                    </h1>

                    <p className="text-lg text-slate-600 mb-6">
                        Votre projet a bien été reçu et est en cours de validation par notre équipe.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                             Prochaines étapes :
                        </h3>
                        <ul className="space-y-4 text-slate-700">
                            {isNewUser && (
                                <li className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                                    <span><strong>Vérifiez vos emails :</strong> Un lien de confirmation vous a été envoyé pour valider votre compte.</span>
                                </li>
                            )}
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                    {isNewUser ? '2' : '1'}
                                </div>
                                <span>Notre équipe va vérifier votre projet (sous 24h).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                    {isNewUser ? '3' : '2'}
                                </div>
                                <span>Vous recevrez un email dès que votre mission est en ligne.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dashboard/client">
                            <Button variant="outline" className="w-full sm:w-auto px-8">
                                Mon tableau de bord
                            </Button>
                        </Link>
                        <Link to="/">
                            <Button variant="primary" className="w-full sm:w-auto px-8">
                                Retour à l'accueil
                                <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
