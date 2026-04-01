import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShieldCheck, Check } from 'lucide-react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import type { JobFormData } from '../../types';

interface Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

export const StepReinfortConditions: React.FC<Props> = ({ data, updateData, onNext }) => {
    const today = new Date().toISOString().split('T')[0];

    const contractOptions = [
        { value: 'subcontracting', label: 'Sous-traitance (société à société)' },
        { value: 'freelance', label: 'Vacation Freelance (auto-entrepreneur)' },
    ];

    const isValid = data.start_date && data.duration_days && data.contract_type && data.title && data.description;

    return (
        <div className="space-y-8">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                        <Calendar className="text-brand-blue" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Conditions de la mission</h2>
                </div>
                <p className="text-slate-600">Définissez le cadre juridique et financier de l'intervention.</p>
            </div>

            <div className="space-y-6">
                {/* Title & Description (Added here for PRO flow to keep steps count low) */}
                <div className="space-y-4">
                    <Input
                        label="Titre de la mission *"
                        placeholder="Ex: Renfort cordiste CQP2 pour ravalement"
                        value={data.title || ''}
                        onChange={(e) => updateData({ title: e.target.value })}
                        className="h-12"
                    />
                    <TextArea
                        label="Description complémentaire *"
                        placeholder="Décrivez précisément les tâches à accomplir..."
                        value={data.description || ''}
                        onChange={(e) => updateData({ description: e.target.value })}
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                            Date de début *
                        </label>
                        <input
                            type="date"
                            min={today}
                            value={data.start_date || ''}
                            onChange={(e) => updateData({ start_date: e.target.value })}
                            className="w-full h-12 px-3 border-2 border-slate-100 rounded-xl focus:border-brand-blue outline-none transition-all font-medium"
                        />
                    </div>
                    <Input
                        label="Durée estimée (jours) *"
                        type="number"
                        placeholder="Ex: 5"
                        value={data.duration_days || ''}
                        onChange={(e) => updateData({ duration_days: parseInt(e.target.value) || undefined })}
                        className="h-12"
                    />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <input
                        type="checkbox"
                        id="night_work"
                        checked={data.work_night_weekend || false}
                        onChange={(e) => updateData({ work_night_weekend: e.target.checked })}
                        className="w-5 h-5 accent-brand-blue rounded"
                    />
                    <label htmlFor="night_work" className="text-sm font-semibold text-slate-700 cursor-pointer">
                        Travail de nuit ou week-end requis ?
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label="Type de contrat *"
                        value={data.contract_type || ''}
                        onChange={(e) => updateData({ contract_type: e.target.value as any })}
                        options={[{ value: '', label: 'Choisir le contrat' }, ...contractOptions]}
                        className="h-12"
                    />
                    <div className="relative">
                        <Input
                            label="Tarif journalier indicatif (HT)"
                            type="number"
                            placeholder="Ex: 450"
                            value={data.daily_rate || ''}
                            onChange={(e) => updateData({ daily_rate: parseInt(e.target.value) || undefined })}
                            className="h-12 pr-10"
                        />
                        <span className="absolute right-4 top-[42px] font-bold text-slate-400">€</span>
                    </div>
                </div>

                <div className="p-5 bg-blue-50/50 rounded-2xl border-2 border-blue-100/50 space-y-4">
                    <div className="flex items-center gap-2 text-brand-blue">
                        <ShieldCheck size={20} />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Check-up Sécurité</h3>
                    </div>
                    <div className="flex items-start gap-3 group cursor-pointer" onClick={() => updateData({ security_plan_confirmed: !data.security_plan_confirmed })}>
                        <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            data.security_plan_confirmed ? 'bg-brand-blue border-brand-blue text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'
                        }`}>
                            {data.security_plan_confirmed && <Check size={14} strokeWidth={3} />}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Je confirme que le Plan de Prévention (PDP) ou le PPSPS est disponible ou en cours de rédaction.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-4 space-y-4">
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    En continuant, vous acceptez les <Link to="/cgu" className="underline hover:text-brand-blue transition-colors">CGU</Link> et les <Link to="/cgv" className="underline hover:text-brand-blue transition-colors">CGV</Link> de LesCordistes.com.
                </p>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${
                        isValid
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
