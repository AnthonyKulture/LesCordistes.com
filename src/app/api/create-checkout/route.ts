import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2023-10-16' as any,
    })

    try {
        const { packId, userId, amount, stripePriceId, email } = await req.json()

        if (!packId || !userId || !stripePriceId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
        const DOMAIN = `${protocol}://${host}`

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            billing_address_collection: 'required',
            tax_id_collection: { enabled: true },
            line_items: [{ price: stripePriceId, quantity: 1 }],
            mode: 'payment',
            invoice_creation: { enabled: true },
            success_url: `${DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}/credits?canceled=true`,
            metadata: {
                userId,
                creditsAmount: amount.toString(),
            },
            client_reference_id: userId,
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('Error creating checkout session:', err)
        return NextResponse.json({ statusCode: 500, message: err.message }, { status: 500 })
    }
}
