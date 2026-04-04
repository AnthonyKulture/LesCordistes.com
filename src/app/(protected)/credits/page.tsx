import { Suspense } from 'react'
import { Credits } from '@/views/Credits'

export default function Page() {
    return (
        <Suspense>
            <Credits />
        </Suspense>
    )
}
