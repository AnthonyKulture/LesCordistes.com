import Link from 'next/link'
import { ArrowRight, Award, MapPin, CreditCard } from 'lucide-react'
import type { ProfileWithCredits } from '@/lib/types/ops'

type Props = {
    profile: ProfileWithCredits
}

const ROLE_LABEL: Record<string, string> = {
    pro: 'Pro',
    client: 'Client',
    admin: 'Admin',
}

const ROLE_COLOR: Record<string, string> = {
    pro: 'bg-blue-100 text-[#243355]',
    client: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-purple-100 text-purple-700',
}

export function ProfileCard({ profile }: Props) {
    const name =
        profile.full_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.email
    const certs = profile.certifications ?? []
    const zones = profile.intervention_zones ?? []

    return (
        <Link
            href={`/admin/profils/${profile.id}`}
            className="block bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ROLE_COLOR[profile.role] ?? 'bg-slate-100 text-slate-600'}`}>
                            {ROLE_LABEL[profile.role] ?? profile.role}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
            </div>

            {profile.role === 'pro' && (
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="inline-flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span className="font-mono tabular-nums font-semibold text-slate-700">
                            {profile.credits_balance ?? 0} crédits
                        </span>
                    </span>
                    {profile.company_name && <span className="truncate">· {profile.company_name}</span>}
                </div>
            )}

            {certs.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mb-1">
                    <Award className="h-3 w-3 text-amber-500" />
                    {certs.slice(0, 3).map(c => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">
                            {c}
                        </span>
                    ))}
                    {certs.length > 3 && <span className="text-[10px] text-slate-400">+{certs.length - 3}</span>}
                </div>
            )}

            {zones.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{zones.slice(0, 3).join(', ')}{zones.length > 3 ? '…' : ''}</span>
                </div>
            )}

            <div className="text-[10px] text-slate-400 mt-2">
                Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}
            </div>
        </Link>
    )
}
