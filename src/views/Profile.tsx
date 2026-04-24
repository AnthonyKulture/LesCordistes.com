'use client'

import React, { useState, useRef, useCallback } from 'react'
import { User, Award, Camera, Lock, MapPin } from 'lucide-react'
import { uploadJobPhoto } from '../lib/supabase'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { FRENCH_DEPARTMENTS } from '../constants/departments'
import { useCredits } from '../hooks/useCredits'
import type { Profile as ProfileType } from '../types'

import { ProfileHeader } from '../components/profile/ProfileHeader'
import { ProfileTabs, type ProfileTab, type ProfileTabId } from '../components/profile/ProfileTabs'
import { SectionCard } from '../components/profile/SectionCard'
import { PersonalInfoForm } from '../components/profile/PersonalInfoForm'
import { ProfessionalInfoForm } from '../components/profile/ProfessionalInfoForm'
import { ZoneManagement } from '../components/profile/ZoneManagement'
import { PortfolioManager } from '../components/profile/PortfolioManager'
import { AccountSection } from '../components/profile/AccountSection'

const CERTIFICATIONS_LIST = [
    'CQP Cordiste N1', 'CQP Cordiste N2', 'IRATA Level 1', 'IRATA Level 2', 'IRATA Level 3',
    'SPRAT Level 1', 'SPRAT Level 2', 'SPRAT Level 3',
    'Travaux en hauteur', 'Habilitation électrique B0', 'CACES Nacelle',
    'Premiers secours (SST)', 'Chef de chantier',
]

const SKILLS_LIST = [
    'Nettoyage façade', 'Inspection visuelle', 'Peinture en hauteur', 'Étanchéité',
    'Ravalement', 'Soudure', 'Câblage', 'Maintenance industrielle',
    'Désamiantage', 'Photographie aérienne', 'Installation panneaux solaires',
    'Élagage', 'Travaux forestiers', 'Événementiel', 'Cinéma / Audiovisuel',
]

type EditableSection = 'personal' | 'professional' | 'zones'

interface ProfileFormData {
    first_name: string
    last_name: string
    full_name: string
    phone: string
    bio: string
    company_name: string
    siret: string
    certifications: string[]
    skills: string[]
    equipment: string[]
    insurance_info: string
    intervention_zones: string[]
    portfolio_photos: string[]
    client_type: string
}

function emptyDraft(): ProfileFormData {
    return {
        first_name: '', last_name: '', full_name: '', phone: '', bio: '',
        company_name: '', siret: '', certifications: [], skills: [],
        equipment: [], insurance_info: '', intervention_zones: [],
        portfolio_photos: [], client_type: '',
    }
}

function fromProfile(p: any): ProfileFormData {
    return {
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        full_name: p.full_name || '',
        phone: p.phone || '',
        bio: p.bio || '',
        company_name: p.company_name || '',
        siret: p.siret || '',
        certifications: p.certifications || [],
        skills: p.skills || [],
        equipment: p.equipment || [],
        insurance_info: p.insurance_info || '',
        intervention_zones: p.intervention_zones || [],
        portfolio_photos: p.portfolio_photos || [],
        client_type: p.client_type || '',
    }
}

