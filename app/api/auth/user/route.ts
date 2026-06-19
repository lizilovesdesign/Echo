import { NextResponse } from 'next/server';
import { getWebSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getWebSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        email: session.email,
        userId: session.userId,
      },
    });
  } catch (error) {
    logger.error('api.auth.user.failed', { error });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch user.' } },
      { status: 500 }
    );
  }
}
