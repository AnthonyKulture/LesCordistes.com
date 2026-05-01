// Politique mot de passe alignée sur la config Supabase Auth :
//   • 8 caractères minimum
//   • au moins 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
//
// On valide côté client AVANT le signUp pour donner un feedback immédiat
// et éviter un round-trip Supabase qui retourne juste "weak password".

export const PASSWORD_RULES = {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigit: true,
    requireSpecial: true,
} as const

/**
 * Indication courte et concrète à afficher sous le champ mot de passe.
 */
export const PASSWORD_HINT =
    '8 caractères minimum, avec une minuscule, une majuscule, un chiffre et un caractère spécial (!@#$…).'

/**
 * Valide un mot de passe selon la politique. Retourne `null` si OK,
 * sinon un message clair sur ce qui manque.
 */
export function validatePassword(password: string): string | null {
    if (password.length < PASSWORD_RULES.minLength) {
        return `Le mot de passe doit contenir au moins ${PASSWORD_RULES.minLength} caractères.`
    }

    const missing: string[] = []
    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) missing.push('une minuscule')
    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) missing.push('une majuscule')
    if (PASSWORD_RULES.requireDigit && !/\d/.test(password)) missing.push('un chiffre')
    if (PASSWORD_RULES.requireSpecial && !/[^A-Za-z0-9]/.test(password)) missing.push('un caractère spécial (!@#$…)')

    if (missing.length === 0) return null

    if (missing.length === 1) {
        return `Mot de passe trop faible. Il manque ${missing[0]}.`
    }
    const last = missing.pop()
    return `Mot de passe trop faible. Il manque ${missing.join(', ')} et ${last}.`
}
