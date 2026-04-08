'use client'

import { useEffect, useState } from 'react'
import { Mail, Phone } from 'lucide-react'

// Split to prevent scraper harvesting from SSG HTML.
// Values are assembled client-side only — not present in the static HTML source.
const PHONE_PARTS = ['\u002B33', '6', '60', '50', '16', '82']
const PHONE_DISPLAY_PARTS = ['\u002B33\u00A0', '6\u00A0', '60\u00A0', '50\u00A0', '16\u00A0', '82']
const EMAIL_PARTS = ['contact', '\u0040', 'lescordistes', '\u002E', 'com']

export function FooterContact() {
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')

    useEffect(() => {
        setPhone(PHONE_PARTS.join(''))
        setEmail(EMAIL_PARTS.join(''))
    }, [])

    if (!phone) return <div className="mt-4 space-y-2 h-12" aria-hidden />

    return (
        <div className="mt-4 space-y-2">
            <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 text-slate-300 hover:text-brand-blue-light text-sm transition-colors"
            >
                <Phone size={15} />
                <span>{PHONE_DISPLAY_PARTS.join('')}</span>
            </a>
            <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-slate-300 hover:text-brand-blue-light text-sm transition-colors"
            >
                <Mail size={15} />
                <span>{email}</span>
            </a>
        </div>
    )
}

export function FooterMailIcon({ className }: { className?: string }) {
    const [email, setEmail] = useState('')

    useEffect(() => {
        setEmail(EMAIL_PARTS.join(''))
    }, [])

    if (!email) return <span className={className}><Mail size={20} /></span>

    return (
        <a href={`mailto:${email}`} className={className}>
            <Mail size={20} />
        </a>
    )
}
