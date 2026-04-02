import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

// Disable body parsing by Vercel to allow raw body for Stripe signature validation
export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as any,
});

export default async function handler(req: any, res: any) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        if (!endpointSecret || !sig) {
            console.error('❌ Webhook Secret ou Signature manquante');
            return res.status(400).send('Webhook Error: Missing secret or signature');
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
        } catch (err: any) {
            console.error(`❌ Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('🔔 Webhook reçu pour la session:', session.id);
            
            const userId = session.metadata?.userId;
            const amountStr = session.metadata?.creditsAmount;
            
            console.log('📋 Metadata extraites:', { userId, amountStr });

            if (userId && amountStr) {
                const amount = parseInt(amountStr, 10);
                
                // On essaie les deux variantes de noms de variables (Vercel vs Local)
                const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
                const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                
                if (!supabaseUrl || !supabaseServiceKey) {
                    console.error('❌ Erreur : Variables Supabase manquantes dans Vercel.');
                    return res.status(500).send('Configuration Error');
                }

                const supabase = createClient(supabaseUrl, supabaseServiceKey);
                
                const { data: existingTx } = await supabase
                    .from('credit_transactions')
                    .select('id')
                    .eq('description', `Achat Stripe - Session ${session.id}`)
                    .maybeSingle();
                    
                if (!existingTx) {
                    console.log('➕ Ajout de credits pour l\'user:', userId);
                    
                    const { data: currentCredits } = await supabase
                        .from('credits')
                        .select('balance')
                        .eq('pro_id', userId)
                        .maybeSingle();
                        
                    const currentBalance = currentCredits?.balance || 0;
                    
                    const { error: upsertErr } = await supabase.from('credits').upsert({
                        pro_id: userId,
                        balance: currentBalance + amount,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'pro_id' });

                    if (upsertErr) {
                        console.error('❌ Erreur lors de l\'upsert des crédits:', upsertErr);
                        throw upsertErr;
                    }
                    
                    // On laisse Supabase générer le UUID automatiquement
                    const { error: txErr } = await supabase.from('credit_transactions').insert({
                        pro_id: userId,
                        type: 'purchase',
                        amount: amount,
                        description: `Achat Stripe - Session ${session.id}`,
                    });

                    if (txErr) {
                        console.error('❌ Erreur lors de l\'insertion de la transaction:', txErr);
                    }
                    
                    console.log(`✅ Succès : ${amount} crédits ajoutés à l'utilisateur ${userId}`);
                } else {
                    console.log(`ℹ️ Session ${session.id} déjà traitée.`);
                }
            } else {
                console.warn('⚠️ Webhook reçu mais userId ou amountStr manquants dans metadata');
            }
        }

        res.status(200).json({ received: true });
    } catch (err: any) {
        console.error('🔥 Erreur critique Webhook:', err.message);
        res.status(500).send(`Webhook Process Error: ${err.message}`);
    }
}
