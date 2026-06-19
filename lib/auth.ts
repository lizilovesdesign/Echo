import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from './supabase-server';

export interface UserSession {
  userId: string;
  email: string;
}

/**
 * Verifies the user session from either the HTTP Authorization header (Bearer token)
 * or Next.js HTTP-only cookies.
 */
export async function verifyAuthSession(req: NextRequest): Promise<UserSession | null> {
  try {
    // 1. Check Authorization Header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.substring(7).trim();
      const supabase = createServerSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return { userId: user.id, email: user.email || '' };
      }
    }

    // 2. Check HTTP-Only Cookie Session (used by Next.js Web companion app)
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!error && session && session.user) {
      return { userId: session.user.id, email: session.user.email || '' };
    }
  } catch (err) {
    // Suppress leak of auth session error
  }
  return null;
}

/**
 * Retrieves the web session parameters context.
 */
export async function getWebSession(): Promise<UserSession | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!error && session && session.user) {
      return { userId: session.user.id, email: session.user.email || '' };
    }
  } catch (err) {
    // Ignore session retrieval failures
  }
  return null;
}
