import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
        const { formData } = await req.json()

        if (!formData?.contact_email) {
            return NextResponse.json({ error: 'contact_email required' }, { status: 400 })
        }

        const admin = createSupabaseAdminClient()

        const jobId = crypto.randomUUID()
        const slugBase = `${formData.title || 'mission'}-${formData.location_city || ''}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        const slug = `${slugBase}-${jobId.split('-')[0]}`

        const { error } = await (admin as any).from('jobs').insert({
            id: jobId,
            slug,
            title: formData.title || '',
            description: formData.description || '',
            category: formData.category || 'other',
            type: formData.type || 'standard',
            client_type: formData.client_type || null,
            location_city: formData.location_city || '',
            location_address: formData.location_address || null,
            location_department: formData.location_department || null,
            latitude: formData.latitude || null,
            longitude: formData.longitude || null,
            height_meters: formData.height_meters || null,
            budget_min: formData.budget_min || null,
            budget_max: formData.budget_max || null,
            deadline: formData.deadline || null,
            status: 'draft',
            created_by: null,
            client_contact_info: {
                first_name: formData.contact_first_name || '',
                last_name: formData.contact_last_name || '',
                name: [formData.contact_first_name, formData.contact_last_name].filter(Boolean).join(' '),
                email: formData.contact_email,
                phone: formData.contact_phone || '',
                ...(formData.contact_company_name && !formData.is_auto_entrepreneur
                    ? { company_name: formData.contact_company_name }
                    : {}),
            },
            internal_reference: formData.internal_reference || null,
            structure_type: formData.structure_type || null,
            required_level: formData.required_level || null,
            required_habilitations: formData.required_habilitations || null,
            secondary_trades: formData.secondary_trades || null,
            equipment_management: formData.equipment_management || null,
            specific_equipment: formData.specific_equipment || null,
            start_date: formData.start_date || null,
            duration_days: formData.duration_days || null,
            work_night_weekend: formData.work_night_weekend ?? null,
            contract_type: formData.contract_type || null,
            daily_rate: formData.daily_rate || null,
            security_plan_confirmed: formData.security_plan_confirmed ?? null,
        })

        if (error) {
            console.error('Draft insert error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ id: jobId })
    } catch (err: any) {
        console.error('job-draft POST error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const { draftId, jobData } = await req.json()

        if (!draftId) {
            return NextResponse.json({ error: 'draftId required' }, { status: 400 })
        }

        const admin = createSupabaseAdminClient()

        const { data: draft, error: fetchError } = await (admin as any)
            .from('jobs')
            .select('client_contact_info, status')
            .eq('id', draftId)
            .single()

        if (fetchError || !draft || draft.status !== 'draft') {
            return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 })
        }

        const draftEmail = (draft.client_contact_info as any)?.email
        if (draftEmail && draftEmail !== user.email) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
        }

        const { id: _id, ...updateFields } = jobData

        const { error } = await (admin as any)
            .from('jobs')
            .update({
                ...updateFields,
                status: 'pending',
                created_by: user.id,
            })
            .eq('id', draftId)

        if (error) {
            console.error('Draft publish error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ id: draftId })
    } catch (err: any) {
        console.error('job-draft PATCH error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
