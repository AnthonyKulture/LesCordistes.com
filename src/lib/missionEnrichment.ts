import type { Job } from '../types';
import { FRENCH_DEPARTMENTS } from '../constants/departments';

// ─── BUDGET FALLBACK ────────────────────────────────────────────────────────
// Indicative range when the client didn't fill any budget.
// Wide enough to be honest, useful enough to qualify the lead.

const INDICATIVE_BUDGET_BY_CATEGORY: Record<Job['category'], { min: number; max: number }> = {
    cleaning: { min: 500, max: 2000 },
    painting: { min: 800, max: 3000 },
    masonry: { min: 1000, max: 5000 },
    construction: { min: 1500, max: 6000 },
    industry: { min: 1500, max: 8000 },
    event: { min: 500, max: 3000 },
    securing: { min: 800, max: 3500 },
    telecom: { min: 1500, max: 6000 },
    inspection: { min: 400, max: 1500 },
    repair: { min: 200, max: 1500 },
    pruning: { min: 300, max: 2000 },
    other: { min: 500, max: 2500 },
};

export interface BudgetDisplay {
    min: number;
    max: number;
    label: string; // e.g. "1 000 – 5 000 €"
    isIndicative: boolean; // true when client didn't provide budget
    dailyRate?: number; // for renfort_pro
}

const fmtEuro = (n: number) => `${n.toLocaleString('fr-FR')} €`;

export function getBudgetDisplay(job: Job): BudgetDisplay | null {
    if (job.type === 'renfort_pro' && job.daily_rate) {
        return {
            min: job.daily_rate,
            max: job.daily_rate,
            label: `${job.daily_rate} € / jour HT`,
            isIndicative: false,
            dailyRate: job.daily_rate,
        };
    }

    const min = job.budget_min;
    const max = job.budget_max;

    if (min || max) {
        return {
            min: min ?? 0,
            max: max ?? min ?? 0,
            label: min && max
                ? `${fmtEuro(min)} – ${fmtEuro(max)}`
                : min
                    ? `À partir de ${fmtEuro(min)}`
                    : `Jusqu'à ${fmtEuro(max!)}`,
            isIndicative: false,
        };
    }

    const fallback = INDICATIVE_BUDGET_BY_CATEGORY[job.category] ?? INDICATIVE_BUDGET_BY_CATEGORY.other;
    return {
        min: fallback.min,
        max: fallback.max,
        label: `${fmtEuro(fallback.min)} – ${fmtEuro(fallback.max)}`,
        isIndicative: true,
    };
}

// ─── DEPARTMENT LABEL + DISTANCE ────────────────────────────────────────────
// Centroid (lat, lng) for each French department prefecture.
// Used to compute a coarse km distance between job and pro intervention zone.

