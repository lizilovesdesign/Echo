import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    logger.warn('spotify.oauth.error', { error });
    return NextResponse.redirect(new URL('/home?spotify=denied', env.NEXT_PUBLIC_APP_URL));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/home?spotify=error', env.NEXT_PUBLIC_APP_URL));
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', env.NEXT_PUBLIC_APP_URL));
    }

    const userId = session.user.id;
    const redirectUri = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/auth/spotify/callback`
      .replace('://localhost:', '://127.0.0.1:');
    const basicAuth = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Spotify token exchange failed: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: tokenData.access_token,
        spotifyRefreshToken: tokenData.refresh_token,
        spotifyTokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    return NextResponse.redirect(new URL('/home?spotify=connected', env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    logger.error('spotify.oauth.callback_failed', { error });
    return NextResponse.redirect(new URL('/home?spotify=error', env.NEXT_PUBLIC_APP_URL));
  }
}
