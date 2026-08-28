'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

export interface JobUnlockerPro {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
}

interface JobUnlockersProps {
    pros: JobUnlockerPro[];
    isLoading?: boolean;
}

export const JobUnlockers: React.FC<JobUnlockersProps> = ({ pros, isLoading = false }) => {
    const router = useRouter();

    if (isLoading) return <div className="mt-4 h-8 w-24 animate-pulse bg-slate-50 rounded-full" />;
    
    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Pros ayant débloqué votre contact {pros && pros.length > 0 ? `(${pros.length})` : ''}
            </p>
            {pros && pros.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {pros.map(pro => (
                        <button
                            key={pro.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/pros/${pro.id}`);
                            }}
                            className="flex items-center gap-2 p-1 pr-3 bg-white border border-slate-100 rounded-full hover:border-brand-blue hover:shadow-sm transition-all group"
                            title="Voir le profil"
                        >
                            {pro.avatar_url ? (
                                <img src={pro.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                    {pro.full_name?.charAt(0) || 'P'}
                                </div>
                            )}
                            <span className="text-[11px] font-semibold text-slate-700 group-hover:text-brand-blue truncate max-w-[150px]">
                                {pro.full_name || pro.email}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic">Aucun professionnel n'a encore débloqué votre contact.</p>
            )}
        </div>
    );
};
