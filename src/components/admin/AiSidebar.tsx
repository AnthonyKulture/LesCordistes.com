'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, Zap, ClipboardCopy, Check, Play, X, Loader2, CheckCircle2, AlertCircle, Search, Eye } from 'lucide-react'
import { ConfirmDialog } from './ConfirmDialog'
import {
    READ_ONLY_TOOL_NAMES,
    DESTRUCTIVE_TOOL_NAMES,
    type ChatContextType,
    type ChatMessage,
    type ContentBlock,
    type ToolUseBlock,
} from '@/lib/types/ops'

type Props = {
    context?: {
        type: ChatContextType
        id?: string
        data?: unknown
    }
    quickActions?: { label: string; prompt: string }[]
    title?: string
    // Callback appelé après un tool mutation réussi — utile pour rafraîchir la page.
    onMutationSuccess?: (toolName: string) => void
}

const DEFAULT_QUICK_JOB = [
    { label: 'Améliorer description', prompt: 'Réécris la description de cette mission de façon plus claire et professionnelle, en conservant absolument toutes les informations techniques. Puis propose-moi de l\'appliquer via update_job_fields.' },
    { label: 'Suggérer titre', prompt: 'Propose 3 titres alternatifs courts et accrocheurs pour cette mission. Si l\'un te semble clairement meilleur, propose-moi de l\'appliquer via update_job_fields.' },
    { label: 'Prête à publier ?', prompt: 'Cette mission est-elle prête à être publiée ? Si oui, propose approve_mission. Si non, liste les problèmes et suggère reject_mission avec un motif approprié.' },
    { label: 'Résumer pour pro', prompt: 'Résume cette mission en 2-3 phrases, comme un pitch pour un cordiste qui hésite à dépenser 1 crédit.' },
]

const DEFAULT_QUICK_PROFILE = [
    { label: 'Profil complet ?', prompt: 'Évalue la complétude de ce profil pro (bio, certifications, zones, équipement). Liste ce qui manque pour être attractif.' },
    { label: 'Cohérence cert.', prompt: 'Les certifications déclarées sont-elles cohérentes avec le bio et les compétences ? Repère toute incohérence.' },
    { label: '+5 crédits offerts', prompt: 'Ajoute 5 crédits à ce pro en compensation (par exemple pour un bug ou un geste commercial). Demande-moi confirmation du motif exact d\'abord si ce n\'est pas évident.' },
]

const DEFAULT_QUICK_FREE = [
    { label: 'Tendances semaine', prompt: 'Quelles sont les 3 tendances ou anomalies que tu repères dans les KPIs ?' },
    { label: 'Action prioritaire', prompt: 'Quelle est l\'action prioritaire pour aujourd\'hui ?' },
]

// Messages stockés côté UI (identique au format ChatMessage + statut d'exécution des tools)
type UiMessage = ChatMessage & {
    // pour l'affichage : résultats d'exécution des tool_use de ce message (assistant seulement)
    toolStatus?: Record<string, 'pending' | 'running' | 'done' | 'error'>
    toolResults?: Record<string, string> // tool_use_id -> résumé humain
}

type PendingToolCall = {
    tool_use_id: string
    name: string
    input: Record<string, unknown>
}

const TOOL_LABELS: Record<string, string> = {
    search_jobs: 'Rechercher des missions',
    get_job: 'Lire une mission',
    search_profiles: 'Rechercher des profils',
    get_profile: 'Lire un profil',
    get_stats: 'Lire les KPIs',
    list_pending_missions: 'Lister les missions en attente',
    approve_mission: 'Approuver la mission',
    reject_mission: 'Rejeter la mission',
    archive_mission: 'Archiver la mission',
    update_job_fields: 'Mettre à jour la mission',
    update_profile_fields: 'Mettre à jour le profil',
    adjust_credits: 'Ajuster les crédits',
    notify_user: "Notifier l'utilisateur",
    send_telegram_note: 'Envoyer une note Telegram',
    send_email: 'Envoyer un email',
}

