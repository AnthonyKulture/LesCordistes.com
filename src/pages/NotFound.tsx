import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
            <Helmet>
                <title>Page introuvable | LesCordistes.com</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <div className="container max-w-lg text-center">
                <div className="text-8xl font-extrabold text-slate-200 mb-4">404</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Page introuvable</h1>
                <p className="text-lg text-slate-600 mb-8">
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                        <Button variant="primary" className="w-full sm:w-auto px-8 flex items-center gap-2">
                            <Home size={18} />
                            Retour à l'accueil
                        </Button>
                    </Link>
                    <Link to="/jobs">
                        <Button variant="outline" className="w-full sm:w-auto px-8 flex items-center gap-2">
                            <Search size={18} />
                            Voir les missions
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
