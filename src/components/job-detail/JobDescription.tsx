import React from 'react';
import { Tag } from 'lucide-react';

interface JobDescriptionProps {
    description: string;
}

export const JobDescription: React.FC<JobDescriptionProps> = ({ description }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Tag size={18} className="text-brand-blue" />
                Description de la mission
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">{description}</p>
        </div>
    );
};
