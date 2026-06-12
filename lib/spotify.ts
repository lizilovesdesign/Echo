import { SpotifyTrack } from './validators/spotify';
import { logger } from './logger';

class SpotifyClient {
  private clientId = process.env.SPOTIFY_CLIENT_ID || '';
  private clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0; // Unix timestamp in ms

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    // Return cached token if it's still valid (with a 60-second buffer)
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

  public async searchTracks(query: string): Promise<SpotifyTrack[]> {
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
      const items = data.tracks?.items || [];

      // Map raw Spotify tracks into our strict unified shape
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists?.[0]?.name || 'Unknown Artist',
        albumArtUrl: item.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop',
      }));
    } catch (error) {
      logger.error('spotify.search.failed', { query, error });
      return [];
    }
  }
}

export const spotify = new SpotifyClient();
