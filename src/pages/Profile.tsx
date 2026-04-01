import React, { useState, useRef } from 'react';
import { User, Award, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, uploadJobPhoto } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { FRENCH_DEPARTMENTS } from '../constants/departments';
import { useCredits } from '../hooks/useCredits';
import type { Profile as ProfileType } from '../types';

// Extracted Components
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PersonalInfoForm } from '../components/profile/PersonalInfoForm';
import { ProfessionalInfoForm } from '../components/profile/ProfessionalInfoForm';
import { ZoneManagement } from '../components/profile/ZoneManagement';
import { PortfolioManager } from '../components/profile/PortfolioManager';

const CERTIFICATIONS_LIST = [
    'CQP Cordiste N1', 'CQP Cordiste N2', 'IRATA Level 1', 'IRATA Level 2', 'IRATA Level 3',
    'SPRAT Level 1', 'SPRAT Level 2', 'SPRAT Level 3',
    'Travaux en hauteur', 'Habilitation électrique B0', 'CACES Nacelle',
    'Premiers secours (SST)', 'Chef de chantier',
];

const SKILLS_LIST = [
    'Nettoyage façade', 'Inspection visuelle', 'Peinture en hauteur', 'Étanchéité',
    'Ravalement', 'Soudure', 'Câblage', 'Maintenance industrielle',
    'Désamiantage', 'Photographie aérienne', 'Installation panneaux solaires',
    'Élagage', 'Travaux forestiers', 'Événementiel', 'Cinéma / Audiovisuel',
];

interface ProfileFormData {
    full_name: string;
    phone: string;
    bio: string;
    company_name: string;
    siret: string;
    certifications: string[];
    skills: string[];
    equipment: string[];
    insurance_info: string;
    intervention_zones: string[];
    portfolio_photos: string[];
    client_type: string;
}

