import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// Admin client for storage ops — no user session attached, uses service_role key only
function createStorageClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_FILE', message: 'No file provided.' } },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'File must be under 2MB.' } },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_TYPE', message: 'Only JPEG, PNG, and WebP images are allowed.' } },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() ?? 'png';
    const fileName = `${session.user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const storageClient = createStorageClient();
    const { error: uploadError } = await storageClient.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      logger.error('api.auth.avatar.upload-failed', { error: uploadError });
      return NextResponse.json(
        { ok: false, error: { code: 'UPLOAD_FAILED', message: uploadError.message || 'Failed to upload avatar.' } },
        { status: 500 }
      );
    }

    const { data: urlData } = storageClient.storage.from('avatars').getPublicUrl(fileName);

    return NextResponse.json({ ok: true, data: { url: urlData.publicUrl } });
  } catch (error) {
    logger.error('api.auth.avatar.failed', { error });
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Failed to upload avatar.' } },
      { status: 500 }
    );
  }
}
