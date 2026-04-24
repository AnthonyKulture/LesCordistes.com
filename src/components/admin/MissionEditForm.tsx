'use client'

import { useMemo, useState } from 'react'
import { Save, ChevronDown } from 'lucide-react'
import type { Job } from '@/lib/types/ops'

type Contact = {
    first_name?: string
    last_name?: string
    name?: string
    email?: string
    phone?: string
    company_name?: string
}

type Draft = {
    // Basiques
    title: string
    slug: string
    description: string
    category: string
    type: string
    client_type: string
    credit_cost: string
    // Localisation
    location_city: string
    location_address: string
    location_department: string
    latitude: string
    longitude: string
    // Budget & durée
    budget_min: string
    budget_max: string
    daily_rate: string
    duration_days: string
    height_meters: string
    // Dates
    deadline: string
    start_date: string
    // Technique
    internal_reference: string
    structure_type: string
    specific_equipment: string
    equipment_management: string
    contract_type: string
    work_night_weekend: boolean
    security_plan_confirmed: boolean
    required_level: string // textarea multi-ligne
    required_habilitations: string
    secondary_trades: string
    // Contact
    contact_first_name: string
    contact_last_name: string
    contact_email: string
    contact_phone: string
    contact_company_name: string
}

const CATEGORY_OPTS: Array<[string, string]> = [
    ['cleaning', 'Nettoyage'],
    ['construction', 'Construction'],
    ['masonry', 'Maçonnerie'],
    ['painting', 'Peinture'],
    ['industry', 'Industrie'],
    ['event', 'Événementiel'],
    ['securing', 'Sécurisation'],
    ['telecom', 'Télécommunications'],
    ['inspection', 'Inspection'],
    ['repair', 'Dépannage'],
    ['pruning', 'Élagage & Végétaux'],
    ['other', 'Autre'],
]

const CLIENT_TYPE_OPTS: Array<[string, string]> = [
    ['', '—'],
    ['particulier', 'Particulier'],
    ['copropriete_syndic', 'Copropriété / Syndic'],
    ['entreprise_tertiaire', 'Entreprise tertiaire'],
    ['industrie_energie', 'Industrie / Énergie'],
    ['collectivite_public', 'Collectivité / Public'],
    ['association_evenementiel', 'Association / Événementiel'],
    ['entreprise_travaux_hauteur', 'Entreprise travaux en hauteur'],
    ['entreprise_btp', 'Entreprise BTP'],
    ['agence_interim', 'Agence d\'intérim'],
    ['autre_pro', 'Autre pro'],
]

const TYPE_OPTS: Array<[string, string]> = [
    ['standard', 'Standard'],
    ['renfort_pro', 'Renfort PRO (B2B)'],
]

const STRUCTURE_OPTS: Array<[string, string]> = [
    ['', '—'],
    ['habitat_residentiel', 'Habitat résidentiel'],
    ['tertiaire_bureaux', 'Tertiaire / Bureaux'],
    ['industrie_energie', 'Industrie / Énergie'],
    ['genie_civil_ouvrages', 'Génie civil / Ouvrages'],
    ['milieu_naturel_parois', 'Milieu naturel / Parois'],
    ['evenementiel_spectacle', 'Événementiel / Spectacle'],
]

const EQUIPMENT_OPTS: Array<[string, string]> = [
    ['', '—'],
    ['pro_brings_all', 'Pro apporte tout'],
    ['agency_provides_all', 'Agence fournit tout'],
    ['agency_provides_ropes_pro_brings_personal', 'Agence cordes + pro EPI perso'],
]

const CONTRACT_OPTS: Array<[string, string]> = [
    ['', '—'],
    ['subcontracting', 'Sous-traitance'],
    ['freelance', 'Freelance'],
]

function toInput(v: unknown): string {
    if (v === null || v === undefined) return ''
    return String(v)
}

function toDateInput(v: unknown): string {
    if (!v) return ''
    try {
        return new Date(v as string).toISOString().slice(0, 10)
    } catch {
        return ''
    }
}

