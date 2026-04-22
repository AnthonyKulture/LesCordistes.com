'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobFormData } from '../../types';

interface Step4Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

export const Step4Photos: React.FC<Step4Props> = ({ data, updateData, onNext }) => {
    const [showUpload, setShowUpload] = useState(
        data.photos && data.photos.length > 0
    );
    const [photos, setPhotos] = useState<File[]>(data.photos || []);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (data.photos && data.photos.length > 0 && previews.length === 0) {
            const initialPreviews = data.photos.map(file => URL.createObjectURL(file));
            setPreviews(initialPreviews);
        }
        return () => { previews.forEach(url => URL.revokeObjectURL(url)); };
    }, []);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        const updatedPhotos = [...photos, ...newFiles].slice(0, 5);
        setPhotos(updatedPhotos);
        updateData({ photos: updatedPhotos });
        setPreviews(updatedPhotos.map(f => URL.createObjectURL(f)));
    };

    const removePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
        updateData({ photos: updatedPhotos });
        URL.revokeObjectURL(previews[index]);
        setPreviews(previews.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                        <ImageIcon className="text-brand-blue" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Avez-vous des photos ?</h2>
                </div>
                <p className="text-slate-600">Des visuels du chantier aident à obtenir des devis plus précis.</p>
            </div>

            <AnimatePresence mode="wait">
                {!showUpload ? (
                    <motion.div
                        key="choice"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50/40 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
                                <Upload size={26} className="text-brand-blue" />
                            </div>
                            <span className="text-base font-bold text-slate-800">Oui</span>
                        </button>

                        <button
                            onClick={onNext}
                            className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                <Check size={26} className="text-slate-500" />
                            </div>
                            <span className="text-base font-bold text-slate-800">Non</span>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                    >
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                                isDragging
                                    ? 'border-brand-blue bg-blue-50/50 ring-4 ring-brand-blue/10'
                                    : 'border-slate-200 hover:border-brand-blue hover:bg-slate-50'
                            }`}
                        >
                            <motion.div
                                animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                                    isDragging ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                <Upload size={32} />
                            </motion.div>
                            <p className="text-slate-900 font-bold text-lg">
                                {isDragging ? 'Déposez vos photos' : 'Parcourir ou glisser-déposer'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">PNG, JPG jusqu'à 10 MB · Max 5 photos</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileSelect(e.target.files)}
                                className="hidden"
                            />
                        </motion.div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            <AnimatePresence mode="popLayout">
                                {previews.map((preview, index) => (
                                    <motion.div
                                        key={preview}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="relative group aspect-square"
                                    >
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                                            className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md border border-red-50 hover:bg-red-50 transition-colors z-10"
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="pt-2">
                            <Button
                                variant="primary"
                                onClick={onNext}
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-brand-blue/20"
                            >
                                {photos.length > 0 ? `Continuer (${photos.length} photo${photos.length > 1 ? 's' : ''})` : 'Continuer sans photos'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
