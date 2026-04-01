import React from 'react';
import { Hammer, Briefcase } from 'lucide-react';
import { TextArea } from '../ui/TextArea';
import type { JobFormData } from '../../types';

interface Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

export const StepReinfortTrades: React.FC<Props> = ({ data, updateData, onNext }) => {
    const trades = [
        { id: 'masonry', label: 'Maçonnerie' },
        { id: 'painting', label: 'Peinture' },
        { id: 'cleaning', label: 'Nettoyage haute pression' },
        { id: 'welding', label: 'Soudure' },
        { id: 'nets', label: 'Pose de filets' },
        { id: 'lifelines', label: 'Pose de lignes de vie' },
    ];

    const toggleTrade = (tradeId: string) => {
        const current = data.secondary_trades || [];
        const next = current.includes(tradeId)
            ? current.filter(t => t !== tradeId)
            : [...current, tradeId];
        updateData({ secondary_trades: next });
    };

    const equipmentOptions = [
        { id: 'pro_brings_all', label: 'Le renfort vient avec son kit complet (cordes + EPI).' },
        { id: 'agency_provides_all', label: 'L\'agence fournit tout le matériel technique.' },
        { id: 'agency_provides_ropes_pro_brings_personal', label: 'L\'agence fournit les cordes, le renfort apporte ses EPI personnels.' },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                        <Hammer className="text-brand-blue" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Nature des travaux</h2>
                </div>
                <p className="text-slate-600">Précisez le corps de métier et la gestion du matériel technique.</p>
            </div>

            <div className="space-y-8">
                {/* Secondary Trades */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                        Corps de métier secondaire
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {trades.map((trade) => {
                            const isSelected = data.secondary_trades?.includes(trade.id);
                            return (
                                <button
                                    key={trade.id}
                                    onClick={() => toggleTrade(trade.id)}
                                    className={`px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                                        isSelected
                                            ? 'border-brand-blue bg-brand-blue text-white shadow-md'
                                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                                    }`}
                                >
                                    {trade.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Equipment Management */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Briefcase size={16} className="text-slate-400" />
                        Gestion du matériel (EPI) <span className="text-red-500">*</span>
                    </h3>
                    <div className="space-y-3">
                        {equipmentOptions.map((opt) => {
                            const isSelected = data.equipment_management === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => updateData({ equipment_management: opt.id as any })}
                                    className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                                        isSelected
                                            ? 'border-brand-blue bg-blue-50/50 shadow-sm'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                                >
                                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isSelected ? 'border-brand-blue' : 'border-slate-300'
                                    }`}>
                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-blue" />}
                                    </div>
                                    <span className={`text-sm font-semibold leading-relaxed ${isSelected ? 'text-brand-blue' : 'text-slate-600'}`}>
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Specific Equipment */}
                <div className="space-y-3">
                    <TextArea
                        label="Matériel spécifique à prévoir"
                        placeholder="Ex: perforateur, meuleuse, nacelle, carotteuse..."
                        value={data.specific_equipment || ''}
                        onChange={(e) => updateData({ specific_equipment: e.target.value })}
                        rows={3}
                        className="text-base"
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={onNext}
                    disabled={!data.equipment_management}
                    className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${
                        data.equipment_management
                            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:scale-[1.01] active:scale-[0.99]'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    Continuer
                </button>
            </div>
        </div>
    );
};
