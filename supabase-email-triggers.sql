-- ============================================================
-- LesCordistes — Déclencheurs Emails (Webhooks SQL)
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. S'assurer que les extensions et schémas nécessaires sont activés
CREATE SCHEMA IF NOT EXISTS private;
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Fonction générique pour appeler l'Edge Function d'envoi d'email
CREATE OR REPLACE FUNCTION private.invoke_send_email(
    p_to TEXT,
    p_subject TEXT,
    p_template_id TEXT,
    p_data JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_url TEXT;
    v_anon_key TEXT;
BEGIN
    v_url := 'https://esvnvxkbnhvxpnlhyjsw.supabase.co/functions/v1/send-email';
    -- Clé anon publique (déjà exposée dans le bundle frontend — pas sensible)
    v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdm52eGtibmh2eHBubGh5anN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDQ3MjEsImV4cCI6MjA4ODg4MDcyMX0.8P53xQ3pnGud3-TuZQ-5Pnpv-29PW_pfkAvJuCfDOKs';

    PERFORM net.http_post(
        url := v_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || v_anon_key,
            'apikey', v_anon_key
        ),
        body := jsonb_build_object(
            'to', p_to,
            'subject', p_subject,
            'templateId', p_template_id,
            'data', p_data
        )
    );
END;
$$;

