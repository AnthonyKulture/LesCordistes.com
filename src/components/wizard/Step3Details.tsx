'use client'

import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, AlertCircle, Mic, MicOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobFormData } from '../../types';

interface Step3Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

export const Step3Details: React.FC<Step3Props> = ({ data, updateData, onNext }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const hasSpeechRecognition = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const toggleDictation = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SR();
        recognition.lang = 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (e: any) => {
            const transcript = Array.from(e.results)
                .map((r: any) => r[0].transcript)
                .join(' ');
            updateData({ description: ((data.description || '') + ' ' + transcript).trimStart() });
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    useEffect(() => () => recognitionRef.current?.stop(), []);


    const today = new Date().toISOString().split('T')[0];

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!data.description?.trim()) {
            newErrors.description = 'La description est requise';
        } else if (data.description.trim().length < 20) {
            newErrors.description = 'La description doit contenir au moins 20 caractères';
        }

        if (data.budget_min && data.budget_max && data.budget_min > data.budget_max) {
            newErrors.budget = 'Le budget minimum ne peut pas dépasser le budget maximum';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="space-y-8">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">Détails de la mission</h2>
                </div>
                <p className="text-slate-600">Plus votre description est précise, plus vous recevrez des offres pertinentes.</p>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <motion.div variants={itemVariants} className="space-y-3">
                    <TextArea
                        label="Décrivez votre besoin *"
                        placeholder="Ex : Nettoyage de façade sur un immeuble de 5 étages, accès par l'arrière, date souhaitée avant fin juin..."
                        value={data.description || ''}
                        onChange={(e) => updateData({ description: e.target.value })}
                        error={errors.description}
                        rows={5}
                        className="text-base"
                    />
                    {hasSpeechRecognition && (
                        <button
                            type="button"
                            onClick={toggleDictation}
                            className={`sm:hidden w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                                isListening
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse'
                                    : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 animate-color-pulse'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isListening ? 'bg-white/20' : 'bg-white/20'
                            }`}>
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </div>
                            {isListening ? '⏹ Arrêter la dictée' : '🎙 Dicter ma description'}
                        </button>
                    )}
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Input
                        label="Hauteur approximative (mètres)"
                        type="number"
                        placeholder="Ex: 15"
                        value={data.height_meters || ''}
                        onChange={(e) => updateData({ height_meters: parseInt(e.target.value) || undefined })}
                        className="h-12"
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-brand-blue">
                        <TrendingUp size={18} />
                        <h3 className="font-bold">Budget & Délai</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Budget estimé (€)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={data.budget_min || ''}
                                    onChange={(e) => updateData({ budget_min: parseInt(e.target.value) || undefined })}
                                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none"
                                />
                                <span className="text-slate-400">—</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={data.budget_max || ''}
                                    onChange={(e) => updateData({ budget_max: parseInt(e.target.value) || undefined })}
                                    className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Date limite souhaitée
                            </label>
                            <input
                                type="date"
                                min={today}
                                value={data.deadline || ''}
                                onChange={(e) => updateData({ deadline: e.target.value || undefined })}
                                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none"
                            />
                        </div>
                    </div>
                    
                    <AnimatePresence>
                        {errors.budget && (
                            <motion.p 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="text-red-500 text-xs flex items-center gap-1"
                            >
                                <AlertCircle size={12} /> {errors.budget}
                            </motion.p>
                        )}
                    </AnimatePresence>
                    
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        CONSEIL : Préciser le budget attire 40% de pros en plus.
                    </p>
                </motion.div>
            </motion.div>

            <div className="pt-4">
                <Button 
                    variant="primary" 
                    onClick={handleNext} 
                    className="w-full h-14 text-lg font-bold shadow-lg shadow-brand-blue/20"
                >
                    Continuer
                </Button>
            </div>
        </div>
    );
};
