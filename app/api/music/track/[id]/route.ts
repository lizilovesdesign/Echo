import { NextRequest, NextResponse } from 'next/server';
import { spotify } from '@/lib/spotify';
import { logger } from '@/lib/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'Missing track ID' } },
      { status: 400 }
    );
  }

  try {
    const track = await spotify.getTrack(id);

    if (!track.previewUrl) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_PREVIEW', message: 'No preview available for this track' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: track });
  } catch (error) {
    logger.error('music.track.fetch_failed', { trackId: id, error });
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch track information.' } },
      { status: 500 }
    );
  }
}
