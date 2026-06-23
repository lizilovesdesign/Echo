import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { sendPasswordResetEmail } from '@/lib/email';
import { isRateLimited } from '@/lib/rate-limit';
import { checkCsrfOrigin } from '@/lib/csrf';
import { logger } from '@/lib/logger';

const resetSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const csrf = checkCsrfOrigin(request);
  if (!csrf.valid) return csrf.response!;

  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(`reset-pw:${ip}`, { limit: 3, windowMs: 60 * 1000 })) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please wait a minute.' },
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid email address.' } },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  try {
    const supabase = createAdminSupabaseClient();
    const redirectTo = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/auth/callback`;

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (error) {
      logger.error('auth.reset-password.generate_link_failed', { email, error });
      return NextResponse.json(
        { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate reset link.' } },
        { status: 500 }
      );
    }

    const resetLink = data.properties?.action_link;
    if (!resetLink) {
      logger.error('auth.reset-password.no_link', { email });
      return NextResponse.json(
        { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate reset link.' } },
        { status: 500 }
      );
    }

    await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({
      ok: true,
      data: { message: 'If an account with that email exists, a reset link has been sent.' },
    });
  } catch (error) {
    logger.error('auth.reset-password.failed', { email, error });
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to send reset email.' } },
      { status: 500 }
    );
  }
}
