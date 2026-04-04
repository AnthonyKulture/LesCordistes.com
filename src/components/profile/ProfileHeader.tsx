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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center shadow-md">
                        <User className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {profile.full_name || 'Mon Profil'}
                        </h1>
                        <p className="text-slate-500 text-sm">{profile.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {isPro && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-brand-blue/10 text-brand-blue">
                                    {balance} crédit{balance > 1 ? 's' : ''}
                                </span>
                            )}
                            <span className="text-xs text-slate-400 capitalize">{profile.role}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={rofile?.role === 'pro' ? '/dashboard/pro' : '/dashboard/client'}
                        className="flex items-center gap-1.5 text-sm text-brand-blue hover:underline"
                    >
                        <Briefcase size={16} />
                        Aller au Dashboard
                    </Link>
                    {isPro && (
                        <Link
                            href={`/pros/${profile.id}`}
                            className="flex items-center gap-1.5 text-sm text-brand-blue hover:underline"
                        >
                            <Eye size={16} />
                            Voir profil public
                        </Link>
                    )}
                    {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            Modifier
                        </Button>
                    )}
                </div>
            </div>

            {/* Completion bar */}
            {isPro && (
                <div className="mt-5">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>Profil complété à <strong>{completionPct}%</strong></span>
                        {completionPct < 100 && <span>{completionFields.length - completedCount} champ(s) manquant(s)</span>}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="bg-brand-blue h-2 rounded-full transition-all duration-500"
                            style={{ width: `${completionPct}%` }}
                        />
                    </div>
                    {completionPct < 70 && (
                        <p className="text-xs text-amber-600 mt-1.5">
                            ⚠️ Un profil complet reçoit 3x plus de missions. Complétez votre profil !
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
