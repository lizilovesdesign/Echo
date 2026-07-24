import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  const redirectUri = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/auth/spotify/callback`
    .replace('://localhost:', '://127.0.0.1:');
  const scopes = ['user-read-currently-playing', 'user-read-playback-state', 'user-top-read'];
  const params = new URLSearchParams({
    client_id: env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    show_dialog: 'true',
  });

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  return NextResponse.redirect(spotifyAuthUrl);
}