const DEPT_CENTROID: Record<string, [number, number]> = {
    '01': [46.20, 5.22],  '02': [49.56, 3.62],  '03': [46.34, 3.43],  '04': [44.10, 6.24],
    '05': [44.56, 6.08],  '06': [43.93, 7.15],  '07': [44.74, 4.42],  '08': [49.62, 4.50],
    '09': [42.97, 1.47],  '10': [48.30, 4.07],  '11': [43.10, 2.40],  '12': [44.30, 2.55],
    '13': [43.53, 5.10],  '14': [49.18, -0.36], '15': [44.93, 2.45],  '16': [45.74, 0.30],
    '17': [45.75, -0.63], '18': [47.08, 2.40],  '19': [45.27, 1.77],  '21': [47.32, 4.83],
    '22': [48.51, -2.78], '23': [46.17, 1.87],  '24': [45.18, 0.72],  '25': [47.24, 6.02],
    '26': [44.73, 5.07],  '27': [49.02, 1.15],  '28': [48.45, 1.49],  '29': [48.28, -4.10],
    '2A': [41.92, 8.74],  '2B': [42.43, 9.20],  '30': [44.13, 4.35],  '31': [43.30, 1.40],
    '32': [43.65, 0.59],  '33': [44.84, -0.58], '34': [43.61, 3.88],  '35': [48.11, -1.68],
    '36': [46.81, 1.69],  '37': [47.39, 0.69],  '38': [45.18, 5.72],  '39': [46.67, 5.55],
    '40': [43.89, -0.50], '41': [47.59, 1.33],  '42': [45.43, 4.39],  '43': [45.04, 3.88],
    '44': [47.22, -1.55], '45': [47.90, 1.91],  '46': [44.45, 1.44],  '47': [44.20, 0.62],
    '48': [44.52, 3.50],  '49': [47.47, -0.55], '50': [49.11, -1.09], '51': [49.04, 4.04],
    '52': [48.11, 5.14],  '53': [48.07, -0.77], '54': [48.69, 6.18],  '55': [48.94, 5.16],
    '56': [47.74, -2.78], '57': [49.12, 6.18],  '58': [47.00, 3.16],  '59': [50.63, 3.06],
    '60': [49.43, 2.58],  '61': [48.43, 0.09],  '62': [50.42, 2.83],  '63': [45.78, 3.08],
    '64': [43.30, -0.37], '65': [43.23, 0.07],  '66': [42.69, 2.90],  '67': [48.58, 7.75],
    '68': [47.75, 7.34],  '69': [45.76, 4.83],  '70': [47.62, 6.16],  '71': [46.78, 4.85],
    '72': [47.99, 0.20],  '73': [45.57, 6.32],  '74': [45.90, 6.13],  '75': [48.85, 2.35],
    '76': [49.44, 1.10],  '77': [48.54, 2.95],  '78': [48.80, 2.13],  '79': [46.32, -0.46],
    '80': [49.89, 2.30],  '81': [43.92, 2.15],  '82': [44.02, 1.36],  '83': [43.46, 6.23],
    '84': [43.95, 4.81],  '85': [46.67, -1.43], '86': [46.58, 0.34],  '87': [45.83, 1.26],
    '88': [48.17, 6.45],  '89': [47.80, 3.57],  '90': [47.64, 6.86],  '91': [48.63, 2.43],
    '92': [48.84, 2.24],  '93': [48.91, 2.45],  '94': [48.78, 2.46],  '95': [49.03, 2.10],
    '971': [16.25, -61.55], '972': [14.64, -61.02], '973': [4.93, -52.33],
    '974': [-21.13, 55.53], '976': [-12.83, 45.17], '98': [43.73, 7.42],
};

const DEPT_LABEL = new Map(FRENCH_DEPARTMENTS.map(d => [d.code, d.label]));

export function getDepartmentLabel(code?: string | null): string | null {
    if (!code) return null;
    return DEPT_LABEL.get(code) ?? code;
}

