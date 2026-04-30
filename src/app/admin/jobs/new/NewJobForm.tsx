'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS } from '@/constants/categories'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface InitialData {
    contact_first_name?: string
    contact_last_name?: string
    contact_email?: string
    contact_phone?: string
    contact_company_name?: string
    location_city?: string
    location_address?: string
    category?: string
    description?: string
    title?: string
    height_meters?: string
    budget_min?: string
    budget_max?: string
    deadline?: string
}

interface Props {
    fromRequestId: string | null
    initial?: InitialData
}

export function NewJobForm({ fromRequestId, initial }: Props) {
    const router = useRouter()

    const [contactFirstName, setContactFirstName] = useState(initial?.contact_first_name ?? '')
    const [contactLastName, setContactLastName] = useState(initial?.contact_last_name ?? '')
    const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? '')
    const [contactPhone, setContactPhone] = useState(initial?.contact_phone ?? '')
    const [contactCompanyName, setContactCompanyName] = useState(
        initial?.contact_company_name ?? ''
    )
    const [clientType, setClientType] = useState<'particulier' | 'professionnel' | ''>('')

    const [type, setType] = useState<'standard' | 'renfort_pro'>('standard')
    const [category, setCategory] = useState(initial?.category ?? '')
    const [title, setTitle] = useState(initial?.title ?? '')
    const [description, setDescription] = useState(initial?.description ?? '')
    const [city, setCity] = useState(initial?.location_city ?? '')
    const [address, setAddress] = useState(initial?.location_address ?? '')
    const [heightMeters, setHeightMeters] = useState(initial?.height_meters ?? '')
    const [budgetMin, setBudgetMin] = useState(initial?.budget_min ?? '')
    const [budgetMax, setBudgetMax] = useState(initial?.budget_max ?? '')
    const [deadline, setDeadline] = useState(initial?.deadline ?? '')
    const [adminNotes, setAdminNotes] = useState('')
    const [status, setStatus] = useState<'live' | 'pending'>('live')

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const valid =
        description.trim().length >= 10 &&
        !!category &&
        city.trim().length >= 2 &&
        (contactEmail.trim().length > 0 || contactPhone.trim().length > 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!valid || submitting) return

        setSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/admin/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    category,
                    client_type: clientType || null,
                    title: title.trim() || null,
                    description: description.trim(),
                    location_city: city.trim(),
                    location_address: address.trim() || null,
                    height_meters: heightMeters ? Number(heightMeters) : null,
                    budget_min: budgetMin ? Number(budgetMin) : null,
                    budget_max: budgetMax ? Number(budgetMax) : null,
                    deadline: deadline || null,
                    contact_first_name: contactFirstName.trim() || null,
                    contact_last_name: contactLastName.trim() || null,
                    contact_email: contactEmail.trim().toLowerCase() || null,
                    contact_phone: contactPhone.trim() || null,
                    contact_company_name: contactCompanyName.trim() || null,
                    admin_notes: adminNotes.trim() || null,
                    from_request_id: fromRequestId,
                    status,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erreur de création')

            router.push(`/admin/missions/${data.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur réseau')
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {fromRequestId && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-emerald-900">
                            Pré-rempli depuis une demande de contact
                        </p>
                        <p className="text-emerald-700 text-xs mt-0.5">
                            La demande sera marquée comme convertie après création.
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm">
                <AlertCircle size={16} className="text-amber-700 mt-0.5 shrink-0" />
                <p className="text-amber-900">
                    Le client <strong>ne recevra pas</strong> d&apos;email automatique
                    (welcome, freshness J+5). Il sera notifié uniquement quand un pro débloquera son lead.
                </p>
            </div>

            <Section title="Mission">
                <Row>
                    <Field label="Type">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as typeof type)}
                            className={inputCls}
                        >
                            <option value="standard">Standard (particulier / B2B classique)</option>
                            <option value="renfort_pro">Renfort PRO (sous-traitance B2B)</option>
                        </select>
                    </Field>
                    <Field label="Statut" hint="« live » : visible immédiatement par les pros.">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as typeof status)}
                            className={inputCls}
                        >
                            <option value="live">Live (visible)</option>
                            <option value="pending">En attente</option>
                        </select>
                    </Field>
                </Row>

                <Row>
                    <Field label="Catégorie *">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className={inputCls}
                        >
                            <option value="">— Choisir —</option>
                            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Type client">
                        <select
                            value={clientType}
                            onChange={(e) => setClientType(e.target.value as typeof clientType)}
                            className={inputCls}
                        >
                            <option value="">— Auto —</option>
                            <option value="particulier">Particulier</option>
                            <option value="professionnel">Professionnel</option>
                        </select>
                    </Field>
                </Row>

                <Field label="Titre" hint="Auto-généré si vide.">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nettoyage façade R+4 - Lyon"
                        className={inputCls}
                    />
                </Field>

                <Field label="Description *" hint="Minimum 10 caractères. Ce que le client a expliqué au téléphone.">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={5}
                        placeholder="Ex. : Façade R+4 à nettoyer en centre-ville. Hauteur ~12 m, environ 80 m². Idéalement avant fin mai."
                        className={inputCls}
                    />
                </Field>
            </Section>

            <Section title="Localisation">
                <Row>
                    <Field label="Ville *">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            placeholder="Lyon"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Adresse (optionnel)">
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="12 rue de la République"
                            className={inputCls}
                        />
                    </Field>
                </Row>

                <Row>
                    <Field label="Hauteur (m)">
                        <input
                            type="number"
                            min="0"
                            value={heightMeters}
                            onChange={(e) => setHeightMeters(e.target.value)}
                            placeholder="12"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Deadline">
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className={inputCls}
                        />
                    </Field>
                </Row>

                <Row>
                    <Field label="Budget min (€)">
                        <input
                            type="number"
                            min="0"
                            value={budgetMin}
                            onChange={(e) => setBudgetMin(e.target.value)}
                            placeholder="800"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Budget max (€)">
                        <input
                            type="number"
                            min="0"
                            value={budgetMax}
                            onChange={(e) => setBudgetMax(e.target.value)}
                            placeholder="1500"
                            className={inputCls}
                        />
                    </Field>
                </Row>
            </Section>

            <Section title="Contact client">
                <Row>
                    <Field label="Prénom">
                        <input
                            type="text"
                            value={contactFirstName}
                            onChange={(e) => setContactFirstName(e.target.value)}
                            placeholder="Jérôme"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Nom">
                        <input
                            type="text"
                            value={contactLastName}
                            onChange={(e) => setContactLastName(e.target.value)}
                            placeholder="Dupont"
                            className={inputCls}
                        />
                    </Field>
                </Row>

                <Row>
                    <Field label="Email">
                        <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="client@email.fr"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Téléphone">
                        <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="06 12 34 56 78"
                            className={inputCls}
                        />
                    </Field>
                </Row>

                <Field label="Société (optionnel)">
                    <input
                        type="text"
                        value={contactCompanyName}
                        onChange={(e) => setContactCompanyName(e.target.value)}
                        placeholder="SARL Bâti+"
                        className={inputCls}
                    />
                </Field>
                <p className="text-xs text-slate-500 mt-1">
                    Email <em>ou</em> téléphone requis. Ce sont ces infos qui seront révélées au pro
                    quand il débloquera le lead.
                </p>
            </Section>

            <Section title="Notes internes (admin uniquement)">
                <Field label="Notes">
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        placeholder="Ex. : appel reçu le 30/04 à 14h, client préfère être recontacté le matin, parle anglais."
                        className={inputCls}
                    />
                </Field>
            </Section>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                    disabled={submitting}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={!valid || submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-brand-blue/90 transition-colors"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Création…
                        </>
                    ) : (
                        'Créer la mission'
                    )}
                </button>
            </div>
        </form>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <fieldset className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <legend className="text-sm font-bold text-slate-900 px-2">{title}</legend>
            {children}
        </fieldset>
    )
}

function Row({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
}

function Field({
    label,
    hint,
    children,
}: {
    label: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
            {children}
            {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
        </label>
    )
}

const inputCls =
    'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all'
