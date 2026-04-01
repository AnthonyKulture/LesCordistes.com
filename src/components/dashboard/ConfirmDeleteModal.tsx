import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmDeleteModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                    <AlertTriangle size={32} className="text-red-600" />
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 mb-2">Supprimer la mission ?</h2>
                <p className="text-slate-500 font-medium mb-8">
                    Cette action est irréversible. Toutes les données de cette mission seront définitivement supprimées.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="h-12 rounded-xl font-bold border-2"
                    >
                        Annuler
                    </Button>
                    <button
                        onClick={onConfirm}
                        className="h-12 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};
