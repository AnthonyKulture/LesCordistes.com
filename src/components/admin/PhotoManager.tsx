'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'

const MAX = 10 * 1024 * 1024 // 10 MB, doit matcher l'API

export function PhotoManager({
    jobId,
    photos,
    onChange,
}: {
    jobId: string
    photos: string[]
    onChange: (next: string[]) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function uploadFiles(files: FileList) {
        setError(null)
        setUploading(true)
        let current = photos
        try {
            for (const file of Array.from(files)) {
                if (!file.type.startsWith('image/')) {
                    setError(`Fichier ignoré (non image) : ${file.name}`)
                    continue
                }
                if (file.size > MAX) {
                    setError(`Fichier trop lourd (>10 Mo) : ${file.name}`)
                    continue
                }
                const fd = new FormData()
                fd.append('file', file)
                const res = await fetch(`/api/ops/jobs/${jobId}/photos`, { method: 'POST', body: fd })
                if (!res.ok) {
                    setError(`Upload échoué : ${await res.text()}`)
                    break
                }
                const data = (await res.json()) as { photos_url: string[] }
                current = data.photos_url
                onChange(current)
            }
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    async function remove(url: string) {
        if (!confirm('Supprimer cette photo ?')) return
        setDeleting(url)
        setError(null)
        try {
            const res = await fetch(`/api/ops/jobs/${jobId}/photos`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })
            if (!res.ok) {
                setError(`Suppression échouée : ${await res.text()}`)
                return
            }
            const data = (await res.json()) as { photos_url: string[] }
            onChange(data.photos_url)
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Photos ({photos.length})
                </h2>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? 'Upload…' : 'Ajouter'}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => e.target.files && e.target.files.length > 0 && uploadFiles(e.target.files)}
                />
            </div>

            {error && (
                <div className="mb-3 text-xs bg-red-50 text-red-700 px-3 py-2 rounded-lg">{error}</div>
            )}

            {photos.length === 0 ? (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl px-6 py-10 text-center text-sm text-slate-400 cursor-pointer hover:border-slate-300 hover:text-slate-500 transition-colors"
                >
                    Aucune photo. Cliquez pour ajouter.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((url, i) => {
                        const isDeleting = deleting === url
                        return (
                            <div key={url} className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <a href={url} target="_blank" rel="noreferrer">
                                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => remove(url)}
                                    disabled={isDeleting}
                                    aria-label="Supprimer la photo"
                                    className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1.5 shadow-md border border-red-100 hover:bg-red-50 disabled:opacity-50 transition-colors"
                                >
                                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
