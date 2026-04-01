import { useDashboardMode } from '../../contexts/DashboardContext';
import { Briefcase, UserPlus, Sparkles } from 'lucide-react';

export function ModeTransitionOverlay() {
    const { isSwitching, mode } = useDashboardMode();

    const isWorker = mode === 'worker';

    return (
        <div 
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 ${
                isSwitching 
                    ? 'opacity-100 pointer-events-auto' 
                    : 'opacity-0 pointer-events-none transition-opacity duration-500 delay-300'
            }`}
        >
            <div className="relative">
                {/* Background glow for depth */}
                <div className="absolute inset-0 bg-brand-blue/10 blur-[100px] animate-pulse rounded-full" />
                
                {/* Main Content Card */}
                <div className={`relative flex flex-col items-center p-12 bg-white border border-slate-200 rounded-[40px] shadow-2xl transition-all duration-500 transform ${
                    isSwitching ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
                }`}>
                    
                    {/* Icon Container */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 animate-ping bg-brand-blue/30 rounded-full" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-brand-blue to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] border border-white/30 transition-transform duration-700 hover:rotate-6">
                            {isWorker ? (
                                <Briefcase size={40} className="text-white animate-bounce" />
                            ) : (
                                <UserPlus size={40} className="text-white animate-bounce" />
                            )}
                        </div>
                        <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-pulse" size={24} />
                    </div>

                    {/* Text logic */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {isWorker ? 'Espace Cordiste' : 'Espace Recruteur'}
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">
                            Déploiement de vos outils...
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom tag */}
            <div className={`absolute bottom-12 transition-all duration-1000 delay-300 ${isSwitching ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                    Les Cordistes — Premium Experience
                </p>
            </div>
        </div>
    );
}
