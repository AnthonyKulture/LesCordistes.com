import React from 'react';
import { Image } from 'lucide-react';

interface JobPhotosProps {
    photos: string[];
}

export const JobPhotos: React.FC<JobPhotosProps> = ({ photos }) => {
    if (!photos || photos.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Image size={18} className="text-brand-blue" />
                    Photos du chantier ({photos.length})
                </h2>
            </div>

            <div className="relative group/gallery">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {photos.map((url, i) => (
                        <div key={i} className="relative aspect-video group overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                            <img
                                src={url}
                                alt={`Photo chantier ${i + 1}`}
                                className="w-full h-full object-cover transition-all duration-700 cursor-pointer group-hover:scale-105 group-hover:opacity-90"
                                onClick={() => window.open(url, '_blank')}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
