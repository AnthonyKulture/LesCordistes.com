
import { Clock, Briefcase, Eye, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getCategoryLabel } from '../../constants/categories';

interface Job {
    id: string;
    title: string;
    slug?: string;
    category: string;
    location_city: string;
    status: string;
    created_at: string;
    rejection_reason?: string;
    type?: string;
    height_meters?: number;
    budget_min?: number;
    daily_rate?: number;
    start_date?: string;
}

interface JobListItemProps {
    job: Job;
    onView?: () => void;
    onDelete?: () => void;
    onComplete?: () => void;
    showUnlockers?: React.ReactNode;
    isProDashboard?: boolean;
    onClick?: () => void;
}

export function JobListItem({ 
    job, 
    onView, 
    onDelete, 
    onComplete, 
    showUnlockers,
    isProDashboard,
    onClick
}: JobListItemProps) {

    return (
        <div
            className={`p-4 border border-slate-200 rounded-lg hover:border-brand-blue transition-colors bg-white group ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 group-hover:text-brand-blue transition-colors truncate max-w-md">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={job.status} />
                            {job.type === 'renfort_pro' && (
                                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-bold uppercase tracking-wider border border-brand-blue/20">
                                    🚀 Renfort PRO
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                            <Briefcase size={14} className="text-slate-400" />
                            {getCategoryLabel(job.category)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-slate-300">•</span>
                            <strong>{job.location_city}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-slate-300">•</span>
                            <Clock size={14} />
                            {new Date(job.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        
                        {job.type === 'renfort_pro' && (
                            <>
                                {job.height_meters && (
                                    <span className="flex items-center gap-1.5 text-slate-500">
                                        <span className="text-slate-300">•</span>
                                        🏗️ {job.height_meters}m
                                    </span>
                                )}
                                {(job.budget_min || job.daily_rate) && (
                                    <span className="flex items-center gap-1.5 text-brand-blue font-medium">
                                        <span className="text-slate-300">•</span>
                                        {job.daily_rate ? `${job.daily_rate}€/j` : `${job.budget_min}€+`}
                                    </span>
                                )}
                                {job.start_date && (
                                    <span className="flex items-center gap-1.5 text-orange-600">
                                        <span className="text-slate-300">•</span>
                                        📅 {new Date(job.start_date).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    {job.status === 'rejected' && job.rejection_reason && (
                        <p className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded-lg border border-red-100 inline-flex items-center gap-2">
                            <strong>Motif de refus :</strong> {job.rejection_reason}
                        </p>
                    )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                    {onView && (
                        <button
                            className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-colors"
                            title="Voir la mission"
                            onClick={(e) => {
                                e.stopPropagation();
                                onView();
                            }}
                        >
                            <Eye size={20} />
                        </button>
                    )}
                    {onDelete && (job.status === 'pending' || job.status === 'rejected') && (
                        <button
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer la mission"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    {onComplete && job.status === 'live' && (
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-all font-bold text-xs shadow-sm hover:shadow"
                            title="Marquer comme terminée"
                            onClick={(e) => {
                                e.stopPropagation();
                                onComplete();
                            }}
                        >
                            <CheckCircle size={14} />
                            Clôturer
                        </button>
                    )}
                    {isProDashboard && (
                         <div className="flex items-center gap-2 text-brand-blue text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Gérer <ArrowRight size={14} />
                        </div>
                    )}
                </div>
            </div>
            
            {showUnlockers}
        </div>
    );
}
