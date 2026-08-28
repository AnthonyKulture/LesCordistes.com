'use client'

import dynamic from 'next/dynamic'
import { Sparkles, Loader2 } from 'lucide-react'

function SidebarPlaceholder() {
    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-[#243355] to-[#1c2945] text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold text-sm">Assistant</span>
                </div>
            </header>
            <div className="flex-1 flex items-center justify-center bg-slate-50 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Chargement de l&apos;assistant…
            </div>
        </div>
    )
}

/**
 * L'assistant IA (~700 lignes + parser SSE) n'est jamais utile au premier paint
 * et n'a aucun rendu serveur utile. Chargé à la demande pour sortir du bundle
 * initial des trois pages admin qui le montent.
 */
export const AiSidebarLazy = dynamic(
    () => import('./AiSidebar').then(m => m.AiSidebar),
    { ssr: false, loading: () => <SidebarPlaceholder /> }
)