-- ------------------------------------------------------------
-- 🎨 TRIGGER 1 : Nouveau Profil
-- Alerte Admin + Welcome email si full_name déjà renseigné à l'INSERT
-- (flow password : handle_new_user insère full_name directement)
-- Pour les flux OTP/Google, le welcome email est envoyé sur UPDATE (TRIGGER 1b).
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.trigger_on_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Alerte Admin
    PERFORM private.invoke_send_email(
        'anthony@lescordistes.com',
        'Nouveau Profil : ' || NEW.role,
        'admin-alert',
        jsonb_build_object(
            'title', 'Nouvelle inscription ' || NEW.role,
            'message', 'Un nouvel utilisateur s''est inscrit : ' || NEW.email || ' (' || COALESCE(NEW.full_name, 'Sans nom') || ')',
            'link', 'https://lescordistes.com/admin/users',
            'linkText', 'Gérer les utilisateurs'
        )
    );

    -- Welcome email si full_name déjà présent (inscription email+password)
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
        IF NEW.role = 'client' THEN
            PERFORM private.invoke_send_email(
                NEW.email,
                'Bienvenue sur LesCordistes.com !',
                'welcome-client',
                jsonb_build_object('name', split_part(NEW.full_name, ' ', 1))
            );
        ELSIF NEW.role = 'pro' THEN
            PERFORM private.invoke_send_email(
                NEW.email,
                'Votre profil pro est actif — LesCordistes.com',
                'welcome-pro',
                jsonb_build_object('name', split_part(NEW.full_name, ' ', 1))
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_profile_created ON profiles;
CREATE TRIGGER on_new_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_new_profile();

-- ------------------------------------------------------------
-- 🎨 TRIGGER 1b : Welcome Email — envoyé quand full_name est
-- renseigné pour la première fois (après confirmation OTP ou OAuth).
-- Garantit que l'email reflète le rôle définitif.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.trigger_on_profile_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Ne s'exécute que lors du premier renseignement de full_name
    -- Gère NULL (Google OAuth) et '' (handle_new_user sans metadata name)
    IF (OLD.full_name IS NULL OR OLD.full_name = '') AND NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
        IF NEW.role = 'client' THEN
            PERFORM private.invoke_send_email(
                NEW.email,
                'Bienvenue sur LesCordistes.com !',
                'welcome-client',
                jsonb_build_object('name', NEW.full_name)
            );
        ELSIF NEW.role = 'pro' THEN
            PERFORM private.invoke_send_email(
                NEW.email,
                'Bienvenue sur LesCordistes.com !',
                'welcome-pro',
                jsonb_build_object('name', NEW.full_name)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_welcome ON profiles;
CREATE TRIGGER on_profile_welcome
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_profile_welcome();

-- ------------------------------------------------------------
-- Patch handle_new_user : lire le rôle depuis les métadonnées
-- (OTP signInWithOtp avec data.role, ex: Step5Contact)
-- À exécuter une seule fois.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'pro')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------
-- 🎨 TRIGGER 2 : Nouvelle Mission (Modération & Alerte Admin)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.trigger_on_new_job()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Skip si la mission est créée par l'admin lui-même (suite à un appel/mail
    -- client confirmé) → l'admin sait déjà qu'elle existe, pas besoin d'email.
    IF NEW.admin_created = true THEN
        RETURN NEW;
    END IF;

    -- 1. Email Admin pour modération
    PERFORM private.invoke_send_email(
        'anthony@lescordistes.com',
        '⚖️ Modération requise : ' || NEW.title,
        'admin-alert',
        jsonb_build_object(
            'title', 'Nouvelle mission postée',
            'message', 'La mission « ' || NEW.title || ' » à ' || NEW.location_city || ' attend votre validation.',
            'link', 'https://lescordistes.com/admin/jobs',
            'linkText', 'Accéder à la modération'
        )
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_job_posted ON jobs;
CREATE TRIGGER on_new_job_posted
    AFTER INSERT ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_new_job();


-- ------------------------------------------------------------
-- 🎨 TRIGGER 3 : Statut Mission (Approuvée / Rejetée)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.trigger_on_job_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_email TEXT;
    v_client_name TEXT;
BEGIN
    -- On ne déclenche que si le statut change vers 'live' ou 'rejected'
    IF (OLD.status = 'pending') AND (NEW.status IN ('live', 'rejected')) THEN
        -- Récupérer les infos du client (compte existant)
        IF NEW.created_by IS NOT NULL THEN
            SELECT email, full_name INTO v_client_email, v_client_name
            FROM profiles WHERE id = NEW.created_by;
        END IF;

        -- Fallback invité : email stocké dans client_contact_info
        IF v_client_email IS NULL THEN
            v_client_email := NEW.client_contact_info->>'email';
            v_client_name := COALESCE(
                NEW.client_contact_info->>'name',
                NEW.client_contact_info->>'first_name'
            );
        END IF;

        IF v_client_email IS NOT NULL THEN
            PERFORM private.invoke_send_email(
                v_client_email,
                CASE WHEN NEW.status = 'live' THEN '✅ Mission publiée !' ELSE '❌ Mission refusée' END,
                'job-status',
                jsonb_build_object(
                    'name', COALESCE(v_client_name, 'Client'),
                    'jobTitle', NEW.title,
                    'status', NEW.status,
                    'rejectionReason', NEW.rejection_reason
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_job_moderated ON jobs;
CREATE TRIGGER on_job_moderated
    AFTER UPDATE OF status ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_job_moderation();

-- ------------------------------------------------------------
-- 🎨 TRIGGER 4 : Lead Débloqué (Notification Client & Admin)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.trigger_on_lead_unlocked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_email TEXT;
    v_client_name TEXT;
    v_pro_name TEXT;
    v_job_title TEXT;
BEGIN
    -- 1. Récupérer les infos du Client et du Job
    SELECT j.title, p.email, p.full_name INTO v_job_title, v_client_email, v_client_name
    FROM jobs j
    JOIN profiles p ON p.id = j.created_by
    WHERE j.id = NEW.job_id;

    -- 2. Récupérer les infos du Pro
    SELECT full_name INTO v_pro_name
    FROM profiles WHERE id = NEW.pro_id;

    -- 3. Email au Client
    IF v_client_email IS NOT NULL THEN
        PERFORM private.invoke_send_email(
            v_client_email,
            '⚡ Un professionnel est intéressé !',
            'admin-alert', -- Utilisation du template générique pour l'instant
            jsonb_build_object(
                'title', 'Nouveau contact sur votre mission',
                'message', (COALESCE(v_pro_name, 'Un professionnel') || ' a débloqué vos coordonnées pour votre mission « ' || v_job_title || ' ». Il devrait vous contacter prochainement.'),
                'link', 'https://lescordistes.com/dashboard/client',
                'linkText', 'Gérer mes contacts'
            )
        );
    END IF;

    -- 4. Email à l'Admin
    PERFORM private.invoke_send_email(
        'anthony@lescordistes.com',
        '💰 Lead Débloqué : ' || v_job_title,
        'admin-alert',
        jsonb_build_object(
            'title', 'Nouveau lead débloqué',
            'message', 'Le pro ' || COALESCE(v_pro_name, 'ID:' || NEW.pro_id) || ' a débloqué la mission « ' || v_job_title || ' ».',
            'link', 'https://lescordistes.com/admin/transactions',
            'linkText', 'Voir l''historique'
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_lead_unlocked_email ON unlocked_leads;
CREATE TRIGGER on_lead_unlocked_email
    AFTER INSERT ON unlocked_leads
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_lead_unlocked();

-- ------------------------------------------------------------
-- 🎨 TRIGGER 5 : Alerte Match Mission (Localisation / Dept)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.trigger_on_job_live_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pro RECORD;
BEGIN
    -- On ne déclenche que si la mission passe à 'live'
    IF (OLD.status = 'pending') AND (NEW.status = 'live') THEN
        -- Rechercher tous les Pros dont le département de la mission est dans les zones d'intervention
        -- et qui ont accepté de recevoir des notifications (si on ajoute un flag plus tard)
        FOR v_pro IN 
            SELECT email, full_name, id 
            FROM profiles 
            WHERE role = 'pro' 
            AND (NEW.location_department = ANY(intervention_zones))
        LOOP
            PERFORM private.invoke_send_email(
                v_pro.email,
                '🔔 Nouvelle mission à ' || NEW.location_city || ' : ' || NEW.title,
                'match-job',
                jsonb_build_object(
                    'proName', COALESCE(v_pro.full_name, 'Pro'),
                    'jobTitle', NEW.title,
                    'location', NEW.location_city,
                    'jobSlug', COALESCE(NEW.slug, NEW.id::text),
                    'isRenfort', (NEW.type = 'renfort_pro')
                )
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_job_live_match_email ON jobs;
CREATE TRIGGER on_job_live_match_email
    AFTER UPDATE OF status ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION private.trigger_on_job_live_match();
