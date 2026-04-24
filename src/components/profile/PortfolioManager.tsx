import React from 'react'
import { Camera, Plus, X, Loader2 } from 'lucide-react'

interface PortfolioManagerProps {
    profile: any
    isUploadingPhoto: boolean
    handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    removePhoto: (url: string) => void
    photoInputRef: any
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
    profile,
    isUploadingPhoto,
    handlePhotoUpload,
    removePhoto,
    photoInputRef,
}) => {
    const photos: string[] = profile.portfolio_photos || []

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 min-w-0">
                    <Camera size={18} className="text-brand-blue shrink-0" />
                    <span>Photos de chantier ({photos.length}/12)</span>
                </h2>
                {photos.length < 12 && (
                    <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-brand-blue border border-brand-blue/30 rounded-full hover:bg-brand-blue/5 disabled:opacity-40 transition-colors"
                    >
                        {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        <span className="hidden sm:inline">{isUploadingPhoto ? 'Upload…' : 'Ajouter'}</span>
                    </button>
                )}
            </div>

            <div className="p-4 sm:p-5">
                <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                />

                {photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {photos.map((url: string, i: number) => (
                            <div key={url} className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Chantier ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(url)}
                                    aria-label="Supprimer la photo"
                                    className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1.5 shadow-md border border-red-100 hover:bg-red-50 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full text-center py-10 sm:py-14 border-2 border-dashed border-slate-200 rounded-xl hover:border-brand-blue hover:bg-brand-blue/5 transition-colors cursor-pointer"
                    >
                        <Camera className="mx-auto text-slate-300 mb-3" size={36} />
                        <p className="text-slate-500 text-sm">Ajoutez des photos de vos chantiers</p>
                        <p className="text-xs text-slate-400 mt-1">Jusqu&apos;à 12 photos</p>
                    </button>
                )}
            </div>
        </section>
    )
}
