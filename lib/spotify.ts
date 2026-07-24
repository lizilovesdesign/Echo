import { z } from 'zod';
import { env } from './env';
import { MusicTrack, MusicTrackSchema } from './validators/music';
import { logger } from './logger';

export interface TopItem {
  id: string;
  name: string;
  image: string;
  artist?: string;
  genres?: string[];
  popularity?: number;
}

export interface CurrentlyPlaying {
  isPlaying: boolean;
  trackId: string;
  trackName: string;
  artist: string;
  albumArtUrl: string;
  previewUrl: string | null;
  progressMs: number;
  durationMs: number;
}

class SpotifyClient {
  private clientId = env.SPOTIFY_CLIENT_ID;
  private clientSecret = env.SPOTIFY_CLIENT_SECRET;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  private async fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
    const { timeout = 8000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...fetchOptions, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry > now + 60000) {
      return this.cachedToken;
    }

    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await this.fetchWithTimeout('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        cache: 'no-store',
        timeout: 10000,
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

  public async searchAlbums(query: string): Promise<MusicTrack[]> {
    if (!query.trim()) return [];

    try {
      const accessToken = await this.getAccessToken();
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=8`;

      const response = await this.fetchWithTimeout(searchUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify album search failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const items: unknown[] = data.albums?.items || [];

      const rawAlbumSchema = z.object({
        id: z.string(),
        name: z.string(),
        artists: z.array(z.object({ name: z.string() })).min(1),
        images: z.array(z.object({ url: z.string() })).optional(),
      });

      const fallbackArt =
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';

      return items.map((item) => {
        const parsed = rawAlbumSchema.safeParse(item);
        if (!parsed.success) return null;
        const album = parsed.data;
        const albumArtUrl = album.images?.[0]?.url ?? fallbackArt;

        const validated = MusicTrackSchema.safeParse({
          id: album.id,
          name: album.name,
          artist: album.artists[0].name,
          albumArtUrl,
          source: 'spotify',
          previewUrl: null,
          entryType: 'album',
          albumName: album.name,
          albumId: album.id,
        });

        return validated.success ? validated.data : null;
      }).filter((t): t is MusicTrack => t !== null);
    } catch (error) {
      logger.error('spotify.album_search.failed', { query, error });
      throw new Error('Album search failed. Please try again.');
    }
  }

  public async searchTracks(query: string): Promise<MusicTrack[]> {
    if (!query.trim()) return [];

    try {
      const accessToken = await this.getAccessToken();
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`;

      const response = await this.fetchWithTimeout(searchUrl, {
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
      const response = await this.fetchWithTimeout(`https://api.spotify.com/v1/tracks/${trackId}`, {
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

  public async refreshUserToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number } | null> {
    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await this.fetchWithTimeout('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        cache: 'no-store',
        timeout: 10000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify token refresh failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      logger.error('spotify.token.refresh_failed', { error });
      return null;
    }
  }

  public async getCurrentlyPlaying(accessToken: string): Promise<CurrentlyPlaying | null> {
    try {
      const response = await this.fetchWithTimeout(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 204 || response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Spotify currently-playing fetch failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.item) {
        return null;
      }

      const track = data.item;
      const fallbackArt =
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';

      return {
        isPlaying: data.is_playing ?? false,
        trackId: track.id,
        trackName: track.name,
        artist: track.artists?.[0]?.name ?? 'Unknown Artist',
        albumArtUrl: track.album?.images?.[0]?.url ?? fallbackArt,
        previewUrl: track.preview_url ?? null,
        progressMs: data.progress_ms ?? 0,
        durationMs: track.duration_ms ?? 0,
      };
    } catch (error) {
      logger.error('spotify.currently_playing.fetch_failed', { error });
      return null;
    }
  }

  public async getTopItems(
    accessToken: string,
    type: 'artists' | 'tracks',
    timeRange: string = 'medium_term',
    limit: number = 20
  ): Promise<TopItem[]> {
    try {
      const url = `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=${limit}`;
      const response = await this.fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 403) {
        throw new Error('INSUFFICIENT_SCOPE');
      }

      if (!response.ok) {
        throw new Error(`Spotify top ${type} fetch failed: ${response.status}`);
      }

      const data = await response.json();
      const items: unknown[] = data.items || [];
      const fallbackArt =
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';

      if (type === 'artists') {
        return items.map((item) => {
          const artist = item as Record<string, unknown>;
          const images = artist.images as { url: string }[] | undefined;
          return {
            id: artist.id as string,
            name: artist.name as string,
            image: images?.[0]?.url ?? fallbackArt,
            genres: artist.genres as string[],
            popularity: artist.popularity as number,
          };
        });
      }

      return items.map((item) => {
        const track = item as Record<string, unknown>;
        const album = track.album as Record<string, unknown> | undefined;
        const images = album?.images as { url: string }[] | undefined;
        const artists = track.artists as { name: string }[] | undefined;
        return {
          id: track.id as string,
          name: track.name as string,
          image: images?.[0]?.url ?? fallbackArt,
          artist: artists?.[0]?.name ?? 'Unknown Artist',
          popularity: track.popularity as number,
        };
      });
    } catch (error) {
      logger.error('spotify.top_items.fetch_failed', { type, error });
      throw error;
    }
  }
}

export const spotify = new SpotifyClient();
