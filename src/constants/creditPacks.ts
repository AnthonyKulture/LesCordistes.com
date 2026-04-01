/** Source unique des packs de crédits — utilisée dans Credits.tsx et CreditWidget.tsx */
export const CREDIT_PACKS = [
    {
        id: 'pack_starter',
        credits: 3,
        price: 60,
        label: 'Starter',
        popular: false,
        description: 'Freelance ou phase de test',
        pricePerLead: '20€',
        discount: null,
    },
    {
        id: 'pack_pro',
        credits: 10,
        price: 150,
        label: 'Pro',
        popular: true,
        description: 'Utilisateur régulier',
        pricePerLead: '15€',
        discount: '-25%',
    },
    {
        id: 'pack_business',
        credits: 20,
        price: 280,
        label: 'Business',
        popular: false,
        description: 'Agence / Volume',
        pricePerLead: '14€',
        discount: '-30%',
    },
] as const;

export type CreditPack = (typeof CREDIT_PACKS)[number];
