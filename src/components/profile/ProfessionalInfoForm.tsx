import React from 'react'
import { Award, Briefcase, Wrench, X, Plus, Shield } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { Profile } from '../../types'

interface ProfessionalInfoFormProps {
    isEditing: boolean
    formData: any
    setFormData: (data: any) => void
    profile: Profile
    toggleArrayItem: (field: any, value: string) => void
    CERTIFICATIONS_LIST: string[]
    SKILLS_LIST: string[]
    newEquipment: string
    setNewEquipment: (val: string) => void
}

export const ProfessionalInfoForm: React.FC<ProfessionalInfoFormProps> = ({
    isEditing,
    formData,
    setFormData,
    profile,
    toggleArrayItem,
    CERTIFICATIONS_LIST,
    SKILLS_LIST,
    newEquipment,
    setNewEquipment,
}) => {
    return (
        <div className="space-y-6">
            {/* Certifications */}
            <SubBlock icon={Award} title="Certifications">
                {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                        {CERTIFICATIONS_LIST.map(cert => (
                            <button
                                key={cert}
                                type="button"
                                onClick={() => toggleArrayItem('certifications', cert)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                    formData.certifications.includes(cert)
                                        ? 'bg-brand-blue text-white border-brand-blue'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue'
                                }`}
                            >
                                {cert}
                            </button>
                        ))}
                    </div>
                ) : profile.certifications && profile.certifications.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((c, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-sm rounded-full font-medium"
                            >
                                ✓ {c}
                            </span>
                        ))}
                    </div>
                ) : (
                    <Empty text="Aucune certification renseignée" />
                )}
            </SubBlock>

            {/* Skills */}
            <SubBlock icon={Briefcase} title="Compétences">
                {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                        {SKILLS_LIST.map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => toggleArrayItem('skills', skill)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                    formData.skills.includes(skill)
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                                }`}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                ) : profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                                {s}
                            </span>
                        ))}
                    </div>
                ) : (
                    <Empty text="Aucune compétence renseignée" />
                )}
            </SubBlock>

            {/* Equipment */}
            <SubBlock icon={Wrench} title="Matériel & Équipement">
                {isEditing ? (
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.equipment.map((item: string, i: number) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                                >
                                    {item}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                equipment: prev.equipment.filter((_: any, j: number) => j !== i),
                                            }))
                                        }
                                    >
                                        <X size={12} className="text-slate-400 hover:text-red-500" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ex: Cordes semi-statiques, Stop, Croll..."
                                value={newEquipment}
                                onChange={e => setNewEquipment(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && newEquipment.trim()) {
                                        e.preventDefault()
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            equipment: [...prev.equipment, newEquipment.trim()],
                                        }))
                                        setNewEquipment('')
                                    }
                                }}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                            />
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (newEquipment.trim()) {
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            equipment: [...prev.equipment, newEquipment.trim()],
                                        }))
                                        setNewEquipment('')
                                    }
                                }}
                            >
                                <Plus size={16} />
                                Ajouter
                            </Button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Appuyez sur Entrée pour ajouter</p>
                    </div>
                ) : profile.equipment && profile.equipment.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {profile.equipment.map((e, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                                🔧 {e}
                            </span>
                        ))}
                    </div>
                ) : (
                    <Empty text="Aucun équipement renseigné" />
                )}
            </SubBlock>

            {/* Insurance */}
            <SubBlock icon={Shield} title="Assurance professionnelle">
                {isEditing ? (
                    <Input
                        label=""
                        value={formData.insurance_info}
                        onChange={e => setFormData({ ...formData, insurance_info: e.target.value })}
                        placeholder="Ex: AXA RC Pro n°123456 – Valide jusqu'en 12/2026"
                    />
                ) : profile.insurance_info ? (
                    <p className="text-slate-700 text-sm">🛡️ {profile.insurance_info}</p>
                ) : (
                    <Empty text="Aucune assurance renseignée" />
                )}
            </SubBlock>
        </div>
    )
}

function SubBlock({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>
    title: string
    children: React.ReactNode
}) {
    return (
        <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Icon size={14} className="text-brand-blue" />
                {title}
            </h3>
            {children}
        </div>
    )
}

function Empty({ text }: { text: string }) {
    return <p className="text-slate-400 italic text-sm">{text}</p>
}
