import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';
import { verifyAuthSession } from '@/lib/auth';
import { checkCsrfOrigin } from '@/lib/csrf';
import { logger } from '@/lib/logger';

const bodySchema = z.object({
  name: z.string().min(1).max(100).default('there'),
});

export async function POST(req: NextRequest) {
  const csrf = checkCsrfOrigin(req);
  if (!csrf.valid) {
    logger.warn('csrf.blocked', { path: '/api/auth/after-signup', method: 'POST' });
    return csrf.response;
  }

  try {
    const session = await verifyAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    const name = parsed.success ? parsed.data.name : 'there';

    await sendWelcomeEmail(session.email, name);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('api.auth.after-signup.failed', { error });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Failed to send welcome email.' } },
      { status: 500 }
    );
  }
}
