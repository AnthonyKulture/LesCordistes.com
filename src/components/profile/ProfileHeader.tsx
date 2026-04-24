import React from 'react'
import { User, Briefcase, Eye, Coins, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '../../types'

interface ProfileHeaderProps {
    profile: Profile
    balance: number
    completionPct: number
    completionFields: string[]
    completedCount: number
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    profile,
    balance,
    completionPct,
    completionFields,
    completedCount,
}) => {
    const isPro = profile.role === 'pro'

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 mb-4 sm:mb-6">
            {/* Avatar + identité */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-blue rounded-2xl flex items-center justify-center shadow-md shrink-0">
                    <User className="text-white" size={32} />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">
                        {profile.full_name || 'Mon Profil'}
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5 truncate">{profile.email}</p>
                    <div className="flex items-center flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 capitalize">
                            {profile.role}
                        </span>
                        {isPro && (
                            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                                <Coins size={11} />
                                {balance} crédit{balance > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Liens rapides */}
            <div className="flex items-center flex-wrap gap-x-5 gap-y-2 mt-4 pt-3 border-t border-slate-100">
                <Link
                    href={isPro ? '/dashboard/pro' : '/dashboard/client'}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-brand-blue transition-colors"
                >
                    <Briefcase size={14} />
                    Dashboard
                </Link>
                {isPro && (
                    <Link
                        href={`/pros/${profile.id}`}
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-brand-blue transition-colors"
                    >
                        <Eye size={14} />
                        Voir mon profil public
                    </Link>
                )}
            </div>

            {/* Barre de complétion */}
            {isPro && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>
                            Profil complété à <strong className="text-slate-700">{completionPct}%</strong>
                        </span>
                        {completionPct < 100 && (
                            <span>{completionFields.length - completedCount} champ(s) manquant(s)</span>
                        )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                completionPct < 50
                                    ? 'bg-red-400'
                                    : completionPct < 80
                                      ? 'bg-amber-400'
                                      : 'bg-emerald-500'
                            }`}
                            style={{ width: `${completionPct}%` }}
                        />
                    </div>
                    {completionPct < 70 && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2 inline-flex items-start gap-1.5">
                            <AlertCircle size={13} className="mt-0.5 shrink-0" />
                            <span>
                                Un profil complet reçoit 3× plus de missions. Complétez les onglets ci-dessous.
                            </span>
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
