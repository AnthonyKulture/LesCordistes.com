import React from 'react';
import { Image, Lock } from 'lucide-react';

interface JobPhotosProps {
    photos: string[];
    isLocked?: boolean;
}

export const JobPhotos: React.FC<JobPhotosProps> = ({ photos, isLocked = false }) => {
    if (!photos || photos.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Image size={18} className="text-brand-blue" />
                    Photos du chantier ({photos.length})
                </h2>
                {isLocked && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                        <Lock size={10} /> Aperçu restreint
                    </span>
                )}
            </div>

            <div className="relative group/gallery">
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 ${isLocked ? 'select-none pointer-events-none' : ''}`}>
                    {photos.map((url, i) => (
                        <div key={i} className="relative aspect-video group overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                            <img
                                src={url}
                                alt={`Photo chantier ${i + 1}`}
                                className={`w-full h-full object-cover transition-all duration-700 ${
                                    isLocked 
                                        ? 'blur-xl scale-110 opacity-40 grayscale brightness-[0.98]' 
                                        : 'cursor-pointer group-hover:scale-105 group-hover:opacity-90'
                                }`}
                                onClick={() => !isLocked && window.open(url, '_blank')}
                            />
                        </div>
                    ))}
                </div>

                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/40 backdrop-blur-[2px] rounded-xl">
                        <div className="w-full max-w-[150px] sm:max-w-[180px]">
                            <div className="bg-white/95 shadow-2xl border border-slate-100 p-3 sm:p-4 rounded-xl text-center">
                                <p className="text-xs font-bold text-slate-900 mb-0.5 leading-tight sm:text-sm">Photos réservées</p>
                                <p className="text-[9px] sm:text-[10px] text-slate-500 leading-normal mb-0 px-1">
                                    Débloquez cette mission pour accéder aux photos.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
