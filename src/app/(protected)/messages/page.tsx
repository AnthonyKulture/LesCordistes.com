import { Suspense } from 'react'
import { MessagingPage } from '@/views/Messaging'

export default function Page() {
    return (
        <Suspense>
            <MessagingPage />
        </Suspense>
    )
}
