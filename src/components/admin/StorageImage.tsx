'use client'

import { useEffect, useState } from 'react'
import type { ImgHTMLAttributes, SyntheticEvent } from 'react'
import { storageImageUrl } from './storageImageUrl'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width'> & {
    src: string | null | undefined
    /** Largeur demandée à l'API de transformation Supabase (px). */
    width: number
    quality?: number
    resize?: 'cover' | 'contain' | 'fill'
}

/**
 * <img> servi via l'API de transformation Supabase, avec repli automatique sur
 * l'URL d'origine si la variante transformée échoue (plan sans transformations,
 * bucket privé, format refusé). Le repli est la garantie qu'aucune vignette
 * ne peut casser à cause de l'optimisation.
 */
export function StorageImage({ src, width, quality, resize, alt = '', onError, ...rest }: Props) {
    const original = src ?? ''
    const optimized = storageImageUrl(original, { width, quality, resize })
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        setFailed(false)
    }, [optimized])

    if (!original) return null

    function handleError(e: SyntheticEvent<HTMLImageElement, Event>) {
        if (!failed && optimized !== original) setFailed(true)
        onError?.(e)
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            loading="lazy"
            decoding="async"
            {...rest}
            src={failed ? original : optimized}
            alt={alt}
            onError={handleError}
        />
    )
}
