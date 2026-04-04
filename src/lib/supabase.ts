import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '' || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Log warning if using placeholder values
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || '' || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') {
    console.warn('⚠️ Supabase environment variables not configured. Using placeholder values. Please create .env.local with your Supabase credentials.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
        },
    },
});


// Helper function to upload job photos
export async function uploadJobPhoto(file: File, jobId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${jobId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
        .from('job-photos')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading file:', error);
        return null;
    }

    const { data } = supabase.storage
        .from('job-photos')
        .getPublicUrl(filePath);

    return data.publicUrl;
}


// Helper function to get current user profile
export async function getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile;
}
