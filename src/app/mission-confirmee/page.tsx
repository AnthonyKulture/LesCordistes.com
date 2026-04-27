import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mission confirmée · LesCordistes',
    robots: { index: false, follow: false },
}

type Status = 'ok' | 'expired' | 'invalid' | 'notfound' | 'unknown'

function CardOk({ jobId }: { jobId: string | null }) {
    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
            <div className="flex items-start gap-4">
                <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                        Merci, votre mission a bien été confirmée.
                    </h1>
                    <p className="mt-2 text-slate-700">
                        Elle reste visible pour les cordistes pendant 5 jours supplémentaires. Vous recevrez un nouveau
                        rappel par email à la fin de cette période, si la mission n&apos;est toujours pas pourvue.
                    </p>
                    {jobId && (
                        <p className="mt-3 text-xs text-slate-500 font-mono">
                            Référence : {jobId}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function CardError({
    title,
    message,
    icon: Icon,
    accent,
}: {
    title: string
    message: string
    icon: React.ComponentType<{ className?: string }>
    accent: 'amber' | 'red'
}) {
    const variants = {
        amber: { card: 'border-amber-200 bg-amber-50', icon: 'bg-amber-100 text-amber-700' },
        red: { card: 'border-red-200 bg-red-50', icon: 'bg-red-100 text-red-700' },
    } as const
    const v = variants[accent]
    return (
        <div className={`rounded-2xl border ${v.card} p-6 md:p-8`}>
            <div className="flex items-start gap-4">
                <span className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full ${v.icon}`}>
                    <Icon className="h-5 w-5" />
                </span>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">{title}</h1>
                    <p className="mt-2 text-slate-700">{message}</p>
                </div>
            </div>
        </div>
    )
}

async function MissionConfirmeeBody({ searchParams }: { searchParams: Promise<{ status?: string; job?: string }> }) {
    const sp = await searchParams
    const status = (sp.status as Status) ?? 'unknown'
    const jobId = sp.job ?? null

    return (
        <main className="min-h-[70vh] bg-slate-50 py-10 md:py-16">
            <div className="max-w-2xl mx-auto px-4">
                {status === 'ok' && <CardOk jobId={jobId} />}
                {status === 'expired' && (
                    <CardError
                        icon={Clock}
                        accent="amber"
                        title="Lien expiré"
                        message="Ce lien de confirmation n'est plus valide (au-delà de 14 jours). Si vous souhaitez maintenir votre mission en ligne, contactez-nous à contact@lescordistes.com — nous la réactiverons manuellement."
                    />
                )}
                {status === 'invalid' && (
                    <CardError
                        icon={XCircle}
                        accent="red"
                        title="Lien invalide"
                        message="Ce lien semble incorrect ou incomplet. Essayez de cliquer à nouveau depuis l'email d'origine. Si le problème persiste, contactez-nous à contact@lescordistes.com."
                    />
                )}
                {status === 'notfound' && (
                    <CardError
                        icon={AlertTriangle}
                        accent="amber"
                        title="Mission introuvable"
                        message="Nous n'avons pas pu retrouver de mission active correspondant à ce lien. Elle a peut-être déjà été confirmée, archivée ou supprimée. Contactez-nous à contact@lescordistes.com si vous pensez qu'il s'agit d'une erreur."
                    />
                )}
                {status === 'unknown' && (
                    <CardError
                        icon={AlertTriangle}
                        accent="amber"
                        title="Statut inconnu"
                        message="Nous n'avons pas pu déterminer le résultat de votre confirmation. Contactez-nous à contact@lescordistes.com pour vérifier l'état de votre mission."
                    />
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-[#243355] text-white text-sm font-medium hover:bg-[#1a2640] transition-colors"
                    >
                        Retour à l&apos;accueil
                    </Link>
                    <Link
                        href="/jobs"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        Voir les missions en ligne
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default function Page({ searchParams }: { searchParams: Promise<{ status?: string; job?: string }> }) {
    return (
        <Suspense>
            <MissionConfirmeeBody searchParams={searchParams} />
        </Suspense>
    )
}
