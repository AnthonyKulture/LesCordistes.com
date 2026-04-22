'use client'

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader, CheckCircle2, Search, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobFormData } from '../../types';

interface Step1Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

interface AddressSuggestion {
    label: string;
    city: string;
    postcode: string;
    context: string;
    coordinates: [number, number]; // [lng, lat]
}

export const Step1Location: React.FC<Step1Props> = ({ data, updateData, onNext }) => {
    const [inputValue, setInputValue] = useState(data.location_address || '');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search using the French government address API (no API key needed)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (inputValue.length < 3 || !showSuggestions) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(inputValue)}&limit=5`
                );
                const results = await response.json();

                const formatted: AddressSuggestion[] = (results.features || []).map((f: any) => {
                    const props = f.properties;
                    return {
                        label: props.label,
                        city: props.city || '',
                        postcode: props.postcode || '',
                        context: props.context || '',
                        coordinates: f.geometry.coordinates,
                    };
                });

                setSuggestions(formatted);
            } catch (error) {
                console.error('Error fetching addresses:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue, showSuggestions]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
        const postcode = suggestion.postcode || '';
        const coords = suggestion.coordinates;

        // context format from api-adresse.data.gouv.fr: "69, Métropole de Lyon, Auvergne-Rhône-Alpes"
        // First segment is always the department number (handles 2A, 2B, 971-976 correctly)
        let deptCode = suggestion.context.split(', ')[0] || '';
        if (!deptCode && postcode) {
            deptCode = postcode.startsWith('97') || postcode.startsWith('98')
                ? postcode.substring(0, 3)
                : postcode.substring(0, 2);
        }

        updateData({
            location_address: suggestion.label,
            location_city: suggestion.city,
            location_department: deptCode,
            latitude: coords[1],
            longitude: coords[0],
        });
        
        setInputValue(suggestion.label);
        setSuggestions([]);
        setShowSuggestions(false);
        setErrors({});
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!data.location_address?.trim()) {
            newErrors.location_address = 'L\'adresse exacte est obligatoire';
        }
        if (!data.latitude || !data.longitude) {
            newErrors.location_address = 'Veuillez sélectionner une adresse dans la liste';
        }
        if (data.type === 'renfort_pro' && !data.structure_type) {
            newErrors.structure_type = 'Le type de structure est requis';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext();
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">Où se situe votre mission ?</h2>
                </div>
                <p className="text-slate-600">Saisissez votre adresse pour une localisation précise sur la carte.</p>
            </div>

            {data.type === 'renfort_pro' && (
                <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Référence interne (Opt.)
                    </label>
                    <Input
                        placeholder="Ex: Chantier Façade Sud"
                        value={data.internal_reference || ''}
                        onChange={(e) => updateData({ internal_reference: e.target.value })}
                        className="h-12"
                    />
                </div>
            )}

            {data.type === 'renfort_pro' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                >
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Type de structure *
                    </label>
                    <select
                        value={data.structure_type || ''}
                        onChange={(e) => updateData({ structure_type: e.target.value as any })}
                        className={`w-full h-12 px-3 border-2 rounded-xl focus:border-brand-blue outline-none transition-all font-medium bg-white ${
                            errors.structure_type ? 'border-red-500' : 'border-slate-100'
                        }`}
                    >
                        <option value="">Choisir la structure</option>
                        <option value="habitat_residentiel">Habitat & Résidentiel</option>
                        <option value="tertiaire_bureaux">Tertiaire & Bureaux</option>
                        <option value="industrie_energie">Industrie & Énergie</option>
                        <option value="genie_civil_ouvrages">Génie Civil & Ouvrages</option>
                        <option value="milieu_naturel_parois">Milieu Naturel & Parois</option>
                        <option value="evenementiel_spectacle">Événementiel & Spectacle</option>
                    </select>
                </motion.div>
            )}

            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <Input
                        label="Adresse ou Code Postal *"
                        type="text"
                        placeholder="Ex: 12 avenue de la République, 75011 Paris"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                            // Clear coordinates if user starts typing again
                            if (data.latitude) updateData({ latitude: undefined, longitude: undefined });
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        error={errors.location_address}
                        className="h-14 text-lg pl-12"
                        autoComplete="off"
                    />
                    <div className="absolute left-4 top-[42px] text-slate-400">
                        {isLoading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
                    </div>
                    {inputValue && (
                        <button
                            onClick={() => {
                                setInputValue('');
                                setSuggestions([]);
                                updateData({ location_address: '', latitude: undefined, longitude: undefined });
                            }}
                            className="absolute right-4 top-[42px] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
                        >
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                    className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                >
                                    <p className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                                        {suggestion.label}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {suggestion.context}
                                    </p>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status indicator */}
                <div className="mt-4 h-8">
                    <AnimatePresence mode="wait">
                        {data.latitude && data.longitude ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-green-700 text-sm font-bold border border-green-100"
                            >
                                <CheckCircle2 size={18} />
                                Localisation validée : {data.location_city} ({data.location_department})
                            </motion.div>
                        ) : inputValue.length > 3 && !isLoading && suggestions.length === 0 && showSuggestions ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-amber-600 font-medium px-2"
                            >
                                Aucune adresse trouvée. Essayez d'être plus précis.
                            </motion.p>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            <div className="pt-6">
                <Button 
                    variant="primary" 
                    onClick={handleNext} 
                    className={`w-full h-14 text-lg font-bold transition-all shadow-lg ${
                        !data.latitude ? 'opacity-50 cursor-not-allowed grayscale' : 'shadow-brand-blue/20'
                    }`}
                    disabled={!data.latitude}
                >
                    Continuer
                </Button>
                {!data.latitude && inputValue.length > 0 && (
                    <p className="text-center text-[10px] uppercase tracking-widest text-slate-400 mt-3 font-bold">
                        Veuillez sélectionner une adresse suggérée
                    </p>
                )}
            </div>
        </div>
    );
};
