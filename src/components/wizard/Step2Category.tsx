'use client'

import React, { useState } from 'react';
import {
  Eraser,
  Construction,
  BrickWall,
  Paintbrush,
  Factory,
  Tent,
  ClipboardList,
  CheckCircle2,
  Mail,
  ShieldCheck,
  RadioTower,
  Search,
  Wrench,
  TreePine,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import type { JobFormData, JobCategory } from '../../types';

interface Step2Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

export const Step2Category: React.FC<Step2Props> = ({ data, updateData, onNext }) => {
    // Reconstruire la sélection initiale depuis category + secondary_trades
    const initialSelected: JobCategory[] = data.category
        ? [data.category, ...((data.secondary_trades || []) as JobCategory[])]
        : [];

    const [selected, setSelected] = useState<JobCategory[]>(initialSelected);
    const [emailValue, setEmailValue] = useState(data.contact_email || '');

    const categories = [
        { value: 'cleaning' as JobCategory, label: 'Nettoyage', icon: Eraser, color: 'text-blue-500', bg: 'bg-blue-50', description: 'Nettoyage de façades, vitres' },
        { value: 'construction' as JobCategory, label: 'Construction', icon: Construction, color: 'text-orange-500', bg: 'bg-orange-50', description: 'Travaux de construction' },
        { value: 'masonry' as JobCategory, label: 'Maçonnerie', icon: BrickWall, color: 'text-stone-500', bg: 'bg-stone-50', description: 'Réparation, ravalement' },
        { value: 'painting' as JobCategory, label: 'Peinture', icon: Paintbrush, color: 'text-pink-500', bg: 'bg-pink-50', description: 'Peinture en hauteur' },
        { value: 'industry' as JobCategory, label: 'Industrie', icon: Factory, color: 'text-slate-500', bg: 'bg-slate-50', description: 'Maintenance industrielle' },
        { value: 'event' as JobCategory, label: 'Événementiel', icon: Tent, color: 'text-purple-500', bg: 'bg-purple-50', description: 'Installation événementielle' },
        { value: 'securing' as JobCategory, label: 'Sécurisation', icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-50', description: 'Filets, garde-corps, lignes de vie' },
        { value: 'telecom' as JobCategory, label: 'Télécommunications', icon: RadioTower, color: 'text-cyan-500', bg: 'bg-cyan-50', description: 'Antennes, pylônes, fibre' },
        { value: 'inspection' as JobCategory, label: 'Inspection', icon: Search, color: 'text-indigo-500', bg: 'bg-indigo-50', description: 'Visite technique, audit, expertise' },
        { value: 'repair' as JobCategory, label: 'Dépannage', icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50', description: 'Intervention urgente, réparation' },
        { value: 'pruning' as JobCategory, label: 'Élagage & Végétaux', icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Élagage, abattage, démoussage' },
        { value: 'other' as JobCategory, label: 'Autre', icon: ClipboardList, color: 'text-gray-500', bg: 'bg-gray-50', description: 'Autre type de mission' },
    ];

    const handleToggle = (value: JobCategory) => {
        const next = selected.includes(value)
            ? selected.filter(v => v !== value)
            : [...selected, value];

        setSelected(next);

        // Toujours stocker le 1er sélectionné comme category principale (compatibilité DB)
        // Les suivants vont dans secondary_trades (champ DB existant)
        updateData({
            category: next[0],
            secondary_trades: next.length > 1 ? next.slice(1) : [],
        });
    };

    const handleNext = () => {
        if (selected.length === 0) return;
        updateData({ contact_email: emailValue });
        if (emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue, category: selected[0], step_reached: 1, source: 'wizard_step1' }),
            }).catch(() => {});
        }
        onNext();
    };

    return (
        <div className="space-y-4">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-900">Quel(s) type(s) de travaux ?</h2>
                </div>
                <p className="text-sm text-slate-500">
                    Sélectionnez un ou plusieurs types de travaux correspondant à votre mission.
                </p>
            </div>

            {selected.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-blue/5 border border-brand-blue/20 rounded-xl text-xs font-bold text-brand-blue"
                >
                    <CheckCircle2 size={14} />
                    {selected.length} types sélectionnés
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat, index) => {
                    const Icon = cat.icon;
                    const isSelected = selected.includes(cat.value);
                    const order = selected.indexOf(cat.value);

                    return (
                        <motion.button
                            key={cat.value}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleToggle(cat.value)}
                            className={`relative group p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3 ${
                                isSelected
                                    ? 'border-brand-blue bg-blue-50/50 shadow-md ring-1 ring-brand-blue/10'
                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-sm'
                            }`}
                        >
                            <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                                isSelected ? 'bg-brand-blue text-white' : `${cat.bg} ${cat.color}`
                            }`}>
                                <Icon size={20} />
                            </div>

                            <div className="flex-grow min-w-0 pr-6">
                                <h3 className={`font-bold text-sm mb-0.5 truncate ${isSelected ? 'text-brand-blue' : 'text-slate-900'}`}>
                                    {cat.label}
                                </h3>
                                <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                                    {cat.description}
                                </p>
                            </div>

                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] font-black"
                                >
                                    {order + 1}
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {selected.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden"
                >
                    <div className="flex flex-col gap-1.5 p-4 bg-brand-blue/5 border border-brand-blue/15 rounded-2xl">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Mail size={15} className="text-brand-blue" />
                            Votre email pour recevoir les devis
                        </label>
                        <input
                            type="email"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            placeholder="votre@email.fr"
                            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        />
                        <p className="text-xs text-slate-400">Facultatif — vous pourrez le renseigner à l'étape suivante.</p>
                    </div>
                </motion.div>
            )}

            <div className="pt-2">
                <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={selected.length === 0}
                    className={`w-full h-12 text-base font-bold transition-all ${
                        selected.length > 0 ? 'shadow-lg shadow-brand-blue/20' : 'opacity-50'
                    }`}
                >
                    Continuer
                    {selected.length > 0 && (
                        <span className="ml-2 text-xs opacity-70">
                            ({selected.length} sélectionné{selected.length > 1 ? 's' : ''})
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
};
