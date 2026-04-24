import { requireAdmin } from '@/lib/ops/guard'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { logAdminAction } from '@/lib/ops/audit'

export const dynamic = 'force-dynamic'

const BUCKET = 'job-photos'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

// Extrait le path bucket-relatif depuis une URL publique Supabase Storage.
// Ex : https://xyz.supabase.co/storage/v1/object/public/job-photos/<jobId>/<file>.jpg
//      → <jobId>/<file>.jpg
function extractStoragePath(url: string): string | null {
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.slice(idx + marker.length)
}

// POST /api/ops/jobs/[id]/photos — upload une photo et l'ajoute à photos_url.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
        return Response.json({ error: 'file manquant (multipart/form-data)' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
        return Response.json({ error: 'Fichier non image' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
        return Response.json({ error: 'Fichier > 10 MB' }, { status: 400 })
    }

    const { data: job, error: fetchErr } = await admin
        .from('jobs')
        .select('photos_url')
        .eq('id', id)
        .single()
    if (fetchErr || !job) return Response.json({ error: 'Job not found' }, { status: 404 })

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

    const buffer = await file.arrayBuffer()
    const { error: uploadErr } = await admin.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: false })
    if (uploadErr) return Response.json({ error: uploadErr.message }, { status: 500 })

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
    const publicUrl: string = pub.publicUrl

    const current: string[] = Array.isArray(job.photos_url) ? job.photos_url : []
    const updated = [...current, publicUrl]

    const { error: updateErr } = await admin.from('jobs').update({ photos_url: updated }).eq('id', id)
    if (updateErr) {
        // Best-effort rollback : supprime le fichier uploadé
        await admin.storage.from(BUCKET).remove([path]).catch(() => {})
        return Response.json({ error: updateErr.message }, { status: 500 })
    }

    await logAdminAction({
        action: 'job_photo_added',
        target_table: 'jobs',
        target_id: id,
        payload: { url: publicUrl, path },
        performed_by: guard.user.id,
    })

    return Response.json({ ok: true, url: publicUrl, photos_url: updated })
}

// DELETE /api/ops/jobs/[id]/photos — body { url } — retire une photo.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { id } = await params
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const admin = createSupabaseAdminClient() as any

    const { url } = (await req.json()) as { url?: string }
    if (!url) return Response.json({ error: 'url requis' }, { status: 400 })

    const { data: job, error: fetchErr } = await admin
        .from('jobs')
        .select('photos_url')
        .eq('id', id)
        .single()
    if (fetchErr || !job) return Response.json({ error: 'Job not found' }, { status: 404 })

    const current: string[] = Array.isArray(job.photos_url) ? job.photos_url : []
    const updated = current.filter(u => u !== url)

    const { error: updateErr } = await admin.from('jobs').update({ photos_url: updated }).eq('id', id)
    if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

    const path = extractStoragePath(url)
    if (path) {
        await admin.storage.from(BUCKET).remove([path]).catch(() => {})
    }

    await logAdminAction({
        action: 'job_photo_removed',
        target_table: 'jobs',
        target_id: id,
        payload: { url, path },
        performed_by: guard.user.id,
    })

    return Response.json({ ok: true, photos_url: updated })
}
