import React from 'react'

interface ZoneManagementProps {
    isEditing: boolean
    formData: any
    toggleArrayItem: (field: any, value: string) => void
    profile: any
    FRENCH_DEPARTMENTS: any[]
}

export const ZoneManagement: React.FC<ZoneManagementProps> = ({
    isEditing,
    formData,
    toggleArrayItem,
    profile,
    FRENCH_DEPARTMENTS,
}) => {
    if (isEditing) {
        return (
            <>
                <div className="flex flex-wrap gap-1.5 mb-3 max-h-[50vh] sm:max-h-56 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50">
                    {FRENCH_DEPARTMENTS.map(dept => (
                        <button
                            key={dept.code}
                            type="button"
                            onClick={() => toggleArrayItem('intervention_zones', dept.code)}
                            title={dept.label}
                            className={`w-12 h-9 text-xs font-semibold rounded border transition-all ${
                                formData.intervention_zones.includes(dept.code)
                                    ? 'bg-brand-blue text-white border-brand-blue'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue active:scale-95'
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
        )
    }

    if (profile.intervention_zones && profile.intervention_zones.length > 0) {
        return (
            <div className="flex flex-wrap gap-1.5">
                {profile.intervention_zones.slice(0, 30).map((z: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-1 bg-brand-blue/10 text-brand-blue rounded font-medium">
                        {z}
                    </span>
                ))}
                {profile.intervention_zones.length > 30 && (
                    <span className="text-xs text-slate-400">+{profile.intervention_zones.length - 30} de plus</span>
                )}
            </div>
        )
    }

    return <p className="text-slate-400 italic text-sm">Aucune zone renseignée</p>
}
