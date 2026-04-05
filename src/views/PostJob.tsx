'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Step1Location } from '../components/wizard/Step1Location';
import { Step2Category } from '../components/wizard/Step2Category';
import { Step3Details } from '../components/wizard/Step3Details';
import { Step4Photos } from '../components/wizard/Step4Photos';
import { Step5Contact } from '../components/wizard/Step5Contact';
import { StepReinfortTechnical } from '../components/wizard/StepReinfortTechnical';
import { StepReinfortTrades } from '../components/wizard/StepReinfortTrades';
import { StepReinfortConditions } from '../components/wizard/StepReinfortConditions';
import { createSupabaseBrowserClient, uploadJobPhoto } from '../lib/supabase-browser';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { saveJobDraft, loadJobDraft, clearJobDraft } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobFormData } from '../types';

export const PostJob: React.FC = () => {
    const router = useRouter();
    const toast = useToast();
    const { user: authUser, profile } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0); // For slide animation
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<JobFormData>>({});

    const isRenfort = formData.type === 'renfort_pro';
    const totalSteps = isRenfort ? 7 : 5;

    const steps = isRenfort 
        ? [
            { number: 1, title: 'Catégorie' },
            { number: 2, title: 'Lieu & Logistique' },
            { number: 3, title: 'Tech Specs' },
            { number: 4, title: 'Travaux' },
            { number: 5, title: 'Conditions' },
            { number: 6, title: 'Photos' },
            { number: 7, title: 'Contact' },
        ]
        : [
            { number: 1, title: 'Catégorie' },
            { number: 2, title: 'Localisation' },
            { number: 3, title: 'Détails' },
            { number: 4, title: 'Photos' },
            { number: 5, title: 'Contact' },
        ];

    // Load draft on mount
    useEffect(() => {
        const draft = loadJobDraft();
        const savedStep = localStorage.getItem('lescordistes_postjob_step');
        
        if (draft) {
            setFormData(draft);
        }

        const params = new URLSearchParams(window.location.search);
        const typeParam = params.get('type') as 'standard' | 'renfort_pro' | null;
        
        if (typeParam) {
            // URL param always wins
            updateFormData({ type: typeParam });
            if (draft?.type && draft.type !== typeParam) {
                // If switching type, better to reset to step 1
                setCurrentStep(1);
            } else if (draft && savedStep) {
                // Correct type, restore step
                const step = parseInt(savedStep, 10);
                const max = typeParam === 'renfort_pro' ? 7 : 5;
                if (step > 1 && step <= max) setCurrentStep(step);
            }
        } else if (!draft?.type) {
            // No param and no draft type? Default to standard
            updateFormData({ type: 'standard' });
        } else if (draft.type === 'renfort_pro' && !window.location.search.includes('type=renfort_pro')) {
            updateFormData({ type: 'standard' });
        } else if (draft && savedStep) {
            // Restore step if we have a draft and no conflicting param
            const step = parseInt(savedStep, 10);
            const max = draft.type === 'renfort_pro' ? 7 : 5;
            if (step > 1 && step <= max) setCurrentStep(step);
        }

        // Handle return from email confirmation
        if (params.get('confirmed') === 'true') {
            const isRenfortDraft = draft?.type === 'renfort_pro';
            setCurrentStep(isRenfortDraft ? 7 : 5);
            toast.success("Compte activé ! Vous pouvez maintenant publier votre mission.");
        }
    }, []);

    // Scroll to top and save step on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        localStorage.setItem('lescordistes_postjob_step', currentStep.toString());
    }, [currentStep]);

    // Save draft on change
    useEffect(() => {
        if (Object.keys(formData).length > 0) {
            saveJobDraft(formData);
        }
    }, [formData]);

    // Pre-fill client typology from profile
    useEffect(() => {
        if (profile?.client_type && !formData.client_type) {
            updateFormData({ client_type: profile.client_type as any });
        }
    }, [profile, formData.client_type]);

    const updateFormData = (data: Partial<JobFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setDirection(1);
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (isNewUser?: boolean, userId?: string) => {
        setIsSubmitting(true);
        try {
            const supabase = createSupabaseBrowserClient();
            // Create job ID for photo uploads
            const jobId = crypto.randomUUID();

            // Generate SEO-friendly slug
            const slugBase = `${formData.title || 'mission'}-${formData.location_city || ''}`
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')  // remove accents
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            const shortId = jobId.split('-')[0];
            const slug = `${slugBase}-${shortId}`;

            // Upload photos if any
            let photoUrls: string[] = [];
            if (formData.photos && formData.photos.length > 0) {
                const uploadPromises = formData.photos.map((file) => uploadJobPhoto(file, jobId));
                const results = await Promise.all(uploadPromises);
                photoUrls = results.filter((url): url is string => url !== null);
            }

            // Get the current user from AuthContext (session-aware)
            const currentUserId = userId || authUser?.id;
            
            // If new user (registration flow), wait a moment for the profile trigger/sync to complete
            if (isNewUser) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Sync phone number to profile if present in form
            if (currentUserId && formData.contact_phone) {
                console.log('Syncing phone to profile for user:', currentUserId);
                const { error: profileError } = await (supabase
                    .from('profiles') as any)
                    .update({ 
                        phone: formData.contact_phone,
                        client_type: formData.client_type 
                    })
                    .eq('id', currentUserId);
                
                if (profileError) {
                    console.error('Error syncing phone to profile:', profileError);
                } else {
                    console.log('Phone synced to profile successfully:', formData.contact_phone);
                }
            }

            const finalUserId = userId || authUser?.id;

            // Insert job into database
            const jobData = {
                id: jobId,
                slug,
                title: formData.title || '',
                description: formData.description || '',
                category: formData.category || 'other',
                type: formData.type || 'standard',
                client_type: formData.client_type,
                location_city: formData.location_city || '',
                location_address: formData.location_address,
                location_department: formData.location_department,
                latitude: formData.latitude,
                longitude: formData.longitude,
                height_meters: formData.height_meters,
                site_access: undefined, // Deleted field, but let's keep it clean or remove altogether if possible
                difficulty: undefined,
                budget_min: formData.budget_min,
                budget_max: formData.budget_max,
                deadline: formData.deadline,
                photos_url: photoUrls.length > 0 ? photoUrls : null,
                status: 'pending',
                created_by: finalUserId || null,
                client_contact_info: {
                    name: formData.contact_name || '',
                    email: formData.contact_email || '',
                    phone: formData.contact_phone || '',
                },
                // B2B fields
                internal_reference: formData.internal_reference,
                structure_type: formData.structure_type,
                required_level: formData.required_level,
                required_habilitations: formData.required_habilitations,
                secondary_trades: formData.secondary_trades,
                equipment_management: formData.equipment_management,
                specific_equipment: formData.specific_equipment,
                start_date: formData.start_date,
                duration_days: formData.duration_days,
                work_night_weekend: formData.work_night_weekend,
                contract_type: formData.contract_type,
                daily_rate: formData.daily_rate,
                security_plan_confirmed: formData.security_plan_confirmed,
            };

            const { error: insertError } = await (supabase as any).from('jobs').insert(jobData);

            if (insertError) {
                console.error('Supabase Insert Error:', insertError);
                if (insertError.message?.includes('row-level security')) {
                    throw new Error("Erreur de sécurité : Si vous venez de vous inscrire, vous devez d'abord confirmer votre email (cliquez sur le lien reçu par mail) pour publier cette mission. Ou désactivez 'Confirm Email' dans Supabase pour vos tests.");
                }
                throw new Error(insertError.message || 'Erreur lors de l’insertion de la mission');
            }

            // Clear draft after success
            clearJobDraft();

            // Navigate to success page
            router.push(`/job-success${isNewUser ? '?new=1' : ''}`);
        } catch (error: any) {
            console.error('Full Error details:', error);
            const errorMessage = error.message || 'Une erreur est survenue lors de la soumission. Veuillez réessayer.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        if (isRenfort) {
            switch (currentStep) {
                case 1:
                    return (
                        <Step2Category 
                            data={formData} 
                            updateData={updateFormData} 
                            onNext={nextStep} 
                        />
                    );
                case 2:
                    return (
                        <Step1Location 
                            data={formData} 
                            updateData={updateFormData} 
                            onNext={nextStep} 
                        />
                    );
                case 3:
                    return (
                        <StepReinfortTechnical 
                            data={formData} 
                            updateData={updateFormData} 
                            onNext={nextStep} 
                        />
                    );
                case 4:
                    return (
                        <StepReinfortTrades 
                            data={formData} 
                            updateData={updateFormData} 
                            onNext={nextStep} 
                        />
                    );
                case 5:
                    return (
                        <StepReinfortConditions 
                            data={formData} 
                            updateData={updateFormData} 
                            onNext={nextStep} 
                        />
                    );
                case 6:
                    return (
                        <Step4Photos 
                            data={formData} 
                            updateData={updateFormData} 
                            onNext={nextStep} 
                        />
                    );
                case 7:
                    return (
                        <Step5Contact 
                            data={formData} 
                            updateData={updateFormData} 
                            onSubmit={handleSubmit} 
                            onBack={prevStep}
                            isSubmitting={isSubmitting} 
                        />
                    );
                default:
                    return null;
            }
        }

        switch (currentStep) {
            case 1:
                return (
                    <Step2Category 
                        data={formData} 
                        updateData={updateFormData} 
                        onNext={nextStep} 
                    />
                );
            case 2:
                return (
                    <Step1Location 
                        data={formData} 
                        updateData={updateFormData} 
                        onNext={nextStep} 
                    />
                );
            case 3:
                return (
                    <Step3Details 
                        data={formData} 
                        updateData={updateFormData} 
                        onNext={nextStep} 
                    />
                );
            case 4:
                return (
                    <Step4Photos 
                        data={formData} 
                        updateData={updateFormData} 
                        onNext={nextStep} 
                    />
                );
            case 5:
                return (
                    <Step5Contact 
                        data={formData} 
                        updateData={updateFormData} 
                        onSubmit={handleSubmit} 
                        onBack={prevStep}
                        isSubmitting={isSubmitting} 
                    />
                );
            default:
                return null;
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-slate-50 py-6 sm:py-12">
            
            <div className="container max-w-3xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="relative flex items-center justify-between">
                        {/* Background Track */}
                        <div className="absolute left-0 top-5 w-full h-1.5 bg-slate-200 rounded-full" />
                        
                        {/* Progress Track */}
                        <motion.div 
                            className="absolute left-0 top-5 h-1.5 bg-gradient-to-r from-brand-blue to-blue-400 rounded-full origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: (currentStep - 1) / (totalSteps - 1) }}
                            transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            style={{ width: '100%' }}
                        />

                        {steps.map((step) => {
                            const isCompleted = step.number < currentStep;
                            const isActive = step.number === currentStep;
                            
                            return (
                                <div key={step.number} className="relative z-10 flex flex-col items-center">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            backgroundColor: isCompleted ? '#22c55e' : isActive ? '#0055ff' : '#e2e8f0',
                                            scale: isActive ? 1.2 : 1,
                                            boxShadow: isActive ? '0 0 20px rgba(0, 85, 255, 0.3)' : 'none'
                                        }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                                            isCompleted || isActive ? 'text-white' : 'text-slate-400'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                <Check size={20} strokeWidth={3} />
                                            </motion.div>
                                        ) : (
                                            <span>{step.number}</span>
                                        )}
                                    </motion.div>
                                    <motion.span 
                                        animate={{ 
                                            color: isActive ? '#0f172a' : '#94a3b8',
                                            fontWeight: isActive ? 700 : 500
                                        }}
                                        className="text-[10px] mt-3 uppercase tracking-wider hidden sm:block"
                                    >
                                        {step.title}
                                    </motion.span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content - Removed overflow-hidden to prevent clipping of absolute-positioned dropdowns */}
                <div className="relative min-h-[450px]">
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="bg-white rounded-[24px] shadow-xl p-6 sm:p-8 border border-white/40"
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                {currentStep < totalSteps && (
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={currentStep === 1 ? 'invisible' : ''}
                        >
                            <ChevronLeft size={20} />
                            Précédent
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