export function AiSidebar({ context, quickActions, title, onMutationSuccess }: Props) {
    const [history, setHistoryState] = useState<UiMessage[]>([])
    const historyRef = useRef<UiMessage[]>([])
    const setHistory = (updater: UiMessage[] | ((h: UiMessage[]) => UiMessage[])) => {
        const next = typeof updater === 'function'
            ? (updater as (h: UiMessage[]) => UiMessage[])(historyRef.current)
            : updater
        historyRef.current = next
        setHistoryState(next)
    }
    const [input, setInput] = useState('')
    const [streaming, setStreaming] = useState(false)
    // Haiku par défaut (fast=true) : 5× moins cher, capable sur 95% des besoins.
    // L'admin bascule en Sonnet (Pro) via le toggle quand il veut plus de raisonnement.
    const [fast, setFast] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [confirmCall, setConfirmCall] = useState<{ msgIdx: number; call: PendingToolCall } | null>(null)
    const [executingId, setExecutingId] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    // Protection anti-boucle : chaque message utilisateur démarre un compteur.
    // Les auto-exec readonly sont limités à MAX_AUTO_TURNS pour éviter un runaway
    // si le modèle enchaîne des tool_use en continu.
    const MAX_AUTO_TURNS = 6
    const autoTurnRef = useRef(0)

    const ctxType: ChatContextType = context?.type ?? 'free'
    const actions =
        quickActions ??
        (ctxType === 'job' ? DEFAULT_QUICK_JOB : ctxType === 'profile' ? DEFAULT_QUICK_PROFILE : DEFAULT_QUICK_FREE)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [history, streaming])

    // Envoie un tour vers /api/ops/chat avec soit un message soit des tool_results.
    // Met à jour l'historique au fur et à mesure du stream.
    async function runTurn(opts: { message?: string; tool_results?: Array<{ tool_use_id: string; content: string; is_error?: boolean }> }) {
        setError(null)
        setStreaming(true)

        // Historique "API-ready" (envoyé au backend tel quel)
        // IMPORTANT : on lit depuis le ref, pas depuis la closure — sinon les appels récursifs
        // (auto-exec d'outils readonly, executeTool, rejectTool) verraient un state stale
        // et enverraient un tool_result sans le tool_use assistant correspondant (error 400).
        const apiHistory: ChatMessage[] = historyRef.current.map(m => ({ role: m.role, content: m.content }))

        // Si on envoie un user message, on ajoute localement tout de suite
        let workingHistory: UiMessage[] = [...historyRef.current]
        if (opts.message) {
            workingHistory = [...workingHistory, { role: 'user', content: opts.message }]
            setHistory(workingHistory)
        }
        if (opts.tool_results) {
            // Ajoute localement un message user (tool_result blocks) pour l'affichage
            const blocks: ContentBlock[] = opts.tool_results.map(r => ({
                type: 'tool_result',
                tool_use_id: r.tool_use_id,
                content: r.content,
                ...(r.is_error ? { is_error: true } : {}),
            }))
            workingHistory = [...workingHistory, { role: 'user', content: blocks }]
            setHistory(workingHistory)
        }

        try {
            const res = await fetch('/api/ops/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: opts.message,
                    tool_results: opts.tool_results,
                    context,
                    history: apiHistory,
                    fast,
                    enable_tools: true,
                }),
            })
            if (!res.ok || !res.body) {
                const errBody = await res.text().catch(() => '')
                throw new Error(`API ${res.status}: ${errBody.slice(0, 300)}`)
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            // État du parser
            const blocks: ContentBlock[] = []
            const toolJsonBuffers: Record<number, string> = {} // index -> partial_json string

            const assistantIdx = workingHistory.length
            setHistory(h => [...h, { role: 'assistant', content: [], toolStatus: {}, toolResults: {} }])

            const flushRender = () => {
                // Clone les blocks pour éviter les mutations React silencieuses
                const cloned = blocks.map(b => ({ ...b }))
                setHistory(h => {
                    const copy = [...h]
                    copy[assistantIdx] = { ...copy[assistantIdx], content: cloned }
                    return copy
                })
            }

            while (true) {
                const { value, done } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() ?? ''
                for (const line of lines) {
                    if (!line.startsWith('data:')) continue
                    const data = line.slice(5).trim()
                    if (!data || data === '[DONE]') continue
                    let evt: Record<string, unknown>
                    try {
                        evt = JSON.parse(data)
                    } catch {
                        continue
                    }
                    const type = evt.type as string

                    if (type === 'content_block_start') {
                        const idx = evt.index as number
                        const block = evt.content_block as { type: string; id?: string; name?: string; text?: string }
                        if (block.type === 'text') {
                            blocks[idx] = { type: 'text', text: block.text ?? '' }
                        } else if (block.type === 'tool_use') {
                            blocks[idx] = { type: 'tool_use', id: block.id ?? '', name: block.name ?? '', input: {} }
                            toolJsonBuffers[idx] = ''
                        }
                        flushRender()
                    } else if (type === 'content_block_delta') {
                        const idx = evt.index as number
                        const delta = evt.delta as { type: string; text?: string; partial_json?: string }
                        const block = blocks[idx]
                        if (delta.type === 'text_delta' && block?.type === 'text') {
                            block.text += delta.text ?? ''
                        } else if (delta.type === 'input_json_delta') {
                            toolJsonBuffers[idx] = (toolJsonBuffers[idx] ?? '') + (delta.partial_json ?? '')
                        }
                        flushRender()
                    } else if (type === 'content_block_stop') {
                        const idx = evt.index as number
                        const block = blocks[idx]
                        if (block?.type === 'tool_use') {
                            const raw = toolJsonBuffers[idx] ?? '{}'
                            try {
                                block.input = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
                            } catch {
                                block.input = {}
                            }
                        }
                        flushRender()
                    }
                    // message_delta / message_stop — rien à faire côté affichage
                }
            }

            // Auto-exécution des tools read-only (search/get/stats) en fin de stream.
            const readonlyCalls = blocks
                .filter((b): b is ToolUseBlock => b.type === 'tool_use')
                .filter(b => READ_ONLY_TOOL_NAMES.has(b.name))
            if (readonlyCalls.length > 0 && autoTurnRef.current >= MAX_AUTO_TURNS) {
                setError(`Boucle d'outils interrompue (${MAX_AUTO_TURNS} tours auto). Relance si besoin.`)
                return
            }
            if (readonlyCalls.length > 0) {
                autoTurnRef.current += 1
                // Pas de confirmation : exécute en série puis renvoie les tool_results
                const results: Array<{ tool_use_id: string; content: string; is_error?: boolean }> = []
                for (const call of readonlyCalls) {
                    setHistory(h => {
                        const copy = [...h]
                        const m = { ...copy[assistantIdx] }
                        m.toolStatus = { ...(m.toolStatus ?? {}), [call.id]: 'running' }
                        copy[assistantIdx] = m
                        return copy
                    })
                    try {
                        const res = await fetch('/api/ops/tools/execute', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: call.name, input: call.input, tool_use_id: call.id }),
                        })
                        const data = await res.json()
                        const r = data.result as { ok: boolean; summary?: string; error?: string }
                        const summary = r.ok ? (r.summary ?? 'ok') : `Erreur : ${r.error ?? 'inconnue'}`
                        setHistory(h => {
                            const copy = [...h]
                            const m = { ...copy[assistantIdx] }
                            m.toolStatus = { ...(m.toolStatus ?? {}), [call.id]: r.ok ? 'done' : 'error' }
                            m.toolResults = { ...(m.toolResults ?? {}), [call.id]: summary }
                            copy[assistantIdx] = m
                            return copy
                        })
                        results.push({ tool_use_id: call.id, content: summary, is_error: !r.ok })
                    } catch (err) {
                        const msg = err instanceof Error ? err.message : 'erreur'
                        setHistory(h => {
                            const copy = [...h]
                            const m = { ...copy[assistantIdx] }
                            m.toolStatus = { ...(m.toolStatus ?? {}), [call.id]: 'error' }
                            m.toolResults = { ...(m.toolResults ?? {}), [call.id]: msg }
                            copy[assistantIdx] = m
                            return copy
                        })
                        results.push({ tool_use_id: call.id, content: msg, is_error: true })
                    }
                }
                // Poursuit la conversation avec les résultats (stream déjà fermé, on relance)
                setStreaming(false) // permet le re-lancement
                await runTurn({ tool_results: results })
                return
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
        } finally {
            setStreaming(false)
        }
    }

    async function executeTool(msgIdx: number, call: PendingToolCall) {
        setExecutingId(call.tool_use_id)
        // marquer running
        setHistory(h => {
            const copy = [...h]
            const m = { ...copy[msgIdx] }
            m.toolStatus = { ...(m.toolStatus ?? {}), [call.tool_use_id]: 'running' }
            copy[msgIdx] = m
            return copy
        })

        try {
            const res = await fetch('/api/ops/tools/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: call.name, input: call.input, tool_use_id: call.tool_use_id }),
            })
            const data = await res.json()
            const result = data.result as { ok: boolean; summary?: string; error?: string }
            const summary = result.ok ? (result.summary ?? 'ok') : `Erreur : ${result.error ?? 'inconnue'}`

            setHistory(h => {
                const copy = [...h]
                const m = { ...copy[msgIdx] }
                m.toolStatus = { ...(m.toolStatus ?? {}), [call.tool_use_id]: result.ok ? 'done' : 'error' }
                m.toolResults = { ...(m.toolResults ?? {}), [call.tool_use_id]: summary }
                copy[msgIdx] = m
                return copy
            })

            if (result.ok) {
                onMutationSuccess?.(call.name)
            }

            // Renvoie le résultat à Claude pour qu'il continue la conversation
            await runTurn({
                tool_results: [{ tool_use_id: call.tool_use_id, content: summary, is_error: !result.ok }],
            })
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Erreur inconnue'
            setHistory(h => {
                const copy = [...h]
                const m = { ...copy[msgIdx] }
                m.toolStatus = { ...(m.toolStatus ?? {}), [call.tool_use_id]: 'error' }
                m.toolResults = { ...(m.toolResults ?? {}), [call.tool_use_id]: errMsg }
                copy[msgIdx] = m
                return copy
            })
        } finally {
            setExecutingId(null)
            setConfirmCall(null)
        }
    }

    function rejectTool(msgIdx: number, call: PendingToolCall) {
        // L'admin refuse l'action — renvoie un tool_result "refusé" pour que Claude s'adapte
        setHistory(h => {
            const copy = [...h]
            const m = { ...copy[msgIdx] }
            m.toolStatus = { ...(m.toolStatus ?? {}), [call.tool_use_id]: 'error' }
            m.toolResults = { ...(m.toolResults ?? {}), [call.tool_use_id]: 'Action refusée par l\'admin.' }
            copy[msgIdx] = m
            return copy
        })
        runTurn({
            tool_results: [{ tool_use_id: call.tool_use_id, content: 'Action refusée par l\'admin.', is_error: true }],
        })
    }

    async function send(text: string) {
        const trimmed = text.trim()
        if (!trimmed || streaming) return
        setInput('')
        // Reset du compteur anti-boucle : chaque message utilisateur repart à 0.
        autoTurnRef.current = 0
        await runTurn({ message: trimmed })
    }

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-[#243355] to-[#1c2945] text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold text-sm">{title ?? 'Assistant Ops'}</span>
                </div>
                <button
                    type="button"
                    onClick={() => setFast(f => !f)}
                    className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full ${fast ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white'}`}
                    title={fast ? 'Modèle rapide (Haiku)' : 'Modèle complet (Sonnet)'}
                >
                    <Zap className="h-3 w-3" />
                    {fast ? 'Fast' : 'Pro'}
                </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {history.length === 0 && (
                    <p className="text-xs text-slate-500 italic">
                        L&apos;assistant peut maintenant agir : approuver, rejeter, réécrire, ajuster les crédits, envoyer une note Telegram.
                        Chaque action demande ta confirmation.
                    </p>
                )}
                {history.map((m, i) => (
                    <MessageBubble
                        key={i}
                        message={m}
                        onExecute={(call) => setConfirmCall({ msgIdx: i, call })}
                        onReject={(call) => rejectTool(i, call)}
                        executingId={executingId}
                    />
                ))}
                {streaming && <div className="text-xs text-slate-400 italic inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> en train d&apos;écrire</div>}
                {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">{error}</div>
                )}
            </div>

            <div className="border-t border-slate-200 bg-white p-2 space-y-2">
                <div className="flex flex-wrap gap-1">
                    {actions.map(a => (
                        <button
                            key={a.label}
                            type="button"
                            disabled={streaming}
                            onClick={() => send(a.prompt)}
                            className="text-[11px] px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
                <form
                    onSubmit={e => {
                        e.preventDefault()
                        send(input)
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Écris une question ou une instruction…"
                        disabled={streaming}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={streaming || !input.trim()}
                        className="px-3 py-2 bg-[#243355] text-white rounded-lg disabled:opacity-50 hover:bg-[#1c2945]"
                        aria-label="Envoyer"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>

            {confirmCall && (
                <ConfirmDialog
                    open
                    title={TOOL_LABELS[confirmCall.call.name] ?? confirmCall.call.name}
                    description={formatToolPreview(confirmCall.call)}
                    confirmLabel="Exécuter"
                    danger={DESTRUCTIVE_TOOL_NAMES.has(confirmCall.call.name)}
                    busy={executingId === confirmCall.call.tool_use_id}
                    onConfirm={() => executeTool(confirmCall.msgIdx, confirmCall.call)}
                    onCancel={() => {
                        const call = confirmCall.call
                        const idx = confirmCall.msgIdx
                        setConfirmCall(null)
                        rejectTool(idx, call)
                    }}
                />
            )}
        </div>
    )
}

function formatToolPreview(call: PendingToolCall): string {
    const lines: string[] = []
    for (const [k, v] of Object.entries(call.input)) {
        const val = typeof v === 'string' ? v : JSON.stringify(v)
        const truncated = val.length > 200 ? val.slice(0, 200) + '…' : val
        lines.push(`${k}: ${truncated}`)
    }
    return lines.join('\n')
}

function MessageBubble({
    message,
    onExecute,
    onReject,
    executingId,
}: {
    message: UiMessage
    onExecute: (call: PendingToolCall) => void
    onReject: (call: PendingToolCall) => void
    executingId: string | null
}) {
    const isUser = message.role === 'user'

    // Normalise en blocs
    const blocks: ContentBlock[] = typeof message.content === 'string'
        ? [{ type: 'text', text: message.content }]
        : message.content

    // Un message user avec uniquement des tool_results : on n'affiche rien (déjà matérialisé dans la bulle assistant précédente)
    if (isUser && blocks.every(b => b.type === 'tool_result')) return null

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[92%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    isUser ? 'bg-[#243355] text-white' : 'bg-white text-slate-800 border border-slate-200'
                }`}
            >
                <div className="space-y-2">
                    {blocks.map((b, i) => {
                        if (b.type === 'text') {
                            return <TextContent key={i} text={b.text} />
                        }
                        if (b.type === 'tool_use') {
                            const status = message.toolStatus?.[b.id]
                            const result = message.toolResults?.[b.id]
                            return (
                                <ToolCallCard
                                    key={i}
                                    call={b}
                                    status={status}
                                    result={result}
                                    busy={executingId === b.id}
                                    onExecute={() => onExecute({ tool_use_id: b.id, name: b.name, input: b.input })}
                                    onReject={() => onReject({ tool_use_id: b.id, name: b.name, input: b.input })}
                                />
                            )
                        }
                        return null
                    })}
                </div>
            </div>
        </div>
    )
}

function TextContent({ text }: { text: string }) {
    const blocks = extractCodeBlocks(text)
    if (blocks.length === 0) return <p>{text}</p>
    return (
        <div className="space-y-2">
            {blocks.map((b, i) =>
                b.type === 'text' ? <p key={i}>{b.value}</p> : <CodeBlock key={i} code={b.value} />
            )}
        </div>
    )
}

function ToolCallCard({
    call,
    status,
    result,
    busy,
    onExecute,
    onReject,
}: {
    call: ToolUseBlock
    status?: 'pending' | 'running' | 'done' | 'error'
    result?: string
    busy: boolean
    onExecute: () => void
    onReject: () => void
}) {
    const label = TOOL_LABELS[call.name] ?? call.name
    const destructive = DESTRUCTIVE_TOOL_NAMES.has(call.name)
    const readonly = READ_ONLY_TOOL_NAMES.has(call.name)
    const resolved = status === 'done' || status === 'error'
    const Icon = readonly ? (call.name === 'get_job' || call.name === 'get_profile' ? Eye : Search) : Play

    const bgClass = readonly
        ? 'border-blue-100 bg-blue-50/50'
        : destructive
          ? 'border-red-200 bg-red-50'
          : 'border-slate-200 bg-slate-50'

    return (
        <div className={`rounded-lg border p-2.5 text-xs ${bgClass}`}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Icon className="h-3 w-3" />
                    {label}
                    {readonly && <span className="text-[10px] text-slate-500 font-normal">(lecture auto)</span>}
                </div>
                {status === 'done' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                {status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
            </div>
            <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-mono leading-relaxed mb-2">
                {formatInputForDisplay(call.input)}
            </pre>
            {resolved ? (
                <div className={`text-[11px] whitespace-pre-wrap ${status === 'error' ? 'text-red-700' : 'text-emerald-700'} font-medium`}>
                    {result ?? (status === 'done' ? '✓ Exécuté' : '× Échec')}
                </div>
            ) : readonly ? (
                <div className="text-[11px] text-slate-500 italic">Exécution automatique…</div>
            ) : (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onExecute}
                        disabled={busy}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-white disabled:opacity-50 ${destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#243355] hover:bg-[#1c2945]'}`}
                    >
                        <Play className="h-3 w-3" /> Exécuter
                    </button>
                    <button
                        type="button"
                        onClick={onReject}
                        disabled={busy}
                        className="inline-flex items-center gap-1 px-2 py-1 border border-slate-200 rounded text-[11px] text-slate-700 hover:bg-slate-100"
                    >
                        <X className="h-3 w-3" /> Refuser
                    </button>
                </div>
            )}
        </div>
    )
}

function formatInputForDisplay(input: Record<string, unknown>): string {
    const lines: string[] = []
    for (const [k, v] of Object.entries(input)) {
        let val: string
        if (typeof v === 'string') {
            val = v.length > 140 ? v.slice(0, 140) + '…' : v
        } else if (typeof v === 'object' && v !== null) {
            const s = JSON.stringify(v)
            val = s.length > 140 ? s.slice(0, 140) + '…' : s
        } else {
            val = String(v)
        }
        lines.push(`${k}: ${val}`)
    }
    return lines.join('\n')
}

function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <div className="relative">
            <pre className="bg-slate-900 text-slate-100 text-xs p-3 rounded overflow-x-auto whitespace-pre-wrap break-words">{code}</pre>
            <button
                type="button"
                onClick={async () => {
                    try {
                        await navigator.clipboard.writeText(code)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1500)
                    } catch {}
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-700 text-white hover:bg-slate-600"
                title="Copier"
            >
                {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
            </button>
        </div>
    )
}

type Block = { type: 'text' | 'code'; value: string }

function extractCodeBlocks(text: string): Block[] {
    const result: Block[] = []
    const regex = /```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const t = text.slice(lastIndex, match.index).trim()
            if (t) result.push({ type: 'text', value: t })
        }
        result.push({ type: 'code', value: match[1].trim() })
        lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) {
        const tail = text.slice(lastIndex).trim()
        if (tail) result.push({ type: 'text', value: tail })
    }
    return result
}
