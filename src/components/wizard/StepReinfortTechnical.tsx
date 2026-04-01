import React from 'react';
/* Lucide components are imported from lucide-react */
import { Award, Check } from 'lucide-react';
import type { JobFormData } from '../../types';

interface Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

export const StepReinfortTechnical: React.FC<Props> = ({ data, updateData, onNext }) => {
    const levels = [
        { id: 'cqp1', label: 'CQP 1 (ouvrier)' },
        { id: 'cqp2', label: 'CQP 2 (chef d\'équipe)' },
        { id: 'irata1', label: 'IRATA Level 1' },
        { id: 'irata2', label: 'IRATA Level 2' },
        { id: 'irata3', label: 'IRATA Level 3' },
    ];

    const habilitations = [
        { id: 'electric', label: '⚡ Électrique (H0V, B1V, etc.)' },
        { id: 'nuclear', label: '☢️ Nucléaire (SCN, CSQ)' },
        { id: 'asbestos', label: '😷 Amiante (Sous-section 4)' },
        { id: 'chemical', label: '🧪 Risques Chimiques (N1, N2)' },
        { id: 'sst', label: '⛑️ SST (Sauveteur Secouriste du Travail)' },
    ];

    const toggleLevel = (level: string) => {
        const current = data.required_level || [];
        const next = current.includes(level)
            ? current.filter(l => l !== level)
            : [...current, level];
        updateData({ required_level: next });
    };

    const toggleHabil = (habil: string) => {
        const current = data.required_habilitations || [];
        const next = current.includes(habil)
            ? current.filter(h => h !== habil)
            : [...current, habil];
        updateData({ required_habilitations: next });
    };

    return (
        <div className="space-y-8">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                        <Award className="text-brand-blue" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Qualifications requises</h2>
                </div>
                <p className="text-slate-600">Filtrez par compétence technique pour garantir la sécurité sur votre chantier.</p>
            </div>

            <div className="space-y-6">
                {/* Levels */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        Niveau Cordiste <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {levels.map((level) => {
                            const isSelected = data.required_level?.includes(level.id);
                            return (
                                <button
                                    key={level.id}
                                    onClick={() => toggleLevel(level.id)}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                        isSelected
                                            ? 'border-brand-blue bg-blue-50/50 shadow-sm'
                                            : 'border-slate-100 hover:border-slate-200 bg-white'
                                    }`}
                                >
                                    <span className={`font-medium ${isSelected ? 'text-brand-blue' : 'text-slate-700'}`}>
                                        {level.label}
                                    </span>
                                    {isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Habilitations */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        Habilitations Spécifiques
                    </h3>
                    <div className="space-y-2">
                        {habilitations.map((habil) => {
                            const isSelected = data.required_habilitations?.includes(habil.id);
                            return (
                                <button
                                    key={habil.id}
                                    onClick={() => toggleHabil(habil.id)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                        isSelected
                                            ? 'border-brand-blue bg-blue-50/50'
                                            : 'border-slate-100 hover:border-slate-200 bg-white'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${
                                        isSelected ? 'bg-brand-blue border-brand-blue' : 'border-slate-200'
                                    }`}>
                                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className={`font-medium ${isSelected ? 'text-brand-blue' : 'text-slate-700'}`}>
                                        {habil.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={onNext}
                    disabled={!data.required_level || data.required_level.length === 0}
                    className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${
                        data.required_level && data.required_level.length > 0
                            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:scale-[1.01] active:scale-[0.99]'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    Continuer
                </button>
                {(!data.required_level || data.required_level.length === 0) && (
                    <p className="text-center text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                        Veuillez sélectionner au moins un niveau
                    </p>
                )}
            </div>
        </div>
    );
};
