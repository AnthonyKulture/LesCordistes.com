/**
 * /llms-full.txt — Version étendue de llms.txt pour ingestion par les LLM
 * (ChatGPT, Claude, Perplexity, Gemini). Concatène le llms.txt de base + tout
 * le lexique + les FAQs des articles de blog dans un format texte simple.
 *
 * Cache 24 h sur edge, 7 j en CDN — le contenu change peu.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { SEO_GLOSSARY } from '@/constants/seoGlossary'
import { SEO_BLOG } from '@/constants/seoBlog'
import { SEO_BASE_URL } from '@/constants/seoConfig'

export const dynamic = 'force-static'
export const revalidate = 86400 // 24 h

export async function GET() {
    const baseTxt = await fs.readFile(path.join(process.cwd(), 'public', 'llms.txt'), 'utf-8')

    const lexique = SEO_GLOSSARY
        .map((t) => `## ${t.title}\nURL: ${SEO_BASE_URL}/lexique/${t.slug}\n\n${t.definition}\n\n${t.content}\n`)
        .join('\n---\n\n')

    const blog = SEO_BLOG
        .map((a) => {
            const faqs = (a.faqs ?? [])
                .map((f) => `- Q : ${f.q}\n  R : ${f.a}`)
                .join('\n')
            return [
                `## ${a.title}`,
                `URL: ${SEO_BASE_URL}/blog/${a.slug}`,
                `Publié : ${a.datePublished} · Mis à jour : ${a.dateModified}`,
                '',
                a.description,
                '',
                faqs ? `### FAQ\n${faqs}` : '',
            ].filter(Boolean).join('\n')
        })
        .join('\n\n---\n\n')

    const body = [
        baseTxt.trim(),
        '',
        '====================',
        '# Dictionnaire complet du travail sur cordes',
        '====================',
        '',
        lexique,
        '',
        '====================',
        '# Articles & guides',
        '====================',
        '',
        blog,
        '',
        '---',
        `Généré dynamiquement · Source unique : ${SEO_BASE_URL}/llms-full.txt`,
    ].join('\n')

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        },
    })
}