function initialDraft(job: Job): Draft {
    const c = (job.client_contact_info ?? {}) as Contact
    return {
        title: job.title ?? '',
        slug: job.slug ?? '',
        description: job.description ?? '',
        category: job.category ?? 'other',
        type: job.type ?? 'standard',
        client_type: job.client_type ?? '',
        credit_cost: toInput(job.credit_cost),
        location_city: job.location_city ?? '',
        location_address: job.location_address ?? '',
        location_department: job.location_department ?? '',
        latitude: toInput(job.latitude),
        longitude: toInput(job.longitude),
        budget_min: toInput(job.budget_min),
        budget_max: toInput(job.budget_max),
        daily_rate: toInput(job.daily_rate),
        duration_days: toInput(job.duration_days),
        height_meters: toInput(job.height_meters),
        deadline: toDateInput(job.deadline),
        start_date: toDateInput(job.start_date),
        internal_reference: job.internal_reference ?? '',
        structure_type: job.structure_type ?? '',
        specific_equipment: job.specific_equipment ?? '',
        equipment_management: job.equipment_management ?? '',
        contract_type: job.contract_type ?? '',
        work_night_weekend: !!job.work_night_weekend,
        security_plan_confirmed: !!job.security_plan_confirmed,
        required_level: (job.required_level ?? []).join('\n'),
        required_habilitations: (job.required_habilitations ?? []).join('\n'),
        secondary_trades: (job.secondary_trades ?? []).join('\n'),
        contact_first_name: c.first_name ?? '',
        contact_last_name: c.last_name ?? '',
        contact_email: c.email ?? '',
        contact_phone: c.phone ?? '',
        contact_company_name: c.company_name ?? '',
    }
}

// Convertit le draft en payload compatible avec l'API `action: 'update'`.
function draftToPayload(draft: Draft): Record<string, unknown> {
    const num = (s: string): number | null => {
        if (s.trim() === '') return null
        const n = Number(s)
        return Number.isFinite(n) ? n : null
    }
    const lines = (s: string): string[] =>
        s
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean)

    const fullName = [draft.contact_first_name, draft.contact_last_name].filter(Boolean).join(' ').trim()

    return {
        title: draft.title.trim(),
        slug: draft.slug.trim() || null,
        description: draft.description,
        category: draft.category,
        type: draft.type || null,
        client_type: draft.client_type || null,
        credit_cost: num(draft.credit_cost),
        location_city: draft.location_city.trim(),
        location_address: draft.location_address.trim() || null,
        location_department: draft.location_department.trim() || null,
        latitude: num(draft.latitude),
        longitude: num(draft.longitude),
        budget_min: num(draft.budget_min),
        budget_max: num(draft.budget_max),
        daily_rate: num(draft.daily_rate),
        duration_days: num(draft.duration_days),
        height_meters: num(draft.height_meters),
        deadline: draft.deadline || null,
        start_date: draft.start_date || null,
        internal_reference: draft.internal_reference.trim() || null,
        structure_type: draft.structure_type || null,
        specific_equipment: draft.specific_equipment.trim() || null,
        equipment_management: draft.equipment_management || null,
        contract_type: draft.contract_type || null,
        work_night_weekend: draft.work_night_weekend,
        security_plan_confirmed: draft.security_plan_confirmed,
        required_level: lines(draft.required_level),
        required_habilitations: lines(draft.required_habilitations),
        secondary_trades: lines(draft.secondary_trades),
        client_contact_info: {
            first_name: draft.contact_first_name.trim(),
            last_name: draft.contact_last_name.trim(),
            name: fullName,
            email: draft.contact_email.trim(),
            phone: draft.contact_phone.trim(),
            company_name: draft.contact_company_name.trim() || undefined,
        },
    }
}

