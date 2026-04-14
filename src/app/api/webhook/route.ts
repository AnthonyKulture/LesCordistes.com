import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getPostHogClient } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2023-10-16' as any,
    })
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    try {
        // raw body — obligatoire pour la validation de signature Stripe
        const body = await req.text()
        const sig = req.headers.get('stripe-signature')

        if (!endpointSecret || !sig) {
            console.error('❌ Webhook Secret ou Signature manquante')
            return new NextResponse('Webhook Error: Missing secret or signature', { status: 400 })
        }

        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
        } catch (err: any) {
            console.error('❌ Webhook signature verification failed.', err.message)
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session
            console.log('🔔 Webhook reçu pour la session:', session.id)

            const userId = session.metadata?.userId
            const amountStr = session.metadata?.creditsAmount

            console.log('📋 Metadata extraites:', { userId, amountStr })

            if (userId && amountStr) {
                const amount = parseInt(amountStr, 10)

                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

                if (!supabaseUrl || !supabaseServiceKey) {
                    console.error('❌ Variables Supabase manquantes')
                    return new NextResponse('Configuration Error', { status: 500 })
                }

                const supabase = createClient(supabaseUrl, supabaseServiceKey)

                const { data: existingTx } = await supabase
                    .from('credit_transactions')
                    .select('id')
                    .eq('description', `Achat Stripe - Session ${session.id}`)
                    .maybeSingle()

                if (!existingTx) {
                    console.log("➕ Ajout de credits pour l'user:", userId)

                    const { data: currentCredits } = await supabase
                        .from('credits')
                        .select('balance')
                        .eq('pro_id', userId)
                        .maybeSingle()

                    const currentBalance = currentCredits?.balance || 0

                    const { error: upsertErr } = await supabase.from('credits').upsert(
                        { pro_id: userId, balance: currentBalance + amount, updated_at: new Date().toISOString() },
                        { onConflict: 'pro_id' }
                    )

                    if (upsertErr) {
                        console.error('❌ Erreur upsert crédits:', upsertErr)
                        throw upsertErr
                    }

                    const { error: txErr } = await supabase.from('credit_transactions').insert({
                        pro_id: userId,
                        type: 'purchase',
                        amount,
                        description: `Achat Stripe - Session ${session.id}`,
                    })

                    if (txErr) console.error('❌ Erreur insertion transaction:', txErr)

                    const phClient = getPostHogClient()
                    await phClient.captureImmediate({ distinctId: userId, event: 'credits_purchased', properties: { credits_amount: amount, stripe_session_id: session.id } })

                    console.log(`✅ ${amount} crédits ajoutés à l'utilisateur ${userId}`)
                } else {
                    console.log(`ℹ️ Session ${session.id} déjà traitée.`)
                }
            } else {
                console.warn('⚠️ userId ou amountStr manquants dans metadata')
            }
        }

        return NextResponse.json({ received: true })
    } catch (err: any) {
        console.error('🔥 Erreur critique Webhook:', err.message)
        return new NextResponse(`Webhook Process Error: ${err.message}`, { status: 500 })
    }
}
