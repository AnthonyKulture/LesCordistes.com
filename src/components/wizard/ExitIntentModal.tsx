'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface ExitIntentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (email: string) => void;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ isOpen, onClose, onCapture }) => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        onCapture(email);
        setSent(true);
        setTimeout(onClose, 1800);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {sent ? (
                            <div className="text-center py-4">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail size={26} className="text-green-600" />
                                </div>
                                <p className="text-lg font-bold text-slate-900">C'est noté !</p>
                                <p className="text-sm text-slate-500 mt-1">Nous vous recontacterons bientôt.</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Mail size={22} className="text-brand-blue" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Votre projet est en cours</h2>
                                <p className="text-sm text-slate-500 mb-6">
                                    Laissez votre email — nous vous aidons à trouver le bon cordiste.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        placeholder="votre@email.fr"
                                        autoFocus
                                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                                    />
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        disabled={!email}
                                        className="w-full h-11 font-bold"
                                    >
                                        Être recontacté
                                        <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-400 text-center mt-3">
                                    Aucun spam — uniquement pour votre projet.
                                </p>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
