import { z } from 'zod';
import { env } from './env';
import { MusicTrack, MusicTrackSchema } from './validators/music';
import { logger } from './logger';

class SpotifyClient {
  private clientId = env.SPOTIFY_CLIENT_ID;
  private clientSecret = env.SPOTIFY_CLIENT_SECRET;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry > now + 60000) {
      return this.cachedToken;
    }

    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify token request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      this.cachedToken = data.access_token;
      this.tokenExpiry = now + data.expires_in * 1000;

      return this.cachedToken!;
    } catch (error) {
      logger.error('spotify.token.fetch_failed', { error });
      throw new Error('Failed to retrieve Spotify access credentials');
    }
  }

  public async searchTracks(query: string): Promise<MusicTrack[]> {
    if (!query.trim()) return [];

    try {
      const accessToken = await this.getAccessToken();
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`;

      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify search failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const items: unknown[] = data.tracks?.items || [];

      const rawTrackSchema = z.object({
        id: z.string(),
        name: z.string(),
        artists: z.array(z.object({ name: z.string() })).min(1),
        album: z.object({ images: z.array(z.object({ url: z.string() })) }).optional(),
        preview_url: z.string().nullable().optional(),
      });

      const fallbackArt =
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';

      return items.map((item) => {
        const parsed = rawTrackSchema.safeParse(item);
        if (!parsed.success) {
          return null;
        }
        const track = parsed.data;
        const albumArtUrl = track.album?.images?.[0]?.url ?? fallbackArt;

        const validated = MusicTrackSchema.safeParse({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          albumArtUrl,
          source: 'spotify',
          previewUrl: track.preview_url ?? null,
        });

        return validated.success ? validated.data : null;
      }).filter((t): t is MusicTrack => t !== null);
    } catch (error) {
      logger.error('spotify.search.failed', { query, error });
      throw new Error('Music search failed. Please try again.');
    }
    }

  public async getTrack(trackId: string): Promise<{ previewUrl: string | null }> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Spotify track fetch failed: ${response.status}`);
      }

      const data = await response.json();
      return { previewUrl: data.preview_url ?? null };
    } catch (error) {
      logger.error('spotify.track.fetch_failed', { trackId, error });
      return { previewUrl: null };
    }
  }
}

export const spotify = new SpotifyClient();
