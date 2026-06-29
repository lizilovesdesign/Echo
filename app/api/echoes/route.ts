import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth';
import { CreateEchoSchema } from '@/lib/validators/echoEntry';
import { echoEntryRepository } from '@/lib/repositories/echoEntry.repository';
import { checkCsrfOrigin } from '@/lib/csrf';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const entries = await echoEntryRepository.findByUserId(session.userId, limit);
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

export async function POST(request: NextRequest) {
  const csrf = checkCsrfOrigin(request);
  if (!csrf.valid) {
    logger.warn('csrf.blocked', { path: '/api/echoes', method: 'POST' });
    return csrf.response;
  }

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

    const newEntry = await echoEntryRepository.create(session.userId, session.email, validation.data);

    logger.info('echoes.created', { userId: session.userId, entryId: newEntry.id });

    return NextResponse.json({ ok: true, data: newEntry }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('echoes.create.failed', { userId: session.userId, error, message });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
