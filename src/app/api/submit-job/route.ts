import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
        const { jobData } = await req.json()

        if (!jobData?.id) {
            return NextResponse.json({ error: 'jobData.id required' }, { status: 400 })
        }

        const admin = createSupabaseAdminClient()

        const { error } = await (admin as any).from('jobs').insert({
            ...jobData,
            status: 'pending',
            created_by: null,
        })

        if (error) {
            console.error('Guest submit error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ id: jobData.id })
    } catch (err: any) {
        console.error('submit-job POST error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
