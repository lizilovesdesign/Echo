import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { spotify } from '@/lib/spotify';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const session = await verifyAuthSession(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const timeRange = searchParams.get('time_range') ?? 'medium_term';
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50);

  if (type !== 'artists' && type !== 'tracks' && type !== 'albums') {
    return NextResponse.json(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'type must be "artists", "tracks", or "albums".' } },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.spotifyRefreshToken) {
      return NextResponse.json({ ok: true, data: { connected: false, items: [] } });
    }

    let accessToken = user.spotifyAccessToken;
    let expiresAt = user.spotifyTokenExpiresAt;

    if (!accessToken || !expiresAt || expiresAt <= new Date()) {
      const refreshed = await spotify.refreshUserToken(user.spotifyRefreshToken);
      if (!refreshed) {
        await prisma.user.update({
          where: { id: session.userId },
          data: { spotifyAccessToken: null, spotifyRefreshToken: null, spotifyTokenExpiresAt: null },
        });
        return NextResponse.json({ ok: true, data: { connected: false, items: [] } });
      }

      accessToken = refreshed.accessToken;
      expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

      await prisma.user.update({
        where: { id: session.userId },
        data: { spotifyAccessToken: accessToken, spotifyTokenExpiresAt: expiresAt },
      });
    }

    const items = await spotify.getTopItems(accessToken!, type, timeRange, limit);

    return NextResponse.json({
      ok: true,
      data: { connected: true, items },
    });
  } catch (error) {
    const err = error as Error;
    if (err.message === 'INSUFFICIENT_SCOPE') {
      return NextResponse.json({
        ok: true,
        data: { connected: true, items: [], needsReauth: true },
      });
    }

    logger.error('music.top_items.internal_error', { error });
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch top items.' },
      },
      { status: 500 }
    );
  }
}
