'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Lightbulb, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobFormData } from '../../types';

interface Step4Props {
    data: Partial<JobFormData>;
    updateData: (data: Partial<JobFormData>) => void;
    onNext: () => void;
}

export const Step4Photos: React.FC<Step4Props> = ({ data, updateData, onNext }) => {
    const [photos, setPhotos] = useState<File[]>(data.photos || []);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize previews from existing photos in data
    useEffect(() => {
        if (data.photos && data.photos.length > 0 && previews.length === 0) {
            const initialPreviews = data.photos.map(file => URL.createObjectURL(file));
            setPreviews(initialPreviews);
        }
        // Cleanup previews on unmount
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
        const updatedPhotos = [...photos, ...newFiles].slice(0, 5); // Max 5 photos

        setPhotos(updatedPhotos);
        updateData({ photos: updatedPhotos });

        // Update previews
        const newPreviews = updatedPhotos.map((file) => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const removePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
        updateData({ photos: updatedPhotos });

        URL.revokeObjectURL(previews[index]);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    return (
        <div className="space-y-8">
            <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                        <ImageIcon className="text-brand-blue" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Photos (optionnel)</h2>
                </div>
                <p className="text-slate-600">Ajoutez jusqu'à 5 photos pour illustrer le chantier et les accès.</p>
            </div>

            <div className="space-y-6">
                {/* Drag & Drop Zone */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
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
                    
                    <div className="space-y-1">
                        <p className="text-slate-900 font-bold text-lg">
                            {isDragging ? 'Déposez vos photos' : 'Parcourir ou glisser-déposer'}
                        </p>
                        <p className="text-sm text-slate-500">
                            PNG, JPG jusqu'à 10MB • Max 5 photos
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />
                </motion.div>

                {/* Photo Previews */}
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removePhoto(index);
                                    }}
                                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md border border-red-50 hover:bg-red-50 transition-colors z-10"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                                <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none flex items-center justify-center">
                                    <Check className="text-white drop-shadow-md" size={32} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Tips section */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3 text-sm text-amber-800">
                    <Lightbulb className="shrink-0 text-amber-500" size={20} />
                    <div>
                        <p className="font-bold mb-0.5">Conseil d'expert</p>
                        <p className="opacity-90">Des photos claires des points d'ancrage et des accès permettent d'obtenir des devis plus précis et plus rapides.</p>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <Button 
                    variant="primary" 
                    onClick={onNext} 
                    className="w-full h-14 text-lg font-bold shadow-lg shadow-brand-blue/20"
                >
                    {photos.length > 0 ? `Continuer (${photos.length} photo${photos.length > 1 ? 's' : ''})` : 'Continuer sans photos'}
                </Button>
            </div>
        </div>
    );
};
