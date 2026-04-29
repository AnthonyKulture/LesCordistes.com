import { createSupabaseAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Templates · Marketing · Admin' }

/* eslint-disable @typescript-eslint/no-explicit-any */

interface TemplateRow {
    id: string
    template_key: string
    name: string
    description: string | null
    audience_type: string
    edge_template_id: string
    react_template_path: string | null
    metadata: Record<string, unknown> | null
    is_active: boolean
}

async function getTemplates(): Promise<TemplateRow[]> {
    const admin = createSupabaseAdminClient() as any
    const { data } = await admin
        .from('marketing_email_templates')
        .select('*')
        .order('audience_type', { ascending: true })
        .order('name', { ascending: true })
    return (data ?? []) as TemplateRow[]
}

export default async function TemplatesPage() {
    const templates = await getTemplates()
    return (
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto space-y-4">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Templates emails</h1>
                <p className="text-sm text-slate-500">
                    Templates disponibles pour les campagnes marketing. Mappés vers les templates HTML de
                    l'edge function <code className="font-mono text-xs bg-slate-100 px-1 rounded">send-email</code>.
                </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(t => {
                    const variables = (t.metadata?.variables as string[] | undefined) ?? []
                    return (
                        <div
                            key={t.id}
                            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{t.name}</h3>
                                    <p className="text-xs text-slate-500 font-mono">{t.template_key}</p>
                                </div>
                                <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                        t.audience_type === 'pro'
                                            ? 'bg-blue-100 text-blue-700'
                                            : t.audience_type === 'client'
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {t.audience_type}
                                </span>
                            </div>
                            {t.description && <p className="text-sm text-slate-600">{t.description}</p>}
                            <dl className="text-xs space-y-1">
                                <div className="flex gap-2">
                                    <dt className="text-slate-500 w-24 shrink-0">Edge id</dt>
                                    <dd className="font-mono text-slate-700">{t.edge_template_id}</dd>
                                </div>
                                {t.react_template_path && (
                                    <div className="flex gap-2">
                                        <dt className="text-slate-500 w-24 shrink-0">Source</dt>
                                        <dd className="font-mono text-slate-700 break-all">{t.react_template_path}</dd>
                                    </div>
                                )}
                                {variables.length > 0 && (
                                    <div className="flex gap-2">
                                        <dt className="text-slate-500 w-24 shrink-0">Variables</dt>
                                        <dd className="text-slate-700">
                                            {variables.map(v => (
                                                <span
                                                    key={v}
                                                    className="inline-block bg-slate-100 text-slate-700 font-mono text-[11px] px-1.5 py-0.5 rounded mr-1 mb-1"
                                                >
                                                    {v}
                                                </span>
                                            ))}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
