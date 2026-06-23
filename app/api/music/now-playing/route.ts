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

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.spotifyRefreshToken) {
      return NextResponse.json({ ok: true, data: { connected: false, currentlyPlaying: null } });
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
        return NextResponse.json({ ok: true, data: { connected: false, currentlyPlaying: null } });
      }

      accessToken = refreshed.accessToken;
      expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

      await prisma.user.update({
        where: { id: session.userId },
        data: { spotifyAccessToken: accessToken, spotifyTokenExpiresAt: expiresAt },
      });
    }

    const currentlyPlaying = await spotify.getCurrentlyPlaying(accessToken!);

    return NextResponse.json({
      ok: true,
      data: { connected: true, currentlyPlaying },
    });
  } catch (error) {
    logger.error('music.now_playing.internal_error', { error });
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch currently playing track.' },
      },
      { status: 500 }
    );
  }
}
