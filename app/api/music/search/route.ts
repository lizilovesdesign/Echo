import { NextRequest, NextResponse } from 'next/server';
import { spotify } from '@/lib/spotify';
import { isRateLimited } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Enforce Rate Limiting (max 20 requests per minute)
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

  // 2. Validate Query Parameter
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

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
    // 3. Query Spotify API
    const tracks = await spotify.searchTracks(query);
    return NextResponse.json({ ok: true, data: tracks });
  } catch (error: any) {
    logger.error('music.search.internal_error', { query, error });
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
