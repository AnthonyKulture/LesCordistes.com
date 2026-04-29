'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'

interface Template {
    id: string
    template_key: string
    name: string
    description: string | null
    audience_type: 'client' | 'pro' | 'mixed'
    edge_template_id: string
    metadata: { variables?: string[] } | Record<string, unknown> | null
}

interface Segment {
    id: string
    name: string
    description: string | null
    audience_type: 'client' | 'pro' | 'mixed'
}

const AUDIENCES = [
    { value: 'client', label: 'Clients' },
    { value: 'pro', label: 'Pros' },
    { value: 'mixed', label: 'Tous' },
] as const

export function NewCampaignForm({
    templates,
    segments,
}: {
    templates: Template[]
    segments: Segment[]
}) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [audience, setAudience] = useState<'client' | 'pro' | 'mixed'>('pro')
    const [segmentId, setSegmentId] = useState('')
    const [templateKey, setTemplateKey] = useState('')
    const [subject, setSubject] = useState('')
    const [previewText, setPreviewText] = useState('')
    const [extraData, setExtraData] = useState('{}')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const filteredTemplates = useMemo(
        () => templates.filter(t => t.audience_type === audience || t.audience_type === 'mixed'),
        [templates, audience]
    )
    const filteredSegments = useMemo(
        () => segments.filter(s => s.audience_type === audience || s.audience_type === 'mixed'),
        [segments, audience]
    )

    const selectedTemplate = templates.find(t => t.template_key === templateKey)
    const variables = (selectedTemplate?.metadata as { variables?: string[] } | null)?.variables ?? []

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        let templateData: Record<string, unknown> = {}
        try {
            templateData = JSON.parse(extraData || '{}')
        } catch {
            setError('Le champ template_data n\'est pas un JSON valide.')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/marketing/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    audience_type: audience,
                    segment_id: segmentId || null,
                    template_key: templateKey,
                    subject,
                    preview_text: previewText || null,
                    template_data: templateData,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data?.error ?? 'Erreur création')
                return
            }
            router.push(`/admin/marketing/campaigns/${data.campaign.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-slate-200 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nom interne *">
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="Ex: Pros zéro unlock — relance T1"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                    />
                </Field>
                <Field label="Audience *">
                    <select
                        value={audience}
                        onChange={e => {
                            setAudience(e.target.value as 'client' | 'pro' | 'mixed')
                            setSegmentId('')
                            setTemplateKey('')
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                    >
                        {AUDIENCES.map(a => (
                            <option key={a.value} value={a.value}>
                                {a.label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Segment *">
                <select
                    value={segmentId}
                    onChange={e => setSegmentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                >
                    <option value="">Choisir un segment…</option>
                    {filteredSegments.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Template email *">
                <select
                    value={templateKey}
                    onChange={e => setTemplateKey(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                >
                    <option value="">Choisir un template…</option>
                    {filteredTemplates.map(t => (
                        <option key={t.template_key} value={t.template_key}>
                            {t.name} · {t.template_key}
                        </option>
                    ))}
                </select>
                {selectedTemplate?.description && (
                    <p className="text-xs text-slate-500 mt-1">{selectedTemplate.description}</p>
                )}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Objet *">
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        required
                        maxLength={120}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                    />
                </Field>
                <Field label="Preview text">
                    <input
                        type="text"
                        value={previewText}
                        onChange={e => setPreviewText(e.target.value)}
                        maxLength={150}
                        placeholder="Texte affiché dans la liste de mails"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                    />
                </Field>
            </div>

            {variables.length > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                    <div className="font-semibold text-slate-700">Variables disponibles dans ce template :</div>
                    <div className="flex flex-wrap gap-1">
                        {variables.map(v => (
                            <span
                                key={v}
                                className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700"
                            >
                                {v}
                            </span>
                        ))}
                    </div>
                    <p className="text-slate-500 mt-1">
                        <code>name</code>, <code>prenom</code>, <code>firstName</code>, <code>email</code> et{' '}
                        <code>unsubscribeUrl</code> sont injectés automatiquement par destinataire.
                    </p>
                </div>
            )}

            <Field label="Variables JSON (optionnel)">
                <textarea
                    value={extraData}
                    onChange={e => setExtraData(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#243355]/30"
                    placeholder='{"body":"Bonjour…","link":"https://…","linkText":"Voir"}'
                />
                <p className="text-xs text-slate-500 mt-1">
                    Pour <code>admin-custom</code> : <code>body</code>, <code>link</code>, <code>linkText</code>.
                    Pour <code>marketing-generic</code> : <code>html</code>, <code>link</code>, <code>linkText</code>.
                </p>
            </Field>

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#243355] text-white hover:bg-[#1c2944] disabled:opacity-60"
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer en brouillon
                </button>
            </div>
        </form>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">{label}</span>
            {children}
        </label>
    )
}
