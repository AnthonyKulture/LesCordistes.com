import React from 'react';
import { MapPin } from 'lucide-react';

interface ZoneManagementProps {
    isEditing: boolean;
    formData: any;
    toggleArrayItem: (field: any, value: string) => void;
    profile: any;
    FRENCH_DEPARTMENTS: any[];
}

export const ZoneManagement: React.FC<ZoneManagementProps> = ({
    isEditing, formData, toggleArrayItem, profile, FRENCH_DEPARTMENTS
}) => {
    return (
        <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-brand-blue" />
                Zones d'intervention (départements)
            </h2>
            {isEditing ? (
                <>
                    <div className="flex flex-wrap gap-1.5 mb-3 max-h-36 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50">
                        {FRENCH_DEPARTMENTS.map(dept => (
                            <button
                                key={dept.code}
                                type="button"
                                onClick={() => toggleArrayItem('intervention_zones', dept.code)}
                                title={dept.label}
                                className={`w-12 h-8 text-xs font-medium rounded border transition-all ${
                                    formData.intervention_zones.includes(dept.code)
                                        ? 'bg-brand-blue text-white border-brand-blue'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue'
                                }`}
                            >
                                {dept.code}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400">
                        {formData.intervention_zones.length} département(s) sélectionné(s)
                    </p>
                </>
            ) : (
                profile.intervention_zones && profile.intervention_zones.length > 0 ? (
                    <>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.intervention_zones.slice(0, 20).map((z: string, i: number) => (
                                <span key={i} className="text-xs px-2 py-1 bg-brand-blue/10 text-brand-blue rounded font-medium">
                                    {z}
                                </span>
                            ))}
                            {profile.intervention_zones.length > 20 && (
                                <span className="text-xs text-slate-400">+{profile.intervention_zones.length - 20} de plus</span>
                            )}
                        </div>
                    </>
                ) : <p className="text-slate-400 italic text-sm">Aucune zone renseignée</p>
            )}
        </div>
    );
};
