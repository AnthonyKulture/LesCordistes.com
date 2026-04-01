import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    onClick?: () => void;
    trend?: string;
}

export function StatCard({ 
    label, 
    value, 
    icon: Icon, 
    iconColor = "text-brand-blue", 
    iconBg = "bg-brand-blue/10",
    onClick,
    trend
}: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl border border-slate-100 p-4 transition-all group ${onClick ? 'cursor-pointer hover:shadow-sm hover:border-brand-blue/30' : ''}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon size={18} className={iconColor} />
                </div>
                {trend && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{value}</p>
        </div>
    );
}
