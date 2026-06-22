import { NextRequest, NextResponse } from 'next/server';
import { env } from './env';

function isLocalhostOrigin(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function checkCsrfOrigin(request: NextRequest): { valid: boolean; response?: NextResponse } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  const allowedOrigin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  const candidateOrigins: string[] = [];

  if (origin) {
    candidateOrigins.push(origin.replace(/\/$/, ''));
  }

  if (referer) {
    try {
      candidateOrigins.push(new URL(referer).origin.replace(/\/$/, ''));
    } catch {
      // malformed referer — skip
    }
  }

  if (host) {
    candidateOrigins.push(`${request.headers.get('x-forwarded-proto') ?? 'http'}://${host}`.replace(/\/$/, ''));
  }

  for (const candidate of candidateOrigins) {
    if (candidate !== allowedOrigin) {
      const allowedIsLocalhost = isLocalhostOrigin(allowedOrigin);
      const candidateIsLocalhost = isLocalhostOrigin(candidate);

      if (!allowedIsLocalhost || !candidateIsLocalhost) {
        return {
          valid: false,
          response: NextResponse.json(
            { ok: false, error: { code: 'FORBIDDEN', message: 'Invalid request origin.' } },
            { status: 403 }
          ),
        };
      }
    }
  }

  return { valid: true };
}
