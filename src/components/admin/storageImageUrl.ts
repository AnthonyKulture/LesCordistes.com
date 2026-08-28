/**
 * Réécrit une URL Supabase Storage publique vers l'API de transformation d'images
 * (`/storage/v1/render/image/public/<bucket>/<path>?width=…&quality=…`).
 *
 * Défensif par construction : toute URL qui ne correspond pas exactement au motif
 * `/storage/v1/object/public/<bucket>/<path>` est renvoyée inchangée (avatar Google,
 * CDN tiers, URL signée, chemin relatif, format non transformable). Une vignette
 * lourde reste préférable à une vignette cassée.
 */

const OBJECT_PUBLIC_PREFIX = '/storage/v1/object/public/'
const RENDER_PUBLIC_PREFIX = '/storage/v1/render/image/public/'

// Formats que l'API de transformation Supabase ne sait pas rendre.
const UNTRANSFORMABLE = /\.(svg|svgz|ico|pdf)$/i

export type StorageImageOptions = {
    width: number
    quality?: number
    resize?: 'cover' | 'contain' | 'fill'
}

function clampQuality(q: number | undefined): number {
    if (typeof q !== 'number' || !Number.isFinite(q)) return 70
    return Math.min(100, Math.max(20, Math.round(q)))
}

export function storageImageUrl(
    src: string | null | undefined,
    opts: StorageImageOptions
): string {
    if (!src) return ''
    if (!src.includes(OBJECT_PUBLIC_PREFIX)) return src

    let parsed: URL
    try {
        parsed = new URL(src)
    } catch {
        return src
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return src
    if (!parsed.pathname.startsWith(OBJECT_PUBLIC_PREFIX)) return src

    const objectPath = parsed.pathname.slice(OBJECT_PUBLIC_PREFIX.length)
    // Il faut au minimum `<bucket>/<fichier>`.
    if (!objectPath.includes('/')) return src
    if (UNTRANSFORMABLE.test(objectPath)) return src

    const width = Math.round(opts.width)
    if (!Number.isFinite(width) || width < 1) return src

    parsed.pathname = RENDER_PUBLIC_PREFIX + objectPath
    parsed.searchParams.set('width', String(width))
    parsed.searchParams.set('quality', String(clampQuality(opts.quality)))
    if (opts.resize) parsed.searchParams.set('resize', opts.resize)

    return parsed.toString()
}
