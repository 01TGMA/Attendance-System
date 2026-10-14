// Supabase client initialization
// 1. Get these values from Project Settings > API in your Supabase dashboard
// 2. NEVER put your service_role key here — anon/public key only
// 3. This file is NOT wired into any page yet — Phase 1 pages currently run on
//    js/lib/store.js mock data. See README.md "Wiring Supabase in" for next steps.



const SUPABASE_URL = 'Your Supabase URL here';
const SUPABASE_ANON_KEY = 'Your Supabase ANON KEY here';
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    