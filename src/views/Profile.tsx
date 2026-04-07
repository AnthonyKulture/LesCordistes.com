'use client'

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Award, Camera, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { uploadJobPhoto } from '../lib/supabase';
import { createSupabaseBrowserClient } from '../lib/supabase-browser';
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
    first_name: string;
    last_name: string;
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
    const { profile, user, signOut, refreshProfile } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();
    const { balance } = useCredits();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'info' | 'pro' | 'portfolio'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<ProfileFormData>({
        first_name: '',
        last_name: '',
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
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
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
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

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

            setFormData(prev => {
                const updated = [...prev.portfolio_photos, ...urls].slice(0, 12);

                // Sauvegarde auto en base immédiatement après l'upload
                const client = createSupabaseBrowserClient();
                (client.from('profiles') as any)
                    .update({ portfolio_photos: updated })
                    .eq('id', user.id)
                    .then(({ error }: { error: any }) => {
                        if (error) {
                            toast.error('Erreur lors de la sauvegarde des photos');
                        } else {
                            toast.success('Photos sauvegardées !');
                            refreshProfile();
                        }
                    });

                return { ...prev, portfolio_photos: updated };
            });
        } finally {
            setIsUploadingPhoto(false);
            // Reset input pour permettre de re-sélectionner les mêmes fichiers
            e.target.value = '';
        }
    };

    const removePhoto = (url: string) => {
        if (!user) return;
        setFormData(prev => {
            const updated = prev.portfolio_photos.filter(u => u !== url);

            // Sauvegarde auto
            const client = createSupabaseBrowserClient();
            (client.from('profiles') as any)
                .update({ portfolio_photos: updated })
                .eq('id', user.id)
                .then(({ error }: { error: any }) => {
                    if (!error) refreshProfile();
                });

            return { ...prev, portfolio_photos: updated };
        });
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Le mot de passe doit faire au moins 6 caractères');
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        setSavingPassword(true);
        try {
            const client = createSupabaseBrowserClient();
            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success('Mot de passe défini avec succès !');
            setNewPassword('');
            setNewPasswordConfirm('');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'SUPPRIMER') return;
        setIsDeletingAccount(true);
        try {
            const res = await fetch('/api/delete-account', { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur serveur');
            }
            await signOut();
            router.replace('/');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la suppression du compte');
            setIsDeletingAccount(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // createSupabaseBrowserClient() par appel — garantit la session auth courante
            const client = createSupabaseBrowserClient();
            const { error } = await (client
                .from('profiles') as any)
                .update({
                    first_name: formData.first_name || null,
                    last_name: formData.last_name || null,
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
                        <div className="space-y-8">
                            <PersonalInfoForm
                                isEditing={isEditing}
                                formData={formData}
                                setFormData={setFormData}
                                profile={profile as ProfileType}
                                isPro={isPro}
                            />

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sécurité</h3>
                                <form onSubmit={handlePasswordSave} className="space-y-3 max-w-sm">
                                    <Input
                                        label="Nouveau mot de passe"
                                        type="password"
                                        placeholder="Minimum 6 caractères"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <Input
                                        label="Confirmer le mot de passe"
                                        type="password"
                                        placeholder="Répétez le mot de passe"
                                        value={newPasswordConfirm}
                                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        isLoading={savingPassword}
                                        disabled={!newPassword || !newPasswordConfirm}
                                        className="w-full"
                                    >
                                        {savingPassword ? 'Enregistrement...' : 'Définir le mot de passe'}
                                    </Button>
                                </form>
                            </div>

                            <div className="pt-6 border-t border-red-100">
                                <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">Zone de danger</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    La suppression de votre compte est irréversible. Toutes vos données (missions, messages, crédits) seront définitivement effacées.
                                </p>
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Supprimer mon compte
                                    </button>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3 max-w-sm">
                                        <p className="text-sm font-bold text-red-700">
                                            Tapez <span className="font-black">SUPPRIMER</span> pour confirmer
                                        </p>
                                        <Input
                                            type="text"
                                            placeholder="SUPPRIMER"
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteConfirmText !== 'SUPPRIMER' || isDeletingAccount}
                                                className="flex-1 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isDeletingAccount ? 'Suppression...' : 'Confirmer la suppression'}
                                            </button>
                                            <button
                                                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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
                                    first_name: profile.first_name || '',
                                    last_name: profile.last_name || '',
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
