import React from 'react';
import { Camera, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface PortfolioManagerProps {
    isEditing: boolean;
    formData: any;
    profile: any;
    isUploadingPhoto: boolean;
    handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removePhoto: (url: string) => void;
    photoInputRef: any;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
    isEditing, formData, profile, isUploadingPhoto,
    handlePhotoUpload, removePhoto, photoInputRef
}) => {
    const photos = isEditing ? formData.portfolio_photos : profile.portfolio_photos || [];

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Camera size={18} className="text-brand-blue" />
                    Photos de chantier ({photos.length}/12)
                </h2>
                {isEditing && (
                    <Button
                        variant="outline"
                        onClick={() => photoInputRef.current?.click()}
                        isLoading={isUploadingPhoto}
                    >
                        <Plus size={16} />
                        Ajouter des photos
                    </Button>
                )}
            </div>

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
                        <div key={i} className="relative group aspect-video">
                            <img
                                src={url}
                                alt={`Chantier ${i + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            {isEditing && (
                                <button
                                    onClick={() => removePhoto(url)}
                                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                    <Camera className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 mb-3">Ajoutez des photos de vos chantiers</p>
                    {isEditing && (
                        <Button variant="outline" onClick={() => photoInputRef.current?.click()}>
                            Choisir des photos
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
