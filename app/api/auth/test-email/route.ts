import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { env } from '@/lib/env';
import { verifyAuthSession } from '@/lib/auth';
import { checkCsrfOrigin } from '@/lib/csrf';
import { isRateLimited } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const bodySchema = z.object({
  to: z.string().email().optional(),
});

function createTransport(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function POST(req: NextRequest) {
  const csrf = checkCsrfOrigin(req);
  if (!csrf.valid) {
    logger.warn('csrf.blocked', { path: '/api/auth/test-email', method: 'POST' });
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

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (isRateLimited(`test-email:${ip}`, { limit: 3, windowMs: 60_000 })) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again in a minute.' } },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    const to = parsed.success && parsed.data.to ? parsed.data.to : session.email;

    const transport = createTransport();
    await transport.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: 'Echo — Test Email',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0a0a0a; color: #e4e4e7; border-radius: 12px;">
          <h1 style="font-size: 24px; margin: 0 0 8px;">Echo</h1>
          <p style="color: #a1a1aa; margin: 0 0 24px;">Your SMTP configuration is working.</p>
          <hr style="border: none; border-top: 1px solid #27272a;" />
          <p style="color: #71717a; font-size: 13px; margin-top: 24px;">
            Sent from <strong>${env.SMTP_HOST}</strong> on port <strong>${env.SMTP_PORT}</strong>
          </p>
        </div>
      `,
    });

    logger.info('email.test.sent', { to });
    return NextResponse.json({ ok: true, data: { to } });
  } catch (error) {
    logger.error('email.test.failed', { error });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Failed to send test email. Check SMTP credentials.' } },
      { status: 500 }
    );
  }
}
