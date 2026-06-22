import { NextRequest, NextResponse } from 'next/server';
import { env } from './env';

export function checkCsrfOrigin(request: NextRequest): { valid: boolean; response?: NextResponse } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const allowedOrigin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  if (origin) {
    const originOrigin = origin.replace(/\/$/, '');
    if (originOrigin !== allowedOrigin) {
      return {
        valid: false,
        response: NextResponse.json(
          { ok: false, error: { code: 'FORBIDDEN', message: 'Invalid request origin.' } },
          { status: 403 }
        ),
      };
    }
  }

  if (referer) {
    const refererOrigin = new URL(referer).origin.replace(/\/$/, '');
    if (refererOrigin !== allowedOrigin) {
      return {
        valid: false,
        response: NextResponse.json(
          { ok: false, error: { code: 'FORBIDDEN', message: 'Invalid request origin.' } },
          { status: 403 }
        ),
      };
    }
  }

  return { valid: true };
}
