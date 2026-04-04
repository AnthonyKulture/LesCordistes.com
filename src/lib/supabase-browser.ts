import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createSupabaseBrowserClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Helper: upload job photo
export async function uploadJobPhoto(file: File, jobId: string): Promise<string | null> {
    const supabase = createSupabaseBrowserClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${jobId}/${Math.random()}.${fileExt}`

    const { error } = await supabase.storage
        .from('job-photos')
        .upload(fileName, file)

    if (error) {
        console.error('Error uploading file:', error)
        return null
    }

    const { data } = supabase.storage.from('job-photos').getPublicUrl(fileName)
    return data.publicUrl
}
