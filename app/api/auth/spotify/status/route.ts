import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await verifyAuthSession(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { spotifyRefreshToken: true },
  });

  return NextResponse.json({
    ok: true,
    data: { connected: !!user?.spotifyRefreshToken },
  });
}
