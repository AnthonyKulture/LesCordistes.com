import { useDashboardMode } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, UserPlus, RefreshCw } from 'lucide-react';

export function ModeSwitcher() {
    const { mode, toggleMode, isSwitching } = useDashboardMode();
    const { profile } = useAuth();

    // Only show for Pros and Admins
    if (!profile || (profile.role !== 'pro' && profile.role !== 'admin')) {
        return null;
    }

    const isWorker = mode === 'worker';

    return (
        <button
            onClick={toggleMode}
            disabled={isSwitching}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${
                isWorker 
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-brand-blue' 
                    : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/20'
            } ${isSwitching ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            title={isWorker ? 'Passer en mode Recruteur' : 'Passer en mode Cordiste'}
        >
            <div className={`p-1.5 rounded-lg ${isWorker ? 'bg-white' : 'bg-brand-blue text-white'}`}>
                {isWorker ? <Briefcase size={14} /> : <UserPlus size={14} />}
            </div>
            <div className="text-left hidden sm:block">
                <p className="text-[10px] uppercase font-bold tracking-tight opacity-60 leading-none mb-0.5">Mode</p>
                <p className="text-xs font-bold leading-none">{isWorker ? 'Cordiste' : 'Recruteur'}</p>
            </div>
            <RefreshCw size={12} className={`ml-1 opacity-40 group-hover:rotate-180 transition-transform duration-500`} />
        </button>
    );
}
