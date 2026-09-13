// Supabase client initialization
// 1. Get these values from Project Settings > API in your Supabase dashboard
// 2. NEVER put your service_role key here — anon/public key only
// 3. This file is NOT wired into any page yet — Phase 1 pages currently run on
//    js/lib/store.js mock data. See README.md "Wiring Supabase in" for next steps.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
