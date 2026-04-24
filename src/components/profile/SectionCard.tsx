'use client'

import React from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'

interface SectionCardProps {
    icon: React.ComponentType<{ size?: number; className?: string }>
    title: string
    subtitle?: string
    sectionId?: string
    isEditing: boolean
    isSaving: boolean
    canEdit: boolean
    onEdit: () => void
    onCancel: () => void
    onSave: () => void
    hideActions?: boolean // si true, pas de boutons modifier/save (section auto-save)
    children: React.ReactNode
}

export function SectionCard({
    icon: Icon,
    title,
    subtitle,
    sectionId,
    isEditing,
    isSaving,
    canEdit,
    onEdit,
    onCancel,
    onSave,
    hideActions,
    children,
}: SectionCardProps) {
    return (
        <section id={sectionId} className="bg-white rounded-2xl shadow-sm border border-slate-100 scroll-mt-4 sm:scroll-mt-6">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
                <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Icon size={18} className="text-brand-blue shrink-0" />
                        <span className="truncate">{title}</span>
                    </h2>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5 ml-6">{subtitle}</p>}
                </div>
                {!hideActions && !isEditing && (
                    <button
                        type="button"
                        onClick={onEdit}
                        disabled={!canEdit}
                        aria-label={`Modifier la section ${title}`}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-brand-blue border border-brand-blue/30 rounded-full hover:bg-brand-blue/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Pencil size={13} />
                        <span className="hidden sm:inline">Modifier</span>
                    </button>
                )}
            </div>

            <div className="p-4 sm:p-5">{children}</div>

            {!hideActions && isEditing && (
                <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm px-4 sm:px-5 py-3 border-t border-slate-100 flex gap-2 rounded-b-2xl shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.08)]">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
                    >
                        <X size={15} />
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex-[2] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-light disabled:opacity-60 transition-colors"
                    >
                        {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                        {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            )}
        </section>
    )
}
