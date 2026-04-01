import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, MapPin, Award, Briefcase, Wrench, Shield,
    Camera, Star, Phone, Mail, CheckCircle, AlertTriangle, Building2, MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useMessaging } from '../hooks/useMessaging';
import type { Profile, Review } from '../types';
import { Helmet } from 'react-helmet-async';

export const PublicProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { startConversation } = useMessaging();

    const { data: pro, isLoading, error } = useQuery({
        queryKey: ['public-profile', id],
        queryFn: async () => {
            if (!id) throw new Error('No id');
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .eq('role', 'pro')
                .single();
            if (error) throw error;
            return data as Profile;
        },
        enabled: !!id,
    });

    const { data: reviews } = useQuery({
        queryKey: ['reviews', id],
        queryFn: async () => {
            if (!id) throw new Error('No id');
            const { data, error } = await (supabase as any)
                .from('reviews')
                .select('*, profiles:client_id (full_name)')
                .eq('pro_id', id)
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) throw error;
            return data as (Review & { profiles: { full_name: string | null } })[];
        },
        enabled: !!id,
    });

    const avgRating = reviews && reviews.length > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : null;

    const { data: unlockedByPro } = useQuery({
        queryKey: ['unlocked-by-pro', id, user?.id],
        queryFn: async () => {
            if (!id || !user || profile?.role !== 'client') return false;
            
            // Check if this pro has unlocked any lead from this client
            const { data, error } = await supabase
                .from('unlocked_leads')
                .select('job_id')
                .eq('pro_id', id);
            
            if (error) throw error;
            if (!data || data.length === 0) return false;

            // Check if any of these jobs belong to the client
            const jobIds = (data as any[]).map(d => d.job_id);
            const { count, error: countError } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .in('id', jobIds)
                .eq('created_by', user.id);
            
            if (countError) throw countError;
            return (count || 0) > 0;
        },
        enabled: !!id && !!user && profile?.role === 'client',
    });

    const [showAllReviews, setShowAllReviews] = React.useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue" />
            </div>
        );
    }

    if (error || !pro) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Profil introuvable</h1>
                    <Button variant="primary" onClick={() => navigate('/')}>Retour à l'accueil</Button>
                </div>
            </div>
        );
    }

    const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={size}
                    className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
                />
            ))}
        </div>
    );

    const displayedReviews = reviews ? (showAllReviews ? reviews : reviews.slice(0, 5)) : [];
    const mainCity = pro.intervention_zones?.[0] || "France";
    const seoTitle = `${pro.full_name || 'Cordiste'} | Expert travaux en hauteur à ${mainCity} | LesCordistes`;
    const seoDesc = `Consultez le profil de ${pro.full_name}, cordiste professionnel à ${mainCity}. ${reviews?.length || 0} avis clients. Spécialités : ${pro.skills?.slice(0, 3).join(', ') || 'Accès difficile'}. Certifié CQP/IRATA.`;

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <link rel="canonical" href={`https://lescordistes.com/pros/${pro.id}`} />
                <meta name="geo.placename" content={mainCity} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": pro.company_name ? "LocalBusiness" : "Person",
                        "name": pro.full_name || "Cordiste",
                        "image": pro.portfolio_photos?.[0] || "https://lescordistes.com/logo.png",
                        "description": pro.bio || `Cordiste professionnel spécialisé en travaux en hauteur à ${mainCity}`,
                        "jobTitle": "Cordiste",
                        "url": `https://lescordistes.com/pros/${pro.id}`,
                        ...(pro.company_name && { "legalName": pro.company_name }),
                        ...(avgRating && {
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": avgRating,
                                "reviewCount": reviews?.length || 1
                            }
                        }),
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": mainCity,
                            "addressCountry": "FR"
                        }
                    })}
                </script>
            </Helmet>
            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-100">
                <div className="container max-w-4xl py-3">
                    <nav className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/" className="hover:text-brand-blue">Accueil</Link>
                        <span>/</span>
                        <span className="text-slate-800 font-medium">Profil Cordiste</span>
                    </nav>
                </div>
            </div>

            <div className="container max-w-4xl py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-blue mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Retour
                </button>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-start gap-5">
                                <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                                    <span className="text-white text-2xl font-bold">
                                        {(pro.full_name || 'C')[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {pro.full_name || 'Cordiste professionnel'}
                                    </h1>
                                    {pro.company_name && (
                                        <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                                            <Building2 size={14} />
                                            {pro.company_name}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        {avgRating !== null && (
                                            <Stars rating={avgRating} />
                                        )}
                                        {pro.role === 'pro' && (
                                            <span className="text-xs px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-full font-medium">
                                                ✓ Professionnel vérifié
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {pro.bio && (
                                <div className="mt-5 pt-5 border-t border-slate-100">
                                    <p className="text-slate-700 leading-relaxed">{pro.bio}</p>
                                </div>
                            )}
                        </div>

                        {/* Certifications */}
                        {pro.certifications && pro.certifications.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Award size={18} className="text-brand-blue" />
                                    Certifications
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {pro.certifications.map((cert, i) => (
                                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-sm rounded-full font-medium">
                                            <CheckCircle size={13} />
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {pro.skills && pro.skills.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Briefcase size={18} className="text-brand-blue" />
                                    Compétences
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {pro.skills.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Equipment */}
                        {pro.equipment && pro.equipment.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Wrench size={18} className="text-brand-blue" />
                                    Matériel & Équipement
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {pro.equipment.map((e, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full">
                                            🔧 {e}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Portfolio */}
                        {pro.portfolio_photos && pro.portfolio_photos.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Camera size={18} className="text-brand-blue" />
                                    Portfolio chantiers
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {pro.portfolio_photos.map((url, i) => (
                                        <img
                                            key={i}
                                            src={url}
                                            alt={`Chantier ${i + 1}`}
                                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(url, '_blank')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Contact CTA */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                            <h3 className="font-bold text-slate-900 mb-3">Contacter ce cordiste</h3>
                            {/* Clients toujours autorisés — pros uniquement si abonnés */}
                            {user && (profile?.role === 'client' || profile?.role === 'pro') ? (
                                <div className="space-y-3">
                                    {pro.phone && (
                                        <a
                                            href={`tel:${pro.phone}`}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 bg-brand-blue text-white rounded-lg font-medium text-sm hover:bg-brand-blue/90 transition-colors"
                                        >
                                            <Phone size={16} />
                                            {pro.phone}
                                        </a>
                                    )}
                                    {pro.email && (
                                        <a
                                            href={`mailto:${pro.email}`}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
                                        >
                                            <Mail size={16} />
                                            Envoyer un email
                                        </a>
                                    )}
                                    {profile?.role === 'client' && unlockedByPro && (
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-2 border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
                                            onClick={async () => {
                                                try {
                                                    const conversationId = await startConversation.mutateAsync({
                                                        proId: pro.id
                                                    });
                                                    navigate(`/messages?id=${conversationId}`);
                                                } catch (err) {
                                                    console.error('Erreur messagerie:', err);
                                                }
                                            }}
                                            isLoading={startConversation.isPending}
                                        >
                                            <MessageCircle size={16} />
                                            Envoyer un message
                                        </Button>
                                    )}
                                    {profile?.role === 'client' && !unlockedByPro && (
                                        <p className="text-[10px] text-slate-400 text-center px-2">
                                            La messagerie est disponible une fois que le professionnel a débloqué votre mission.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    {user ? (
                                        <Button variant="primary" className="w-full" onClick={() => navigate('/credits')}>
                                            Acheter des crédits
                                        </Button>
                                    ) : (
                                        <div className="space-y-2">
                                            <Button variant="primary" className="w-full" onClick={() => navigate('/register')}>
                                                S'inscrire
                                            </Button>
                                            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                                                Se connecter
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Zones */}
                        {pro.intervention_zones && pro.intervention_zones.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                                    <MapPin size={16} className="text-brand-blue" />
                                    Zones d'intervention
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {pro.intervention_zones.map((z, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-brand-blue/10 text-brand-blue rounded font-medium">
                                            {z}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications & Assurances Section */}
                        <div className="space-y-4">
                            {/* Insurance badge */}
                            {pro.insurance_info && (
                                <div className="bg-green-50 rounded-xl border border-green-100 p-4">
                                    <div className="flex items-center gap-2 text-green-700 mb-1">
                                        <Shield size={16} />
                                        <span className="font-semibold text-sm">Assuré RC Pro</span>
                                    </div>
                                    <p className="text-xs text-green-600">{pro.insurance_info}</p>
                                </div>
                            )}

                            {/* Trust badges */}
                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                                <div className="space-y-2 text-xs text-slate-600">
                                    {pro.role === 'pro' && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                                            Profil vérifié LesCordistes
                                        </div>
                                    )}
                                    {pro.certifications && pro.certifications.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                                            {pro.certifications.length} certification(s) confirmée(s)
                                        </div>
                                    )}
                                    {pro.insurance_info && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                                            Couverture assurance déclarée
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Sidebar Version */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Star size={16} className="text-brand-blue fill-brand-blue" />
                                Avis clients ({reviews?.length || 0})
                            </h3>
                            
                            {displayedReviews.length > 0 ? (
                                <div className="space-y-4">
                                    {displayedReviews.map((review) => (
                                        <div key={review.id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {review.profiles?.full_name || 'Client anonyme'}
                                                </span>
                                                <Stars rating={review.rating} size={10} />
                                            </div>
                                            {review.comment && (
                                                <p className="text-slate-500 text-[11px] leading-relaxed italic">
                                                    "{review.comment}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {!showAllReviews && reviews && reviews.length > 5 && (
                                        <button
                                            onClick={() => setShowAllReviews(true)}
                                            className="w-full py-2 text-xs text-brand-blue font-bold hover:bg-brand-blue/5 rounded-lg border border-brand-blue/20 transition-all mt-2"
                                        >
                                            Voir les {reviews.length - 5} autres avis
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-xs text-slate-400 italic">Aucun avis pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
