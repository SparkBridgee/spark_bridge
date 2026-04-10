// IMPORTANT: Use literal `process.env.FOO` access so Next.js / Turbopack
// statically inlines NEXT_PUBLIC_* values at build time.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!SUPABASE_ANON_KEY) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const publicEnv = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
};

// Server-only values. Do NOT import from client components.
export function getServerEnv() {
  const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
  if (!APIFY_API_TOKEN) {
    throw new Error("Missing required environment variable: APIFY_API_TOKEN");
  }
  return { APIFY_API_TOKEN };
}
