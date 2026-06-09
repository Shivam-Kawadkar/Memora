// True only when both Supabase env vars are present.
// Until you paste your keys, the app stays in demo mode (no real auth).
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
