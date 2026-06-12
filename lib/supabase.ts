import { createServerClient, createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side client using cookie storage
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore cookie mutation errors if called from Server Components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore cookie mutation errors if called from Server Components
          }
        },
      },
    }
  );
}

// Client-side browser client. Note: Since we use the service role key on the server,
// the browser client is restricted to auth functions and does not expose service keys.
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    "placeholder-anon-key-if-needed"
  );
}
