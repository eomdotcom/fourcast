import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://flhcgjfyaxhvauxxusuz.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_oYTQs5GFTjexClhQMw3Ztw_4Ao2cZ0L'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)