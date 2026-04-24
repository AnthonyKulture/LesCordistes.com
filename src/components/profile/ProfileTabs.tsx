'use client'

import React from 'react'
import type { LucideIcon } from 'lucide-react'

export type ProfileTabId = 'info' | 'pro' | 'portfolio' | 'account'

export interface ProfileTab {
    id: ProfileTabId
    label: string
    shortLabel?: string
    icon: LucideIcon
}

interface ProfileTabsProps {
    tabs: ProfileTab[]
    active: ProfileTabId
    onChange: (id: ProfileTabId) => void
}

export function ProfileTabs({ tabs, active, onChange }: ProfileTabsProps) {
    return (
        <div
            role="tablist"
            aria-label="Sections du profil"
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 mb-4 sm:mb-6 flex gap-1 overflow-x-auto scrollbar-thin"
        >
            {tabs.map(tab => {
                const isActive = tab.id === active
                const Icon = tab.icon
                return (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`flex-1 min-w-[72px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-semibold transition-all whitespace-nowrap ${
                            isActive
                                ? 'bg-brand-blue text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <Icon size={16} className="shrink-0" />
                        <span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
