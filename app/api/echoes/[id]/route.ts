import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth';
import { echoEntryRepository } from '@/lib/repositories/echoEntry.repository';
import { CreateEchoSchema, MoodTag } from '@/lib/validators/echoEntry';
import { checkCsrfOrigin } from '@/lib/csrf';
import { logger } from '@/lib/logger';

interface Context {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const csrf = checkCsrfOrigin(request);
  if (!csrf.valid) {
    logger.warn('csrf.blocked', { path: '/api/echoes/[id]', method: 'PATCH' });
    return csrf.response;
  }

  const entryId = params.id;

  const session = await verifyAuthSession(request);
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication session is invalid or has expired.',
        },
      },
      { status: 401 }
    );
  }

  try {
    const entry = await echoEntryRepository.findById(entryId);

    if (!entry) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Target Echo entry could not be found.',
          },
        },
        { status: 404 }
      );
    }

    if (entry.userId !== session.userId) {
      logger.warn('echoes.update.unauthorized_attempt', {
        userId: session.userId,
        ownerId: entry.userId,
        entryId,
      });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this entry.',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = CreateEchoSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Input validation failed.',
            details: validation.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const input = validation.data;

    const updated = await echoEntryRepository.update(entryId, {
      songTitle: input.songTitle ?? entry.songTitle,
      artist: input.artist ?? entry.artist,
      albumArtUrl: input.albumArtUrl ?? entry.albumArtUrl,
      spotifyTrackId: input.spotifyTrackId ?? entry.spotifyTrackId,
      previewUrl: input.previewUrl ?? entry.previewUrl,
      moodTag: (input.moodTag ?? entry.moodTag) as MoodTag,
      note: input.note ?? entry.note,
      stickers: input.stickers ?? entry.stickers,
    });

    logger.info('echoes.updated', { userId: session.userId, entryId });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    logger.error('echoes.update.failed', { userId: session.userId, entryId, error });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while updating the entry.',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const csrf = checkCsrfOrigin(request);
  if (!csrf.valid) {
    logger.warn('csrf.blocked', { path: '/api/echoes/[id]', method: 'DELETE' });
    return csrf.response;
  }

  const entryId = params.id;

  const session = await verifyAuthSession(request);
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication session is invalid or has expired.',
        },
      },
      { status: 401 }
    );
  }

  try {
    const entry = await echoEntryRepository.findById(entryId);

    if (!entry) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Target Echo entry could not be found.',
          },
        },
        { status: 404 }
      );
    }

    if (entry.userId !== session.userId) {
      logger.warn('echoes.delete.unauthorized_attempt', {
        userId: session.userId,
        ownerId: entry.userId,
        entryId,
      });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this entry.',
          },
        },
        { status: 403 }
      );
    }

    await echoEntryRepository.delete(entryId);

    logger.info('echoes.deleted', { userId: session.userId, entryId });

    return NextResponse.json({ ok: true, data: { id: entryId } });
  } catch (error) {
    logger.error('echoes.delete.failed', { userId: session.userId, entryId, error });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while deleting the entry.',
        },
      },
      { status: 500 }
    );
  }
}