function haversineKm(a: [number, number], b: [number, number]): number {
    const R = 6371;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

export interface ProximityInfo {
    inZone: boolean;       // job's dept is one of the pro's intervention zones
    nearestZone?: string;  // dept code of nearest pro zone
    distanceKm?: number;   // approx. km between job and nearest pro zone centroid
    label: string;         // "Dans votre zone" | "À ~85 km" | "Hors zone"
}

export function getProximityForPro(job: Job, proZones?: string[] | null): ProximityInfo | null {
    const jobDept = job.location_department;
    if (!jobDept || !proZones || proZones.length === 0) return null;

    if (proZones.includes(jobDept)) {
        return { inZone: true, label: 'Dans votre zone' };
    }

    const jobCoord: [number, number] | undefined =
        job.latitude && job.longitude ? [job.latitude, job.longitude] : DEPT_CENTROID[jobDept];
    if (!jobCoord) return { inZone: false, label: 'Hors zone' };

    let nearest: { code: string; km: number } | null = null;
    for (const zone of proZones) {
        const zc = DEPT_CENTROID[zone];
        if (!zc) continue;
        const km = haversineKm(jobCoord, zc);
        if (!nearest || km < nearest.km) nearest = { code: zone, km };
    }

    if (!nearest) return { inZone: false, label: 'Hors zone' };

    const rounded = nearest.km < 50 ? nearest.km : nearest.km < 200 ? Math.round(nearest.km / 5) * 5 : Math.round(nearest.km / 10) * 10;
    return {
        inZone: false,
        nearestZone: nearest.code,
        distanceKm: nearest.km,
        label: `À ~${rounded} km de votre zone`,
    };
}

// ─── START DATE DISPLAY ─────────────────────────────────────────────────────
// Renfort_pro carries start_date; standard missions carry deadline.
// When neither is set, surface a reassuring "à convenir" message.

export interface ScheduleDisplay {
    label: string;
    detail?: string;
    isFlexible: boolean;
}

export function getScheduleDisplay(job: Job): ScheduleDisplay {
    const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (job.start_date) {
        const days = Math.ceil((new Date(job.start_date).getTime() - Date.now()) / 86400000);
        let urgency = '';
        if (days <= 0) urgency = 'Démarrage imminent';
        else if (days <= 7) urgency = `Dans ${days} jour${days > 1 ? 's' : ''}`;
        else if (days <= 30) urgency = `Dans ${Math.ceil(days / 7)} semaines`;
        return {
            label: `Démarrage le ${fmt(job.start_date)}`,
            detail: urgency || undefined,
            isFlexible: false,
        };
    }
    if (job.deadline) {
        return {
            label: `À réaliser avant le ${fmt(job.deadline)}`,
            isFlexible: false,
        };
    }
    return {
        label: 'Démarrage flexible',
        detail: 'Date à convenir avec le client',
        isFlexible: true,
    };
}

// ─── CLIENT VERIFICATION ────────────────────────────────────────────────────
// A client is considered "verified" when it's a structured/B2B entity
// (syndic, copro, agency, company) rather than an individual.
// LesCordistes vérifie systématiquement ces leads avant publication.

const VERIFIED_CLIENT_TYPES: ReadonlyArray<NonNullable<Job['client_type']>> = [
    'copropriete_syndic',
    'entreprise_tertiaire',
    'industrie_energie',
    'collectivite_public',
    'association_evenementiel',
    'entreprise_travaux_hauteur',
    'entreprise_btp',
    'agence_interim',
    'autre_pro',
];

export function isClientVerified(job: Job): boolean {
    if (job.client_type && VERIFIED_CLIENT_TYPES.includes(job.client_type)) return true;
    // client_contact_info est révoqué pour anon/authenticated : la colonne dérivée
    // client_has_company porte l'information côté navigateur. Le JSONB reste lisible
    // via service_role (admin, crons), d'où le repli.
    if (job.client_has_company) return true;
    if (job.client_contact_info?.company_name) return true;
    return false;
}

// ─── LEAD QUALITY SCORE ─────────────────────────────────────────────────────
// Le score ne mesure QU'UNE chose : la richesse effective du brief, signal par
// signal, chacun lu sur la ligne `jobs` et donc vérifiable par le pro lui-même
// sur la fiche. Aucun point n'est offert au titre de la modération : une mission
// vide et une mission documentée ne peuvent pas afficher le même chiffre.
//
// Ce que le score N'EST PAS : une promesse de rentabilité du lead. Le libellé de
// chaque critère dit précisément ce qui a été constaté (« Brief détaillé »,
// « Budget annoncé ») et jamais ce qui aurait été fait en coulisses.
//
// Calcul : chaque signal pèse un poids relatif, le score est le ratio
// points obtenus / points évaluables, ramené sur 100. Un signal NON ÉVALUABLE
// dans le contexte d'appel (cf. coordonnées client, révoquées côté navigateur)
// sort des DEUX termes du ratio — il n'est ni supposé acquis, ni compté comme
// manquant. Un pro et un admin voient donc le même chiffre sur la même mission.
//
// Seuils de description — pourquoi 120 / 220 caractères :
//   · Le wizard n'exige que 20 caractères (Step3Details) : le plancher produit
//     ne garantit rien, c'est au score de faire la différence.
//   · < 120 : la fiche ne remplit même pas l'extrait de 120 caractères que la
//     page mission découpe pour sa meta description (`description.slice(0, 120)`
//     dans app/jobs/[slug]/page.tsx). Un texte plus court reformule le titre.
//   · ≥ 220 (~35 mots, 3 phrases) : le minimum pour répondre aux trois questions
//     qu'un cordiste pose avant de se déplacer — quel support, quel accès, quel
//     travail. Le score admin (computeLQS, seuil 80) était trop permissif : une
//     ligne de texte y valait déjà 20 points.

const DESCRIPTION_DETAILED = 220;
const DESCRIPTION_SUBSTANTIAL = 120;

// Paliers calibrés sur des cas réels : une mission avec budget, brief détaillé,
// une photo, une échéance et une adresse atteint 78 — c'est un bon lead, pas un
// lead exceptionnel : elle doit tomber en « Qualifié ». « Premium » exige en plus
// la géolocalisation ou un jeu de photos, soit un brief que le pro peut chiffrer
// sans rappeler le client.
const TIER_PREMIUM = 82;
const TIER_QUALIFIE = 50;

interface QualitySignal {
    earned: number;
    max: number;
    /** Affiché uniquement quand `earned > 0` — sinon rien n'est annoncé. */
    label?: string;
}

export interface LeadQuality {
    score: number;            // 0–100
    /**
     * Garde-fou : sous le palier « Qualifié », on montre le palier et les signaux
     * réels, jamais le chiffre. Un score bas dessert la mission sans rien apprendre
     * au pro que la liste de signaux ne dise déjà.
     */
    showScore: boolean;
    tier: 'premium' | 'qualifie' | 'verifie';
    label: string;            // short user-facing label
    color: string;            // tailwind color tokens
    bg: string;
    border: string;
    signals: string[];        // signaux réellement constatés (max 5)
    /** Mission saisie par l'équipe après un échange direct avec le client. */
    teamSourced: boolean;
}

export function getLeadQuality(job: Job): LeadQuality {
    // Restreint aux missions encore ouvertes : les 12 chantiers semés par
    // 20260501-seed-buzz-completed-missions.sql portent admin_created = TRUE et
    // s'affichent en « Missions déjà réalisées ». Sans ce filtre, des chantiers
    // fictifs afficheraient « Client contacté en direct ». admin_notes, qui
    // porterait le marqueur SEED, est volontairement hors des colonnes publiques.
    const teamSourced = job.admin_created === true && job.status === 'live';
    const signals: QualitySignal[] = [];

    const hasBudget = !!(job.budget_min || job.budget_max || job.daily_rate);
    signals.push({
        earned: hasBudget ? 22 : 0,
        max: 22,
        label: job.daily_rate ? 'Tarif journalier annoncé' : 'Budget annoncé',
    });

    const briefLength = job.description?.trim().length ?? 0;
    signals.push({
        earned: briefLength >= DESCRIPTION_DETAILED ? 22 : briefLength >= DESCRIPTION_SUBSTANTIAL ? 11 : 0,
        max: 22,
        label: briefLength >= DESCRIPTION_DETAILED ? 'Brief détaillé' : 'Brief renseigné',
    });

    const photos = job.photos_url?.length ?? 0;
    signals.push({
        earned: photos >= 3 ? 18 : photos >= 1 ? 11 : 0,
        max: 18,
        label: photos > 0 ? `${photos} photo${photos > 1 ? 's' : ''} du chantier` : undefined,
    });

    signals.push({
        earned: job.start_date || job.deadline ? 12 : 0,
        max: 12,
        label: job.start_date ? 'Date de démarrage fixée' : 'Échéance fixée',
    });

    const geolocated = !!(job.latitude && job.longitude);
    signals.push({
        earned: geolocated ? 12 : job.location_address ? 6 : 0,
        max: 12,
        label: geolocated ? 'Adresse géolocalisée' : 'Adresse renseignée',
    });

    const clientVerified = isClientVerified(job);
    signals.push({
        earned: clientVerified ? 10 : job.client_type ? 5 : 0,
        max: 10,
        label: clientVerified ? 'Client professionnel identifié' : 'Type de client renseigné',
    });

    signals.push({
        earned: job.height_meters ? 4 : 0,
        max: 4,
        label: job.height_meters ? `Hauteur précisée (${job.height_meters} m)` : undefined,
    });

    // Coordonnées client : `client_contact_info` est révoqué pour anon/authenticated
    // (migration 20260828b). Absent du navigateur → signal NON évaluable, retiré du
    // ratio plutôt que supposé acquis. Présent (service_role : admin, crons) → évalué.
    const contact = job.client_contact_info;
    if (contact) {
        const reachable = !!(contact.email && contact.phone);
        signals.push({
            earned: reachable ? 10 : 0,
            max: 10,
            label: reachable ? 'Coordonnées client complètes' : undefined,
        });
    }

    // Provenance : la mission a été saisie par l'équipe à partir d'une demande de
    // rappel, donc après un échange téléphonique réel avec le client. C'est un fait
    // porté par la ligne (`admin_created`), pas une faveur : il compte quand il est
    // vrai et sort du ratio quand il est faux — une mission postée par un client
    // n'est pas pénalisée de ne pas être passée par nous.
    if (teamSourced) {
        signals.push({ earned: 15, max: 15 });
    }

    const earned = signals.reduce((sum, s) => sum + s.earned, 0);
    const total = signals.reduce((sum, s) => sum + s.max, 0);
    const score = total > 0 ? Math.min(100, Math.round((earned / total) * 100)) : 0;

    let tier: LeadQuality['tier'];
    let label: string;
    let color: string;
    let bg: string;
    let border: string;

    if (score >= TIER_PREMIUM) {
        tier = 'premium';
        label = 'Lead Premium';
        color = 'text-emerald-700';
        bg = 'bg-emerald-50';
        border = 'border-emerald-200';
    } else if (score >= TIER_QUALIFIE) {
        tier = 'qualifie';
        label = 'Lead Qualifié';
        color = 'text-green-700';
        bg = 'bg-green-50';
        border = 'border-green-200';
    } else {
        tier = 'verifie';
        label = 'Brief à compléter';
        color = 'text-blue-700';
        bg = 'bg-blue-50';
        border = 'border-blue-200';
    }

    // Les trois mentions de provenance ne sont vraies que d'une mission saisie par
    // l'équipe après un échange direct. Jamais sur une mission postée par un client :
    // personne ne l'a appelé, personne n'a réécrit son brief.
    const provenance = teamSourced
        ? ['Vérifié par notre équipe', 'Client contacté en direct', 'Brief enrichi manuellement']
        : [];

    const observed = signals
        .filter(s => s.earned > 0 && s.label)
        .map(s => s.label as string);

    return {
        score,
        showScore: score >= TIER_QUALIFIE,
        tier,
        label,
        color,
        bg,
        border,
        signals: [...provenance, ...observed].slice(0, 5),
        teamSourced,
    };
}

// ─── FRESHNESS BADGE ────────────────────────────────────────────────────────
// Replaces the "Posté il y a Xj" counter on the public listing.
// Only 2 positive states surfaced; missions in the 8–15 days dead zone get no
// age badge (neutral). Beyond J+15 the cron flips status='expired' and they
// disappear from /jobs entirely.

export interface FreshnessBadge {
    label: string;
    className: string;
}

const DAY_MS = 86_400_000;

export function getFreshnessBadge(
    job: Pick<Job, 'created_at' | 'last_validated_at'>
): FreshnessBadge | null {
    const now = Date.now();
    const created = new Date(job.created_at).getTime();

    if (Number.isFinite(created) && now - created < 14 * DAY_MS) {
        return {
            label: 'Nouveau',
            className:
                'text-white border border-brand-blue-light/30 shadow-sm bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-blue animate-gradient-shift',
        };
    }

    if (job.last_validated_at) {
        const validated = new Date(job.last_validated_at).getTime();
        if (Number.isFinite(validated) && now - validated < 5 * DAY_MS) {
            return {
                label: '✓ Mission relancée',
                className: 'bg-blue-50 text-blue-700 border border-blue-200',
            };
        }
    }

    return null;
}
