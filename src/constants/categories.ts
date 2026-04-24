import type { JobCategory } from '../types';

/** Labels français pour les catégories de missions */
export const CATEGORY_LABELS: Record<JobCategory, string> = {
    cleaning: 'Nettoyage',
    construction: 'Construction',
    masonry: 'Maçonnerie',
    painting: 'Peinture',
    industry: 'Industrie',
    event: 'Événementiel',
    securing: 'Sécurisation',
    telecom: 'Télécommunications',
    inspection: 'Inspection',
    repair: 'Dépannage',
    pruning: 'Élagage & Végétaux',
    other: 'Autre',
};

/** Retourne le label français d'une catégorie ou la valeur brute en fallback */
export function getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category as JobCategory] || category;
}
