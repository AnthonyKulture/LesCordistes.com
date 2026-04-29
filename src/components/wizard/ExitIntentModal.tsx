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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="bg-white rounded-2xl shadow-xl p-5 max-w-sm w-full relative border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            aria-label="Fermer"
                            className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        {sent ? (
                            <div className="text-center py-2">
                                <p className="text-sm font-semibold text-slate-900">C'est noté.</p>
                                <p className="text-xs text-slate-500 mt-0.5">Nous vous recontacterons bientôt.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Mail size={15} className="text-brand-blue shrink-0" />
                                    <h2 className="text-sm font-semibold text-slate-900">Garder votre projet en mémoire</h2>
                                </div>
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                    Laissez votre email — on reprend où vous vous êtes arrêté, sans relance commerciale.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        placeholder="votre@email.fr"
                                        autoFocus
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                    />
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        disabled={!email}
                                        className="w-full h-10 text-sm font-semibold"
                                    >
                                        Sauvegarder
                                        <ArrowRight size={14} className="ml-1.5" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