export function MissionEditForm({
    job,
    onSaved,
}: {
    job: Job
    onSaved: () => void | Promise<void>
}) {
    const initial = useMemo(() => initialDraft(job), [job])
    const [draft, setDraft] = useState<Draft>(initial)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

    function set<K extends keyof Draft>(k: K, v: Draft[K]) {
        setDraft(d => ({ ...d, [k]: v }))
    }

    async function save() {
        setSaving(true)
        setMsg(null)
        try {
            const res = await fetch(`/api/ops/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', data: draftToPayload(draft) }),
            })
            if (!res.ok) throw new Error(await res.text())
            setMsg('Enregistré ✓')
            await onSaved()
            setTimeout(() => setMsg(null), 3000)
        } catch (err) {
            setMsg('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
        } finally {
            setSaving(false)
        }
    }

    function reset() {
        setDraft(initial)
        setMsg(null)
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Édition complète</h2>
                <div className="flex items-center gap-2">
                    {msg && <span className="text-xs text-slate-600">{msg}</span>}
                    {dirty && (
                        <button
                            type="button"
                            onClick={reset}
                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                            Annuler les modifs
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={save}
                        disabled={!dirty || saving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#243355] text-white rounded-lg hover:bg-[#1c2945] disabled:opacity-40"
                    >
                        <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer tout'}
                    </button>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                <Section title="Basiques" defaultOpen>
                    <Grid2>
                        <Field label="Titre" className="md:col-span-2">
                            <input type="text" value={draft.title} onChange={e => set('title', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Slug">
                            <input type="text" value={draft.slug} onChange={e => set('slug', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Catégorie">
                            <select value={draft.category} onChange={e => set('category', e.target.value)} className={INPUT}>
                                {CATEGORY_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </Field>
                        <Field label="Type">
                            <select value={draft.type} onChange={e => set('type', e.target.value)} className={INPUT}>
                                {TYPE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </Field>
                        <Field label="Type client">
                            <select value={draft.client_type} onChange={e => set('client_type', e.target.value)} className={INPUT}>
                                {CLIENT_TYPE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </Field>
                        <Field label="Coût en crédits">
                            <input type="number" min={0} step={1} value={draft.credit_cost} onChange={e => set('credit_cost', e.target.value)} className={INPUT} />
                        </Field>
                    </Grid2>
                    <Field label="Description" className="mt-4">
                        <textarea value={draft.description} onChange={e => set('description', e.target.value)} rows={8} className={`${INPUT} resize-y`} />
                        <span className="text-xs text-slate-400">{draft.description.length} caractères</span>
                    </Field>
                </Section>

                <Section title="Localisation">
                    <Grid2>
                        <Field label="Ville">
                            <input type="text" value={draft.location_city} onChange={e => set('location_city', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Département">
                            <input type="text" value={draft.location_department} onChange={e => set('location_department', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Adresse" className="md:col-span-2">
                            <input type="text" value={draft.location_address} onChange={e => set('location_address', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Latitude">
                            <input type="number" step="any" value={draft.latitude} onChange={e => set('latitude', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Longitude">
                            <input type="number" step="any" value={draft.longitude} onChange={e => set('longitude', e.target.value)} className={INPUT} />
                        </Field>
                    </Grid2>
                </Section>

                <Section title="Budget & durée">
                    <Grid2>
                        <Field label="Budget min (€)">
                            <input type="number" min={0} value={draft.budget_min} onChange={e => set('budget_min', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Budget max (€)">
                            <input type="number" min={0} value={draft.budget_max} onChange={e => set('budget_max', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="TJM (€/j)">
                            <input type="number" min={0} value={draft.daily_rate} onChange={e => set('daily_rate', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Durée (jours)">
                            <input type="number" min={0} value={draft.duration_days} onChange={e => set('duration_days', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Hauteur (m)">
                            <input type="number" min={0} step="0.1" value={draft.height_meters} onChange={e => set('height_meters', e.target.value)} className={INPUT} />
                        </Field>
                    </Grid2>
                </Section>

                <Section title="Dates">
                    <Grid2>
                        <Field label="Deadline">
                            <input type="date" value={draft.deadline} onChange={e => set('deadline', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Date de début">
                            <input type="date" value={draft.start_date} onChange={e => set('start_date', e.target.value)} className={INPUT} />
                        </Field>
                    </Grid2>
                </Section>

                <Section title="Technique & B2B">
                    <Grid2>
                        <Field label="Réf. interne">
                            <input type="text" value={draft.internal_reference} onChange={e => set('internal_reference', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Type de structure">
                            <select value={draft.structure_type} onChange={e => set('structure_type', e.target.value)} className={INPUT}>
                                {STRUCTURE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </Field>
                        <Field label="Gestion équipement">
                            <select value={draft.equipment_management} onChange={e => set('equipment_management', e.target.value)} className={INPUT}>
                                {EQUIPMENT_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </Field>
                        <Field label="Type de contrat">
                            <select value={draft.contract_type} onChange={e => set('contract_type', e.target.value)} className={INPUT}>
                                {CONTRACT_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </Field>
                        <Field label="Équipement spécifique" className="md:col-span-2">
                            <input type="text" value={draft.specific_equipment} onChange={e => set('specific_equipment', e.target.value)} className={INPUT} />
                        </Field>
                        <label className="flex items-center gap-2 text-sm text-slate-700 mt-1">
                            <input type="checkbox" checked={draft.work_night_weekend} onChange={e => set('work_night_weekend', e.target.checked)} />
                            Travail nuit / week-end
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 mt-1">
                            <input type="checkbox" checked={draft.security_plan_confirmed} onChange={e => set('security_plan_confirmed', e.target.checked)} />
                            Plan de prévention confirmé
                        </label>
                    </Grid2>
                    <Grid2 className="mt-4">
                        <Field label="Niveau requis (une valeur par ligne)">
                            <textarea value={draft.required_level} onChange={e => set('required_level', e.target.value)} rows={3} className={`${INPUT} resize-y font-mono text-xs`} />
                        </Field>
                        <Field label="Habilitations requises (une par ligne)">
                            <textarea value={draft.required_habilitations} onChange={e => set('required_habilitations', e.target.value)} rows={3} className={`${INPUT} resize-y font-mono text-xs`} />
                        </Field>
                        <Field label="Compétences secondaires (une par ligne)" className="md:col-span-2">
                            <textarea value={draft.secondary_trades} onChange={e => set('secondary_trades', e.target.value)} rows={3} className={`${INPUT} resize-y font-mono text-xs`} />
                        </Field>
                    </Grid2>
                </Section>

                <Section title="Contact client">
                    <Grid2>
                        <Field label="Prénom">
                            <input type="text" value={draft.contact_first_name} onChange={e => set('contact_first_name', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Nom">
                            <input type="text" value={draft.contact_last_name} onChange={e => set('contact_last_name', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Email">
                            <input type="email" value={draft.contact_email} onChange={e => set('contact_email', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Téléphone">
                            <input type="tel" value={draft.contact_phone} onChange={e => set('contact_phone', e.target.value)} className={INPUT} />
                        </Field>
                        <Field label="Société" className="md:col-span-2">
                            <input type="text" value={draft.contact_company_name} onChange={e => set('contact_company_name', e.target.value)} className={INPUT} />
                        </Field>
                    </Grid2>
                </Section>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">{dirty ? 'Modifications non enregistrées' : 'À jour'}</span>
                <button
                    type="button"
                    onClick={save}
                    disabled={!dirty || saving}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#243355] text-white rounded-lg hover:bg-[#1c2945] disabled:opacity-40"
                >
                    <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer tout'}
                </button>
            </div>
        </div>
    )
}

const INPUT =
    'w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#243355]/30 bg-white'

function Grid2({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 ${className}`}>{children}</div>
}

function Field({
    label,
    children,
    className = '',
}: {
    label: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={className}>
            <label className="text-xs text-slate-500 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    )
}

function Section({
    title,
    children,
    defaultOpen = false,
}: {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    return (
        <details open={defaultOpen} className="group">
            <summary className="list-none cursor-pointer px-5 py-3 flex items-center justify-between hover:bg-slate-50 select-none">
                <span className="text-sm font-semibold text-slate-800">{title}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 pt-1">{children}</div>
        </details>
    )
}
