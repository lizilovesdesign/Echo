import { NextRequest, NextResponse } from 'next/server';
import { spotify } from '@/lib/spotify';

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

  const track = await spotify.getTrack(id);

  if (!track.previewUrl) {
    return NextResponse.json(
      { ok: false, error: { code: 'NO_PREVIEW', message: 'No preview available for this track' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: track });
}
