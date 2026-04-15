'use client'

import { Suspense } from 'react'
import { ProfileSetup } from '@/views/ProfileSetup'

export default function ProfileSetupPage() {
    return (
        <Suspense>
            <ProfileSetup />
        </Suspense>
    )
}
