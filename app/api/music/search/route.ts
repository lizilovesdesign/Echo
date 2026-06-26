import { NextRequest, NextResponse } from 'next/server';
import { spotify } from '@/lib/spotify';
import { isRateLimited } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  if (isRateLimited(ip, { limit: 20, windowMs: 60 * 1000 })) {
    logger.warn('music.search.rate_limited', { ip });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please try again in a minute.',
        },
      },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'track';

  if (!query || !query.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Query parameter "q" is required and cannot be empty.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const results = type === 'album'
      ? await spotify.searchAlbums(query)
      : await spotify.searchTracks(query);
    return NextResponse.json({ ok: true, data: results });
  } catch (error) {
    logger.error('music.search.internal_error', { query, type, error });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while communicating with the music service.',
        },
      },
      { status: 500 }
    );
  }
}
