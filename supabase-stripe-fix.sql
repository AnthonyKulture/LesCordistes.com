-- 1. Nettoyer et réinitialiser la contrainte d'unicité sur 'credits'
ALTER TABLE public.credits DROP CONSTRAINT IF EXISTS credits_pro_id_unique;
ALTER TABLE public.credits ADD CONSTRAINT credits_pro_id_unique UNIQUE (pro_id);

-- 2. Créer ou mettre à jour la table des transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pro_id UUID REFERENCES auth.users(id),
    type TEXT CHECK (type IN ('purchase', 'spend', 'admin_adjustment', 'refund')),
    amount INTEGER NOT NULL,
    job_id UUID REFERENCES public.jobs(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS (Sécurité des accès)
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
CREATE POLICY "Users can view own credits" ON public.credits
    FOR SELECT USING (auth.uid() = pro_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = pro_id);
