'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, Menu, X, BellDot, ExternalLink, Mail, Inbox } from 'lucide-react'

type Props = {
    adminEmail: string
    adminName: string | null
    pendingCount: number
    children: React.ReactNode
}

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/missions', label: 'Missions', icon: Briefcase, exact: false },
    { href: '/admin/leads', label: 'Leads', icon: Inbox, exact: false },
    { href: '/admin/profils', label: 'Profils', icon: Users, exact: false },
    { href: '/admin/marketing', label: 'Marketing', icon: Mail, exact: false },
] as const

export function AdminShell({ adminEmail, adminName, pendingCount, children }: Props) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top bar mobile */}
            <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <button
                    type="button"
                    onClick={() => setMobileOpen(o => !o)}
                    className="p-2 -ml-2 rounded hover:bg-slate-100"
                    aria-label="Ouvrir le menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <span className="font-semibold tracking-tight">LC Admin</span>
                <Link href="/admin/missions?status=pending" className="relative p-2 -mr-2 rounded hover:bg-slate-100">
                    <BellDot className="h-5 w-5" />
                    {pendingCount > 0 && (
                        <span className="absolute top-1 right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {pendingCount}
                        </span>
                    )}
                </Link>
            </header>

            <div className="flex">
                {/* Sidebar desktop */}
                <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r border-slate-200 bg-white">
                    <div className="px-5 py-5 border-b border-slate-200">
                        <Link href="/admin" className="block">
                            <div className="text-base font-bold text-[#243355]">LesCordistes</div>
                            <div className="text-xs uppercase tracking-wider text-slate-500">Admin Ops</div>
                        </Link>
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {NAV.map(item => {
                            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                            const Icon = item.icon
                            const showBadge = item.href === '/admin/missions' && pendingCount > 0
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-[#243355] text-white'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </span>
                                    {showBadge && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-[#243355]' : 'bg-red-500 text-white'}`}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="px-3 py-4 border-t border-slate-200 space-y-2">
                        <a
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-700"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Voir le site
                        </a>
                        <div className="px-3 py-2 text-xs text-slate-400">
                            <div className="truncate font-medium text-slate-600">{adminName ?? 'Admin'}</div>
                            <div className="truncate">{adminEmail}</div>
                        </div>
                    </div>
                </aside>

                {/* Drawer mobile */}
                {mobileOpen && (
                    <div className="md:hidden fixed inset-0 z-30">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                        <aside className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
                            <div className="px-5 py-5 border-b border-slate-200">
                                <div className="text-base font-bold text-[#243355]">LesCordistes</div>
                                <div className="text-xs uppercase tracking-wider text-slate-500">Admin Ops</div>
                            </div>
                            <nav className="flex-1 px-3 py-4 space-y-1">
                                {NAV.map(item => {
                                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                                active ? 'bg-[#243355] text-white' : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </nav>
                            <div className="px-3 py-3 border-t border-slate-200 text-xs text-slate-500">
                                <div className="truncate font-medium text-slate-600">{adminName ?? 'Admin'}</div>
                                <div className="truncate">{adminEmail}</div>
                            </div>
                        </aside>
                    </div>
                )}

                <main className="flex-1 md:ml-64 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
