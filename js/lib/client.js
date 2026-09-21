// Supabase client initialization
// 1. Get these values from Project Settings > API in your Supabase dashboard
// 2. NEVER put your service_role key here — anon/public key only
// 3. This file is NOT wired into any page yet — Phase 1 pages currently run on
//    js/lib/store.js mock data. See README.md "Wiring Supabase in" for next steps.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://dmlipuknpnxhhkgfidzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbGlwdWtucG54aGhrZ2ZpZHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTA5NzAsImV4cCI6MjEwNDgyNjk3MH0.qaMdhM6Kyw1-fBU1LBm6dPHYWLcP097JD6Joe9XCMb4';
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
