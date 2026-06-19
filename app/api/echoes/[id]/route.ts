import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface Context {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const entryId = params.id;

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
    // 2. Fetch target entry
    const entry = await prisma.echoEntry.findUnique({
      where: { id: entryId },
    });

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

    // 3. Assert Ownership Bounds
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

    // 4. Execute deletion
    await prisma.echoEntry.delete({
      where: { id: entryId },
    });

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
