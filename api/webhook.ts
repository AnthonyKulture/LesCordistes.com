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

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        let event;
        try {
            event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the checkount.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const amountStr = session.metadata?.creditsAmount;
            
            if (userId && amountStr) {
                const amount = parseInt(amountStr, 10);
                
                // Init Supabase with service role key to bypass RLS
                const supabaseUrl = process.env.VITE_SUPABASE_URL;
                const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                
                if (!supabaseUrl || !supabaseServiceKey) {
                    console.error('Missing Supabase env vars');
                    return res.status(500).send('Internal Server Error');
                }

                const supabase = createClient(supabaseUrl, supabaseServiceKey);
                
                // Check if transaction was already processed
                const transactionId = `stripe_${event.id}`;
                const { data: existingTx } = await supabase
                    .from('credit_transactions')
                    .select('id')
                    .eq('id', transactionId)
                    .single();
                    
                if (!existingTx) {
                    // Update user's credit balance
                    const { data: currentCredits, error: fetchErr } = await supabase
                        .from('credits')
                        .select('balance')
                        .eq('pro_id', userId)
                        .single();
                        
                    const currentBalance = currentCredits?.balance || 0;
                    
                    await supabase.from('credits').upsert({
                        pro_id: userId,
                        balance: currentBalance + amount,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'pro_id' });
                    
                    // Insert transaction record
                    await supabase.from('credit_transactions').insert({
                        id: transactionId,
                        pro_id: userId,
                        type: 'purchase',
                        amount: amount,
                        description: `Achat Stripe - Session ${session.id}`,
                    });
                    
                    console.log(`Successfully credited ${amount} to user ${userId}`);
                } else {
                    console.log(`Transaction ${transactionId} already processed.`);
                }
            }
        }

        res.status(200).json({ received: true });
    } catch (err: any) {
        console.error('Webhook error:', err);
        res.status(500).send('Webhook Process Error');
    }
}
