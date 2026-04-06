import React from 'react';
import { MapPin, Award, Clock } from 'lucide-react';

interface Props {
    cityName: string;
}

export const SEOLocalStats: React.FC<Props> = ({ cityName }) => {
    return (
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Award className="text-brand-blue" size={24} />
                </div>
                <div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">CQP / IRATA</div>
                    <div className="text-sm font-medium text-slate-600">Certifications obligatoires</div>
                </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-brand-blue/20 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <MapPin className="text-brand-blue" size={24} />
                </div>
                <div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">&lt; 30 km</div>
                    <div className="text-sm font-medium text-slate-600">Rayon d'intervention ({cityName})</div>
                </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-brand-blue/20 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Clock className="text-brand-blue" size={24} />
                </div>
                <div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">48h</div>
                    <div className="text-sm font-medium text-slate-600">Délai de réponse garanti</div>
                </div>
            </div>
        </div>
    );
};
