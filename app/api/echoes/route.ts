import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthSession } from '@/lib/auth';
import { CreateEchoSchema } from '@/lib/validators/echoEntry';
import { logger } from '@/lib/logger';

// GET: Retrieve authenticated user's timeline logs
export async function GET(request: NextRequest) {
  // 1. Verify User Authentication
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
    // 2. Fetch Entries from Database
    const entries = await prisma.echoEntry.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ ok: true, data: entries });
  } catch (error) {
    logger.error('echoes.get.failed', { userId: session.userId, error });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve timeline logs.',
        },
      },
      { status: 500 }
    );
  }
}

// POST: Anchor a new song and memory
export async function POST(request: NextRequest) {
  // 1. Verify User Authentication
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
    const body = await request.json();

    // 2. Validate Incoming Input Parameters
    const validation = CreateEchoSchema.safeParse(body);
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

    // 3. Ensure User Record exists locally (upsert to prevent foreign key violation)
    await prisma.user.upsert({
      where: { id: session.userId },
      update: {},
      create: {
        id: session.userId,
        email: session.email,
      },
    });

    // 4. Create Entry
    const newEntry = await prisma.echoEntry.create({
      data: {
        userId: session.userId,
        songTitle: input.songTitle,
        artist: input.artist,
        albumArtUrl: input.albumArtUrl,
        spotifyTrackId: input.spotifyTrackId,
        moodTag: input.moodTag,
        note: input.note,
      },
    });

    logger.info('echoes.created', { userId: session.userId, entryId: newEntry.id });

    return NextResponse.json({ ok: true, data: newEntry }, { status: 201 });
  } catch (error) {
    logger.error('echoes.create.failed', { userId: session.userId, error });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record Echo entry.',
        },
      },
      { status: 500 }
    );
  }
}
