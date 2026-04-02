import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as any,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { packId, userId, amount, stripePriceId, email } = req.body;

        if (!packId || !userId || !stripePriceId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Generate full URL dynamically
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const DOMAIN = `${protocol}://${host}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email, // Pre-fill email
            line_items: [
                {
                    price: stripePriceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}/credits?canceled=true`,
            metadata: {
                userId: userId,
                creditsAmount: amount.toString(),
            },
            client_reference_id: userId,
        });

        res.status(200).json({ url: session.url });
    } catch (err: any) {
        console.error('Error creating checkout session:', err);
        res.status(500).json({ statusCode: 500, message: err.message });
    }
}
