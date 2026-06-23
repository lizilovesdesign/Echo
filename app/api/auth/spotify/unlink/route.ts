import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkCsrfOrigin } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  const csrf = checkCsrfOrigin(request);
  if (!csrf.valid) return csrf.response!;

  const session = await verifyAuthSession(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true, data: { connected: false } });
}
