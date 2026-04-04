import { Suspense } from 'react'
import { PaymentSuccess } from '@/views/PaymentSuccess'

export default function Page() {
    return (
        <Suspense>
            <PaymentSuccess />
        </Suspense>
    )
}
