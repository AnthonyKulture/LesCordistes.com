import React from 'react';
import { User, Briefcase, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import type { Profile } from '../../types';

interface ProfileHeaderProps {
    profile: Profile;
    balance: number;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    completionPct: number;
    completionFields: string[];
    completedCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    profile, balance, isEditing, setIsEditing, completionPct, completionFields, completedCount 
}) => {
    const isPro = profile.role === 'pro';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
            {/* Avatar + info + bouton Modifier */}
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center shadow-md shrink-0">
                    <User className="text-white" size={26} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">
                                {profile.full_name || 'Mon Profil'}
                            </h1>
                            <p className="text-slate-400 text-xs mt-0.5 truncate">{profile.email}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                                {isPro && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-brand-blue/10 text-brand-blue">
                                        {balance} crédit{balance > 1 ? 's' : ''}
                                    </span>
                                )}
                                <span className="text-xs text-slate-400 capitalize">{profile.role}</span>
                            </div>
                        </div>
                        {!isEditing && (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="shrink-0">
                                Modifier
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Liens secondaires */}
            <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100">
                <Link
                    href={profile.role === 'pro' ? '/dashboard/pro' : '/dashboard/client'}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-blue transition-colors"
                >
                    <Briefcase size={13} />
                    Dashboard
                </Link>
                {isPro && (
                    <Link
                        href={`/pros/${profile.id}`}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-blue transition-colors"
                    >
                        <Eye size={13} />
                        Profil public
                    </Link>
                )}
            </div>

            {/* Completion bar */}
            {isPro && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>Profil complété à <strong>{completionPct}%</strong></span>
                        {completionPct < 100 && <span>{completionFields.length - completedCount} champ(s) manquant(s)</span>}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className="bg-brand-blue h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${completionPct}%` }}
                        />
                    </div>
                    {completionPct < 70 && (
                        <p className="text-xs text-amber-600 mt-2">
                            Un profil complet reçoit 3x plus de missions. Complétez votre profil !
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
