'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Step1Location } from '../components/wizard/Step1Location';
import { Step2Category } from '../components/wizard/Step2Category';
import { Step3Details } from '../components/wizard/Step3Details';
import { Step4Photos } from '../components/wizard/Step4Photos';
import { Step5Contact } from '../components/wizard/Step5Contact';
import { StepReinfortTechnical } from '../components/wizard/StepReinfortTechnical';
import { StepReinfortTrades } from '../components/wizard/StepReinfortTrades';
import { StepReinfortConditions } from '../components/wizard/StepReinfortConditions';
import { ExitIntentModal } from '../components/wizard/ExitIntentModal';
import { ContactPathPicker } from '../components/wizard/ContactPathPicker';
import { createSupabaseBrowserClient, uploadJobPhoto } from '../lib/supabase-browser';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { saveJobDraft, loadJobDraft, clearJobDraft } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobFormData } from '../types';
import posthog from 'posthog-js';

export const PostJob: React.FC = () => {
    const router = useRouter();
    const toast = useToast();
    const { user: authUser, profile, refreshProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0); // For slide animation
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<JobFormData>>({});
    const [showExitIntent, setShowExitIntent] = useState(false);
    // Wizard caché par défaut tant que l'utilisateur n'a pas choisi cette voie
    // dans le ContactPathPicker. Auto-activé si un draft / handoff existe.
    const [wizardActive, setWizardActive] = useState(false);
    const exitFired = useRef(false);
    const formDataRef = useRef(formData);

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
            { number: 2, title: 'Détails' },
            { number: 3, title: 'Photos' },
            { number: 4, title: 'Localisation' },
            { number: 5, title: 'Contact' },
        ];

    // Keep formDataRef in sync for use inside stable closures
    formDataRef.current = formData;

    // Exit-intent: fire once si email pas encore capté.
    // Skip si :
    //   - user déjà connecté ou ayant saisi son email
    //   - user pas dans le wizard (ContactPathPicker affiché → on n'interrompt
    //     PAS les formulaires inline "Message rapide" / "Être recontacté")
    //   - user déjà passé le step 1 (il est engagé)
    // Mouse-leave désactivé : trop agressif. Seul l'idle timer fire, et passe
    // de 4 min → 10 min pour laisser au user le temps de réfléchir.
    useEffect(() => {
        const shouldSkip = () =>
            exitFired.current ||
            !!authUser ||
            !!formDataRef.current.contact_email ||
            !wizardActive ||
            currentStep > 1;

        const idleTimer = setTimeout(() => {
            if (shouldSkip()) return;
            exitFired.current = true;
            setShowExitIntent(true);
        }, 600_000);

        return () => {
            clearTimeout(idleTimer);
        };
    }, [currentStep, authUser, wizardActive]);

    // Load draft on mount
    useEffect(() => {
        const draft = loadJobDraft();
        const savedStep = localStorage.getItem('lescordistes_postjob_step');

        if (draft) {
            setFormData(draft);
            // Si on a déjà entamé le wizard, on le ré-affiche directement
            if (Object.keys(draft).length > 0) setWizardActive(true);
        }
        if (savedStep && parseInt(savedStep, 10) > 1) setWizardActive(true);
        // Utilisateur connecté : on présume qu'il sait ce qu'il fait, pas besoin de cacher le wizard
        if (authUser) setWizardActive(true);

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
            setWizardActive(true);
            toast.success("Compte activé ! Vous pouvez maintenant publier votre mission.");
        }

        // Handoff depuis une landing SEO (city hero) : skipper step 1 si on a la trinité catégorie+email+ville
        const prefillCity = params.get('prefill_city');
        const prefillEmail = params.get('prefill_email');
        const prefillCategory = params.get('prefill_category');
        if (prefillCity && prefillEmail && prefillCategory) {
            const validCategories = ['cleaning', 'construction', 'masonry', 'painting', 'industry', 'event', 'securing', 'telecom', 'inspection', 'repair', 'pruning', 'other'] as const;
            const cat = validCategories.includes(prefillCategory as any) ? (prefillCategory as JobFormData['category']) : 'other';
            updateFormData({
                category: cat,
                contact_email: prefillEmail,
                location_city: prefillCity,
            });
            // Standard wizard: step 2 = Détails. On y envoie le user.
            setCurrentStep(2);
            setWizardActive(true);
        }
    }, []);

    // Scroll to top and save step on step change
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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

    // Nouveau user Google : assigner le bon rôle immédiatement (client pour mission standard, pro pour renfort)
    const googleRoleApplied = useRef(false);
    useEffect(() => {
        if (googleRoleApplied.current || !authUser || !profile) return;
        if (authUser.app_metadata?.provider !== 'google') return;
        if (profile.full_name) return;

        googleRoleApplied.current = true;
        const expectedRole = (formData.type || 'standard') === 'renfort_pro' ? 'pro' : 'client';
        const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Utilisateur';

        const supabase = createSupabaseBrowserClient();
        supabase
            .from('profiles')
            .update({ role: expectedRole, full_name: googleName })
            .eq('id', authUser.id)
            .then(({ error }) => {
                if (!error) refreshProfile();
            });
    }, [authUser, profile, formData.type, refreshProfile]);

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

            const categoryLabels: Record<string, string> = {
                cleaning: 'Nettoyage', construction: 'Construction', masonry: 'Maçonnerie',
                painting: 'Peinture', industry: 'Industrie', event: 'Événementiel',
                securing: 'Sécurisation', telecom: 'Télécommunications', inspection: 'Inspection',
                repair: 'Dépannage', pruning: 'Élagage',
                other: 'Mission',
            };
            const autoTitle = [categoryLabels[formData.category || 'other'] || 'Mission', formData.location_city]
                .filter(Boolean).join(' - ');

            // Generate SEO-friendly slug
            const slugBase = `${formData.title || autoTitle || 'mission'}-${formData.location_city || ''}`
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

            // Sync profile fields — phone toujours, role/full_name pour les nouveaux comptes.
            // "Nouveau compte" = isNewUser (cross-tab) OU ?confirmed=true dans l'URL (redirect flow).
            // signInWithOtp ne passe pas les metadata au trigger Supabase, on force ici.
            if (currentUserId) {
                const isFromConfirmRedirect = new URLSearchParams(window.location.search).get('confirmed') === 'true';
                const shouldSyncIdentity = isNewUser || isFromConfirmRedirect;

                const fullName = [formData.contact_first_name, formData.contact_last_name].filter(Boolean).join(' ');
                const profileUpdate: Record<string, any> = {
                    phone: formData.contact_phone || null,
                    client_type: formData.client_type || null,
                };
                if (shouldSyncIdentity) {
                    profileUpdate.role = formData.type === 'renfort_pro' ? 'pro' : 'client';
                    if (formData.contact_first_name) profileUpdate.first_name = formData.contact_first_name;
                    if (formData.contact_last_name) profileUpdate.last_name = formData.contact_last_name;
                    if (fullName) profileUpdate.full_name = fullName;
                    if (formData.type === 'renfort_pro' && formData.contact_company_name && !formData.is_auto_entrepreneur) {
                        profileUpdate.company_name = formData.contact_company_name;
                    }
                }
                const { error: profileError } = await (supabase
                    .from('profiles') as any)
                    .update(profileUpdate)
                    .eq('id', currentUserId);
                if (profileError) {
                    console.error('Error syncing profile:', profileError);
                }
            }

            const finalUserId = userId || authUser?.id;

            // Insert job into database
            const jobData = {
                id: jobId,
                slug,
                title: formData.title || autoTitle,
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
                    first_name: formData.contact_first_name || '',
                    last_name: formData.contact_last_name || '',
                    name: [formData.contact_first_name, formData.contact_last_name].filter(Boolean).join(' ') || '',
                    email: formData.contact_email || '',
                    phone: formData.contact_phone || '',
                    ...(formData.contact_company_name && !formData.is_auto_entrepreneur ? { company_name: formData.contact_company_name } : {}),
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

            const draftId = localStorage.getItem('lescordistes_postjob_draft_id');

            if (!finalUserId) {
                // Guest: no session, must go through admin API
                const res = await fetch('/api/submit-job', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobData }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Erreur lors de la publication');
                }
                localStorage.removeItem('lescordistes_postjob_draft_id');
            } else if (draftId) {
                const res = await fetch('/api/job-draft', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ draftId, jobData }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Erreur lors de la publication du brouillon');
                }
                localStorage.removeItem('lescordistes_postjob_draft_id');
            } else {
                const { error: insertError } = await (supabase as any).from('jobs').insert(jobData);
                if (insertError) {
                    console.error('Supabase Insert Error:', insertError);
                    if (insertError.message?.includes('row-level security')) {
                        throw new Error("Erreur de sécurité : Votre session n'est pas reconnue. Reconnectez-vous et réessayez.");
                    }
                    throw new Error(insertError.message || 'Erreur lors de l\'insertion de la mission');
                }
            }

            posthog.capture('job_posted', { job_type: formData.type || 'standard', category: formData.category || 'other', location_city: formData.location_city });

            // Si un nouvel utilisateur a été créé (signUp côté wizard), le
            // welcome email est envoyé par le trigger SQL handle_new_user.
            // Ne pas dupliquer ici (sinon double-envoi).

            if (!finalUserId && formData.contact_email) {
                supabase.functions.invoke('send-email', {
                    body: {
                        to: formData.contact_email,
                        subject: 'Votre demande a bien été reçue — LesCordistes.com',
                        templateId: 'guest-job-created',
                        data: {
                            name: formData.contact_first_name || 'Client',
                            title: formData.title || 'votre mission',
                            city: formData.location_city || '',
                        },
                    },
                }).catch(() => {});
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
                            isAuthenticated={!!authUser}
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
                        isAuthenticated={!!authUser}
                    />
                );
            case 2:
                return (
                    <Step3Details
                        data={formData}
                        updateData={updateFormData}
                        onNext={nextStep}
                    />
                );
            case 3:
                return (
                    <Step4Photos
                        data={formData}
                        updateData={updateFormData}
                        onNext={nextStep}
                    />
                );
            case 4:
                return (
                    <Step1Location
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
        <div className="min-h-screen bg-slate-50 py-3 sm:py-12">

            <div className="container max-w-3xl">

                {/* Intro — step 1 only (compact sur mobile pour faire remonter les 3 cartes) */}
                {currentStep === 1 && (
                    <div className="text-center mb-4 sm:mb-8 animate-intro-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] sm:text-xs font-bold mb-2 sm:mb-4 border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            100% gratuit · Sans engagement
                        </div>
                        <h1 className="text-lg sm:text-3xl font-extrabold text-slate-900 mb-1.5 sm:mb-3 leading-snug sm:leading-tight animate-intro-in-delay">
                            Trouvez un cordiste pour vos travaux en hauteur en{' '}
                            <span className="text-brand-blue-light">2 minutes</span>.
                        </h1>
                        <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed animate-intro-in-delay2">
                            Postez votre mission de travaux sur cordes : les cordistes certifiés de votre région vous répondent sous 48h.<br />
                            <span className="font-bold animate-color-pulse">
                                Directement, sans intermédiaire.
                            </span>
                        </p>
                    </div>
                )}

                {/* 3 cartes : channel picker (étape 1 + wizard pas encore choisi) */}
                {currentStep === 1 && !wizardActive && (
                    <ContactPathPicker
                        onWizardSelected={() => {
                            setWizardActive(true)
                            setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 50)
                        }}
                    />
                )}

                {/* Progress Bar + Step Content + Nav — masqués tant que le wizard n'est pas actif */}
                {wizardActive && (
                <>
                {/* Bouton retour vers les 3 cartes (uniquement à l'étape 1) */}
                {currentStep === 1 && (
                    <button
                        type="button"
                        onClick={() => setWizardActive(false)}
                        className="group inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold text-brand-blue bg-white border-2 border-brand-blue/20 hover:border-brand-blue hover:bg-brand-blue hover:text-white rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                        Choisir une autre méthode
                    </button>
                )}

                <div className="mb-8 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <motion.span
                            key={currentStep}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-bold text-slate-700"
                        >
                            {steps[currentStep - 1]?.title}
                        </motion.span>
                        <span className="text-xs text-slate-400 tabular-nums">
                            {currentStep} / {totalSteps}
                        </span>
                    </div>
                    <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-blue to-blue-400 rounded-full"
                            initial={false}
                            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
                        />
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
                </>
                )}
            </div>

            <ExitIntentModal
                isOpen={showExitIntent}
                onClose={() => setShowExitIntent(false)}
                onCapture={(email) => {
                    updateFormData({ contact_email: email });
                    fetch('/api/leads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, step_reached: currentStep, source: 'exit_intent' }),
                    }).catch(() => {});
                }}
            />
        </div>
    );
};
