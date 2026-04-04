// Compatibility shim — wraps createSupabaseBrowserClient for legacy imports
// All files doing `import { supabase } from '../lib/supabase'` get a PKCE-aware client
import { createSupabaseBrowserClient, uploadJobPhoto } from './supabase-browser'

export { uploadJobPhoto }

// Call createSupabaseBrowserClient() each time — @supabase/ssr handles deduplication internally
export const supabase = createSupabaseBrowserClient()

export async function getCurrentUserProfile() {
    const client = createSupabaseBrowserClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null
    const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    return profile
}
