'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface RevealProps {
    children: React.ReactNode
    delay?: number
    className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })
    const [armed, setArmed] = useState(false)

    useEffect(() => {
        setArmed(true)
    }, [])

    return (
        <div
            ref={ref}
            className={className ? `reveal ${className}` : 'reveal'}
            data-reveal-hidden={armed && !inView ? '' : undefined}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    )
}
