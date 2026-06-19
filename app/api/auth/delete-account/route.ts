import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.admin.deleteUser(session.user.id);

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