export const Profile: React.FC = () => {
    const { profile, user, refreshProfile } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();
    const { balance } = useCredits();
    const [activeTab, setActiveTab] = useState<'info' | 'pro' | 'portfolio'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: '',
        phone: '',
        bio: '',
        company_name: '',
        siret: '',
        certifications: [],
        skills: [],
        equipment: [],
        insurance_info: '',
        intervention_zones: [],
        portfolio_photos: [],
        client_type: '',
    });

    // Sync formData with profile when it loads
    React.useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                bio: profile.bio || '',
                company_name: profile.company_name || '',
                siret: profile.siret || '',
                certifications: profile.certifications || [],
                skills: profile.skills || [],
                equipment: profile.equipment || [],
                insurance_info: profile.insurance_info || '',
                intervention_zones: profile.intervention_zones || [],
                portfolio_photos: profile.portfolio_photos || [],
                client_type: (profile as any).client_type || '',
            });
        }
    }, [profile]);

    const [newEquipment, setNewEquipment] = useState('');

    const toggleArrayItem = (field: 'certifications' | 'skills' | 'intervention_zones', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value],
        }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length || !user) return;

        setIsUploadingPhoto(true);
        try {
            const urls: string[] = [];
            for (const file of files.slice(0, 6)) {
                const url = await uploadJobPhoto(file, `portfolio-${user.id}`);
                if (url) urls.push(url);
            }
            setFormData(prev => ({
                ...prev,
                portfolio_photos: [...prev.portfolio_photos, ...urls].slice(0, 12),
            }));
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const removePhoto = (url: string) => {
        setFormData(prev => ({
            ...prev,
            portfolio_photos: prev.portfolio_photos.filter(u => u !== url),
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .update({
                    full_name: formData.full_name || null,
                    phone: formData.phone || null,
                    bio: formData.bio || null,
                    company_name: formData.company_name || null,
                    siret: formData.siret || null,
                    certifications: formData.certifications,
                    skills: formData.skills,
                    equipment: formData.equipment,
                    insurance_info: formData.insurance_info || null,
                    intervention_zones: formData.intervention_zones,
                    portfolio_photos: formData.portfolio_photos,
                    client_type: formData.client_type || null,
                })
                .eq('id', user.id);

            if (error) {
                console.error('Supabase update error:', error);
                toast.error(`Erreur Supabase: ${error.message}`);
                return;
            }

            toast.success('Profil mis à jour avec succès !');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
            await refreshProfile(); // Refresh the global profile in AuthContext
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue" />
            </div>
        );
    }

    const isPro = profile.role === 'pro';

    const tabs = [
        { id: 'info' as const, label: 'Informations', icon: User },
        ...(isPro ? [
            { id: 'pro' as const, label: 'Profil Pro', icon: Award },
            { id: 'portfolio' as const, label: 'Portfolio', icon: Camera },
        ] : []),
    ];

    // Completion score
    const completionFields = isPro
        ? ['full_name', 'phone', 'bio', 'company_name', 'certifications', 'skills', 'equipment', 'insurance_info', 'intervention_zones', 'portfolio_photos']
        : ['full_name', 'phone'];
    const completedCount = completionFields.filter(f => {
        const val = (profile as any)[f];
        return val && (Array.isArray(val) ? val.length > 0 : val !== '');
    }).length;
    const completionPct = Math.round((completedCount / completionFields.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container max-w-4xl">
                <ProfileHeader 
                    profile={profile as ProfileType}
                    balance={balance}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    completionPct={completionPct}
                    completionFields={completionFields}
                    completedCount={completedCount}
                />

                {/* Tabs */}
                {tabs.length > 1 && (
                    <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                    activeTab === tab.id
                                        ? 'border-brand-blue text-brand-blue'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    {activeTab === 'info' && (
                        <PersonalInfoForm 
                            isEditing={isEditing}
                            formData={formData}
                            setFormData={setFormData}
                            profile={profile as ProfileType}
                            isPro={isPro}
                        />
                    )}

                    {activeTab === 'pro' && isPro && (
                        <div className="space-y-7">
                            <ProfessionalInfoForm 
                                isEditing={isEditing}
                                formData={formData}
                                setFormData={setFormData}
                                profile={profile as ProfileType}
                                toggleArrayItem={toggleArrayItem}
                                CERTIFICATIONS_LIST={CERTIFICATIONS_LIST}
                                SKILLS_LIST={SKILLS_LIST}
                                newEquipment={newEquipment}
                                setNewEquipment={setNewEquipment}
                            />
                            
                            <ZoneManagement 
                                isEditing={isEditing}
                                formData={formData}
                                toggleArrayItem={toggleArrayItem}
                                profile={profile}
                                FRENCH_DEPARTMENTS={FRENCH_DEPARTMENTS}
                            />
                        </div>
                    )}

                    {activeTab === 'portfolio' && isPro && (
                        <PortfolioManager 
                            isEditing={isEditing}
                            formData={formData}
                            profile={profile}
                            isUploadingPhoto={isUploadingPhoto}
                            handlePhotoUpload={handlePhotoUpload}
                            removePhoto={removePhoto}
                            photoInputRef={photoInputRef}
                        />
                    )}

                    {/* Save / Cancel */}
                    {isEditing && (
                        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
                            <Button variant="primary" onClick={handleSave} isLoading={isSaving} className="flex-1">
                                Enregistrer
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setIsEditing(false);
                                // Sync back
                                setFormData({
                                    full_name: profile.full_name || '',
                                    phone: profile.phone || '',
                                    bio: profile.bio || '',
                                    company_name: profile.company_name || '',
                                    siret: profile.siret || '',
                                    certifications: profile.certifications || [],
                                    skills: profile.skills || [],
                                    equipment: profile.equipment || [],
                                    insurance_info: profile.insurance_info || '',
                                    intervention_zones: profile.intervention_zones || [],
                                    portfolio_photos: profile.portfolio_photos || [],
                                    client_type: (profile as any).client_type || '',
                                });
                            }} className="flex-1">
                                Annuler
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
