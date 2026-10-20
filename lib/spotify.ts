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

export interface TopGenre {
  id: string;
  name: string;
  artistCount: number;
  weight: number;
  swatches: string[];
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

  public async getTopAlbums(
    accessToken: string,
    timeRange: string = 'medium_term',
    limit: number = 20
  ): Promise<TopItem[]> {
    try {
      const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`;
      const response = await this.fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 403) {
        throw new Error('INSUFFICIENT_SCOPE');
      }

      if (!response.ok) {
        throw new Error(`Spotify top tracks fetch failed for albums: ${response.status}`);
      }

      const data = await response.json();
      const rawTracks: unknown[] = data.items || [];
      const fallbackArt =
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';

      const albumMap = new Map<string, { id: string; name: string; image: string; artist: string; trackCount: number }>();

      for (const raw of rawTracks) {
        const track = raw as Record<string, unknown>;
        const album = track.album as Record<string, unknown> | undefined;
        if (!album) continue;

        const albumId = album.id as string;
        const albumName = album.name as string;
        const images = album.images as { url: string }[] | undefined;
        const artists = album.artists as { name: string }[] | undefined;
        const image = images?.[0]?.url ?? fallbackArt;
        const artist = artists?.[0]?.name ?? 'Unknown Artist';

        const existing = albumMap.get(albumId);
        if (existing) {
          existing.trackCount++;
        } else {
          albumMap.set(albumId, { id: albumId, name: albumName, image, artist, trackCount: 1 });
        }
      }

      return Array.from(albumMap.values())
        .sort((a, b) => b.trackCount - a.trackCount)
        .slice(0, limit)
        .map(({ trackCount, ...rest }) => rest);
    } catch (error) {
      logger.error('spotify.top_albums.fetch_failed', { error });
      throw error;
    }
  }

  public async getTopItems(
    accessToken: string,
    type: 'artists' | 'tracks' | 'albums',
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

      if (type === 'albums') {
        return items.map((item) => {
          const album = item as Record<string, unknown>;
          const images = album.images as { url: string }[] | undefined;
          const artists = album.artists as { name: string }[] | undefined;
          return {
            id: album.id as string,
            name: album.name as string,
            image: images?.[0]?.url ?? fallbackArt,
            artist: artists?.[0]?.name ?? 'Unknown Artist',
            popularity: album.popularity as number,
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

  /**
   * Derives a ranked list of the user's top genres from their top artists.
   *
   * The Spotify Web API exposes genres only per-artist (there is no "top genres"
   * endpoint), so this aggregates a wide sample of top artists, weights each
   * artist by their rank (higher-ranked artists contribute more), and tallies the
   * weights across every genre. Each returned genre carries the album-art swatches
   * of the highest-ranked artists who share that genre, so the UI can render a
   * fanned visual collage consistent with the artist/track/album recap pattern.
   *
   * Spotify intermittently returns top-item artist objects with an empty genres
   * array. When that happens this retries once against the catalog artists
   * endpoint (by id, one batched request) before returning an empty list, and
   * logs which path produced the result so an empty response is diagnosable.
   */
  public async getTopGenres(
    accessToken: string,
    timeRange: string = 'medium_term',
    limit: number = 5
  ): Promise<TopGenre[]> {
    try {
      const url = `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=50`;
      const response = await this.fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 403) {
        throw new Error('INSUFFICIENT_SCOPE');
      }

      if (!response.ok) {
        throw new Error(`Spotify top artists fetch failed for genres: ${response.status}`);
      }

      const data = await response.json();
      const artists: unknown[] = data.items || [];
      const fallbackArt =
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';

      let ranked = artists.map((raw, index) => {
        const artist = raw as Record<string, unknown>;
        const images = artist.images as { url: string }[] | undefined;
        return {
          id: artist.id as string,
          name: artist.name as string,
          image: images?.[0]?.url ?? fallbackArt,
          genres: Array.isArray(artist.genres) ? (artist.genres as string[]) : [],
          weight: artists.length - index,
        };
      });

      let genreMap = this.buildGenreMap(ranked);

      if (genreMap.size === 0 && ranked.length > 0) {
        const catalogGenres = await this.fetchArtistGenresByIds(
          ranked.map((artist) => artist.id),
          accessToken
        );
        if (catalogGenres) {
          ranked = ranked.map((artist) => ({
            ...artist,
            genres: catalogGenres.get(artist.id) ?? [],
          }));
          genreMap = this.buildGenreMap(ranked);
        }
        logger.warn('spotify.top_genres.fallback_to_catalog', {
          artistCount: ranked.length,
          catalogGenresFound: catalogGenres ? catalogGenres.size : null,
          genreCount: genreMap.size,
        });
      }

      return Array.from(genreMap.entries())
        .map(([name, entry]) => ({
          id: name,
          name,
          artistCount: entry.artists.length,
          weight: entry.weight,
          swatches: entry.artists.map((a) => a.image),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, limit);
    } catch (error) {
      logger.error('spotify.top_genres.fetch_failed', { error });
      throw error;
    }
  }

  private buildGenreMap(
    ranked: { name: string; image: string; genres: string[]; weight: number }[]
  ): Map<string, { weight: number; artists: { name: string; image: string }[] }> {
    const genreMap = new Map<string, { weight: number; artists: { name: string; image: string }[] }>();

    for (const artist of ranked) {
      for (const genre of artist.genres) {
        const entry = genreMap.get(genre) ?? { weight: 0, artists: [] };
        entry.weight += artist.weight;
        if (entry.artists.length < 4 && !entry.artists.some((a) => a.name === artist.name)) {
          entry.artists.push({ name: artist.name, image: artist.image });
        }
        genreMap.set(genre, entry);
      }
    }

    return genreMap;
  }

  private async fetchArtistGenresByIds(
    ids: string[],
    accessToken: string
  ): Promise<Map<string, string[]> | null> {
    if (ids.length === 0) return new Map();
    try {
      const url = `https://api.spotify.com/v1/artists?ids=${ids.join(',')}`;
      const response = await this.fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error(`Spotify catalog artists fetch failed: ${response.status}`);
      }
      const data = await response.json();
      const catalogArtists: unknown[] = Array.isArray(data.artists) ? data.artists : [];
      const genresById = new Map<string, string[]>();
      for (const raw of catalogArtists) {
        if (!raw) continue; // the catalog endpoint can return null entries for unknown ids
        const artist = raw as Record<string, unknown>;
        if (typeof artist.id === 'string' && Array.isArray(artist.genres)) {
          genresById.set(artist.id, artist.genres as string[]);
        }
      }
      return genresById;
    } catch (error) {
      logger.warn('spotify.top_genres.catalog_fallback_failed', { error });
      return null;
    }
  }
}

export const spotify = new SpotifyClient();
