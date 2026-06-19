import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendWelcomeEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const type = searchParams.get('type');
    const next = searchParams.get('next') ?? '/home';

    if (code) {
      const supabase = createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (type !== 'recovery') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            const name = user.user_metadata?.full_name || 'there';
            // Fire welcome email in background — don't block the redirect if it fails
            sendWelcomeEmail(user.email, name).catch((e) =>
              logger.error('auth.callback.welcome-email-failed', { error: e })
            );
          }
        }
        if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
  } catch (error) {
    logger.error('auth.callback.failed', { error });
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
  }
}
