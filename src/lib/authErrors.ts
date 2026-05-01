// Centralised Supabase / network error → French translator.
//
// Two-step matching:
//   1. Match `error.code` (Supabase Auth v2.43+ stable codes)
//   2. Regex on `error.message` for older SDKs / non-auth errors
//   3. HTTP status fallback (rate limits)
//   4. Generic French fallback (no English ever leaks to users)

type AnyError = unknown;

const CODE_MAP: Record<string, string> = {
    // Credentials / sign-in
    invalid_credentials: 'Email ou mot de passe incorrect.',
    invalid_grant: 'Email ou mot de passe incorrect.',
    user_not_found: 'Aucun compte ne correspond à cet email.',
    email_not_confirmed: 'Email non confirmé. Vérifiez votre boîte de réception.',
    user_banned: 'Ce compte est suspendu. Contactez le support.',

    // Sign-up
    user_already_exists: 'Un compte existe déjà avec cet email. Connectez-vous.',
    email_exists: 'Un compte existe déjà avec cet email. Connectez-vous.',
    phone_exists: 'Ce numéro de téléphone est déjà utilisé.',
    signup_disabled: "Les inscriptions sont temporairement désactivées.",
    email_address_invalid: "Cette adresse email n'est pas valide.",
    email_address_not_authorized: "Cette adresse email n'est pas autorisée.",
    email_provider_disabled: "L'inscription par email est désactivée.",

    // Password — exigences Supabase :
    //   • 8 caractères minimum
    //   • au moins 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
    weak_password: 'Mot de passe trop faible. Il doit contenir au moins 8 caractères, avec une minuscule, une majuscule, un chiffre et un caractère spécial (!@#$…).',
    same_password: 'Le nouveau mot de passe doit être différent de l\'ancien.',

    // OTP / magic link
    otp_expired: 'Ce lien a expiré. Demandez-en un nouveau.',
    otp_disabled: 'Connexion par code à usage unique désactivée.',
    invalid_otp: 'Code invalide ou expiré.',

    // Session / JWT
    session_expired: 'Votre session a expiré. Reconnectez-vous.',
    session_not_found: 'Session introuvable. Reconnectez-vous.',
    bad_jwt: 'Session invalide. Reconnectez-vous.',
    reauthentication_needed: 'Veuillez vous reconnecter pour effectuer cette action.',
    no_authorization: 'Authentification requise.',
    not_admin: "Vous n'avez pas les droits requis.",

    // OAuth
    bad_oauth_callback: 'Échec de la connexion via Google. Réessayez.',
    bad_oauth_state: 'Échec de la connexion via Google. Réessayez.',
    oauth_provider_not_supported: 'Connexion via ce fournisseur indisponible.',
    flow_state_expired: 'Session de connexion expirée. Réessayez.',
    flow_state_not_found: 'Session de connexion expirée. Réessayez.',
    provider_disabled: 'Ce mode de connexion est désactivé.',
    provider_email_needs_verification: 'Vérifiez votre email avant de continuer.',

    // Captcha
    captcha_failed: 'Vérification anti-robot échouée. Réessayez.',

    // Rate limits
    over_email_send_rate_limit: 'Trop d\'emails envoyés. Patientez quelques minutes.',
    over_request_rate_limit: 'Trop de tentatives. Patientez quelques minutes.',
    over_sms_send_rate_limit: 'Trop de SMS envoyés. Patientez quelques minutes.',

    // Generic
    validation_failed: 'Certains champs sont invalides. Vérifiez le formulaire.',
    unexpected_failure: 'Une erreur inattendue est survenue. Réessayez.',
    request_timeout: 'La requête a expiré. Vérifiez votre connexion.',
};

const MESSAGE_PATTERNS: Array<[RegExp, string]> = [
    [/invalid login credentials/i, 'Email ou mot de passe incorrect.'],
    [/email not confirmed/i, 'Email non confirmé. Vérifiez votre boîte de réception.'],
    [/already (registered|exists)/i, 'Un compte existe déjà avec cet email. Connectez-vous.'],
    [/user already registered/i, 'Un compte existe déjà avec cet email. Connectez-vous.'],
    [/password should be at least/i, 'Le mot de passe doit contenir au moins 8 caractères.'],
    [/password should contain.*lower.*upper.*digit.*symbol/i, 'Mot de passe trop faible. Il doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial (!@#$…).'],
    [/password should contain.*lower/i, 'Mot de passe trop faible. Il manque une lettre minuscule.'],
    [/password should contain.*upper/i, 'Mot de passe trop faible. Il manque une lettre majuscule.'],
    [/password should contain.*digit|password should contain.*number/i, 'Mot de passe trop faible. Il manque un chiffre.'],
    [/password should contain.*symbol|password should contain.*special/i, 'Mot de passe trop faible. Il manque un caractère spécial (!@#$…).'],
    [/password is too weak/i, 'Mot de passe trop faible. Il doit contenir au moins 8 caractères, avec une minuscule, une majuscule, un chiffre et un caractère spécial (!@#$…).'],
    [/new password should be different/i, 'Le nouveau mot de passe doit être différent de l\'ancien.'],
    [/unable to validate email/i, "Cette adresse email n'est pas valide."],
    [/invalid email/i, "Cette adresse email n'est pas valide."],
    [/email rate limit/i, 'Trop d\'emails envoyés. Patientez quelques minutes.'],
    [/rate limit|too many requests/i, 'Trop de tentatives. Patientez quelques minutes.'],
    [/network|failed to fetch|networkerror/i, 'Connexion impossible. Vérifiez votre réseau.'],
    [/jwt expired|token has expired/i, 'Votre session a expiré. Reconnectez-vous.'],
    [/captcha/i, 'Vérification anti-robot échouée. Réessayez.'],
    [/user not found/i, 'Aucun compte ne correspond à cet email.'],
];

const STATUS_MAP: Record<number, string> = {
    401: 'Authentification requise.',
    403: "Vous n'avez pas les droits requis.",
    404: 'Ressource introuvable.',
    422: 'Certains champs sont invalides. Vérifiez le formulaire.',
    429: 'Trop de tentatives. Patientez quelques minutes.',
    500: 'Erreur serveur. Réessayez dans un instant.',
    503: 'Service temporairement indisponible. Réessayez.',
};

export function translateAuthError(err: AnyError, fallback = 'Une erreur est survenue. Réessayez.'): string {
    if (!err) return fallback;
    if (typeof err === 'string') {
        const match = MESSAGE_PATTERNS.find(([re]) => re.test(err));
        return match ? match[1] : err;
    }

    const e = err as { code?: string; status?: number; name?: string; message?: string };

    if (e.code && CODE_MAP[e.code]) return CODE_MAP[e.code];

    if (e.message) {
        const match = MESSAGE_PATTERNS.find(([re]) => re.test(e.message!));
        if (match) return match[1];
    }

    if (typeof e.status === 'number' && STATUS_MAP[e.status]) return STATUS_MAP[e.status];

    if (e.message && /^[\x20-\x7E]*$/.test(e.message) && /[a-z]/i.test(e.message)) {
        const looksEnglish = /\b(the|invalid|already|please|not|cannot|failed|error|with|for|too)\b/i.test(e.message);
        if (looksEnglish) return fallback;
        return e.message;
    }

    return fallback;
}
