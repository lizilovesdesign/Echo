import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { verifyAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.admin.deleteUser(session.userId);

    if (error) {
      logger.error('api.auth.delete-account.failed', { error });
      return NextResponse.json(
        { ok: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete account.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('api.auth.delete-account.failed', { error });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete account.' } },
      { status: 500 }
    );
  }
}