export const Profile: React.FC = () => {
    const { profile, user, refreshProfile } = useAuth()
    const toast = useToast()
    const queryClient = useQueryClient()
    const { balance } = useCredits()

    const [activeTab, setActiveTab] = useState<ProfileTabId>('info')
    const [editingSection, setEditingSection] = useState<EditableSection | null>(null)
    const [savingSection, setSavingSection] = useState<EditableSection | null>(null)
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const photoInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<ProfileFormData>(emptyDraft())
    const [newEquipment, setNewEquipment] = useState('')

    // Sync form draft with profile when it loads/refreshes
    React.useEffect(() => {
        if (profile) setFormData(fromProfile(profile))
    }, [profile])

    const toggleArrayItem = useCallback(
        (field: 'certifications' | 'skills' | 'intervention_zones', value: string) => {
            setFormData(prev => ({
                ...prev,
                [field]: prev[field].includes(value)
                    ? prev[field].filter(v => v !== value)
                    : [...prev[field], value],
            }))
        },
        []
    )

    // ---------- Section save helpers ----------

    // Après save / cancel : smooth scroll vers le haut de la page.
    // Cible toujours atteignable (0), aucun problème de clamp possible.
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function patchProfile(
        section: EditableSection,
        payload: Record<string, any>,
        successMsg = 'Profil mis à jour !'
    ) {
        if (!user) return
        setSavingSection(section)
        try {
            const client = createSupabaseBrowserClient()
            const { error } = await (client.from('profiles') as any).update(payload).eq('id', user.id)
            if (error) {
                console.error('Supabase update error:', error)
                toast.error(`Erreur : ${error.message}`)
                return
            }
            toast.success(successMsg)
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
            await refreshProfile()

            scrollToTop()
            setEditingSection(null)
        } catch (err: any) {
            toast.error(err?.message || 'Erreur lors de la mise à jour')
        } finally {
            setSavingSection(null)
        }
    }

    async function savePersonal() {
        await patchProfile(
            'personal',
            {
                first_name: formData.first_name || null,
                last_name: formData.last_name || null,
                full_name: formData.full_name || null,
                phone: formData.phone || null,
                client_type: formData.client_type || null,
                company_name: isPro ? formData.company_name || null : undefined,
                siret: isPro ? formData.siret || null : undefined,
                bio: isPro ? formData.bio || null : undefined,
            },
            'Informations mises à jour !'
        )
    }

    async function saveProfessional() {
        await patchProfile(
            'professional',
            {
                certifications: formData.certifications,
                skills: formData.skills,
                equipment: formData.equipment,
                insurance_info: formData.insurance_info || null,
            },
            'Profil pro mis à jour !'
        )
    }

    async function saveZones() {
        await patchProfile(
            'zones',
            { intervention_zones: formData.intervention_zones },
            'Zones d\'intervention mises à jour !'
        )
    }

    function cancelSection() {
        if (profile) setFormData(fromProfile(profile))
        scrollToTop()
        setEditingSection(null)
    }

    // ---------- Portfolio (auto-save, pas de mode édition) ----------

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length || !user) return

        setIsUploadingPhoto(true)
        try {
            const urls: string[] = []
            for (const file of files.slice(0, 6)) {
                const url = await uploadJobPhoto(file, `portfolio-${user.id}`)
                if (url) urls.push(url)
            }

            const current = (profile as any)?.portfolio_photos || []
            const updated = [...current, ...urls].slice(0, 12)

            const client = createSupabaseBrowserClient()
            const { error } = await (client.from('profiles') as any)
                .update({ portfolio_photos: updated })
                .eq('id', user.id)

            if (error) {
                toast.error('Erreur lors de la sauvegarde des photos')
            } else {
                toast.success('Photos ajoutées !')
                await refreshProfile()
            }
        } finally {
            setIsUploadingPhoto(false)
            e.target.value = ''
        }
    }

    const removePhoto = async (url: string) => {
        if (!user || !confirm('Supprimer cette photo ?')) return
        const current = (profile as any)?.portfolio_photos || []
        const updated = current.filter((u: string) => u !== url)

        const client = createSupabaseBrowserClient()
        const { error } = await (client.from('profiles') as any)
            .update({ portfolio_photos: updated })
            .eq('id', user.id)

        if (error) {
            toast.error('Erreur lors de la suppression')
        } else {
            toast.success('Photo supprimée')
            await refreshProfile()
        }
    }

    // ---------- Render ----------

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue" />
            </div>
        )
    }

    const isPro = profile.role === 'pro'

    const tabs: ProfileTab[] = [
        { id: 'info', label: 'Informations', shortLabel: 'Infos', icon: User },
        ...(isPro
            ? ([
                  { id: 'pro', label: 'Profil Pro', shortLabel: 'Pro', icon: Award },
                  { id: 'portfolio', label: 'Portfolio', shortLabel: 'Photos', icon: Camera },
              ] as ProfileTab[])
            : []),
        { id: 'account', label: 'Compte', shortLabel: 'Compte', icon: Lock },
    ]

    const completionFields = isPro
        ? ['full_name', 'phone', 'bio', 'company_name', 'certifications', 'skills', 'equipment', 'insurance_info', 'intervention_zones', 'portfolio_photos']
        : ['full_name', 'phone']
    const completedCount = completionFields.filter(f => {
        const val = (profile as any)[f]
        return val && (Array.isArray(val) ? val.length > 0 : val !== '')
    }).length
    const completionPct = Math.round((completedCount / completionFields.length) * 100)

    const canEdit = (section: EditableSection) => !editingSection || editingSection === section

    return (
        <div className="min-h-screen bg-slate-50 py-4 sm:py-10 pb-24 sm:pb-10">
            <div className="container max-w-4xl px-4 sm:px-6">
                <ProfileHeader
                    profile={profile as ProfileType}
                    balance={balance}
                    completionPct={completionPct}
                    completionFields={completionFields}
                    completedCount={completedCount}
                />

                <ProfileTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

                {activeTab === 'info' && (
                    <SectionCard
                        icon={User}
                        title="Informations personnelles"
                        sectionId="section-personal"
                        isEditing={editingSection === 'personal'}
                        isSaving={savingSection === 'personal'}
                        canEdit={canEdit('personal')}
                        onEdit={() => setEditingSection('personal')}
                        onCancel={cancelSection}
                        onSave={savePersonal}
                    >
                        <PersonalInfoForm
                            isEditing={editingSection === 'personal'}
                            formData={formData}
                            setFormData={setFormData}
                            profile={profile as ProfileType}
                            isPro={isPro}
                        />
                    </SectionCard>
                )}

                {activeTab === 'pro' && isPro && (
                    <div className="space-y-4 sm:space-y-6">
                        <SectionCard
                            icon={Award}
                            title="Profil professionnel"
                            subtitle="Certifications, compétences, matériel, assurance"
                            sectionId="section-professional"
                            isEditing={editingSection === 'professional'}
                            isSaving={savingSection === 'professional'}
                            canEdit={canEdit('professional')}
                            onEdit={() => setEditingSection('professional')}
                            onCancel={cancelSection}
                            onSave={saveProfessional}
                        >
                            <ProfessionalInfoForm
                                isEditing={editingSection === 'professional'}
                                formData={formData}
                                setFormData={setFormData}
                                profile={profile as ProfileType}
                                toggleArrayItem={toggleArrayItem}
                                CERTIFICATIONS_LIST={CERTIFICATIONS_LIST}
                                SKILLS_LIST={SKILLS_LIST}
                                newEquipment={newEquipment}
                                setNewEquipment={setNewEquipment}
                            />
                        </SectionCard>

                        <SectionCard
                            icon={MapPin}
                            title="Zones d'intervention"
                            subtitle="Départements où vous intervenez"
                            sectionId="section-zones"
                            isEditing={editingSection === 'zones'}
                            isSaving={savingSection === 'zones'}
                            canEdit={canEdit('zones')}
                            onEdit={() => setEditingSection('zones')}
                            onCancel={cancelSection}
                            onSave={saveZones}
                        >
                            <ZoneManagement
                                isEditing={editingSection === 'zones'}
                                formData={formData}
                                toggleArrayItem={toggleArrayItem}
                                profile={profile}
                                FRENCH_DEPARTMENTS={FRENCH_DEPARTMENTS}
                            />
                        </SectionCard>
                    </div>
                )}

                {activeTab === 'portfolio' && isPro && (
                    <PortfolioManager
                        profile={profile}
                        isUploadingPhoto={isUploadingPhoto}
                        handlePhotoUpload={handlePhotoUpload}
                        removePhoto={removePhoto}
                        photoInputRef={photoInputRef}
                    />
                )}

                {activeTab === 'account' && <AccountSection />}
            </div>
        </div>
    )
}
