import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    SPOTIFY_CLIENT_ID: 'test-client-id',
    SPOTIFY_CLIENT_SECRET: 'test-client-secret',
  },
}));

import { spotify } from '@/lib/spotify';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const artist = (id: string, name: string, genres: string[]) => ({
  id,
  name,
  images: [{ url: `https://i.scdn.co/image/${id}` }],
  genres,
});

describe('getTopGenres', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('builds ranked genres directly from top-artist genre data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        items: [artist('a1', 'Alpha', ['indie pop', 'rock']), artist('a2', 'Beta', ['rock'])],
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const genres = await spotify.getTopGenres('token', 'medium_term', 5);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/v1/me/top/artists');
    expect(genres.map((g) => g.name)).toEqual(['rock', 'indie pop']);
    expect(genres[0]).toMatchObject({ artistCount: 2, weight: 3 });
    expect(genres[0].swatches).toEqual([
      'https://i.scdn.co/image/a1',
      'https://i.scdn.co/image/a2',
    ]);
    expect(genres[1]).toMatchObject({ artistCount: 1, weight: 2 });
  });

  it('falls back to the catalog artists endpoint when top items have no genres', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/v1/me/top/artists')) {
        return Promise.resolve(
          jsonResponse({ items: [artist('a1', 'Alpha', []), artist('a2', 'Beta', [])] })
        );
      }
      if (url.includes('/v1/artists?ids=')) {
        return Promise.resolve(
          jsonResponse({
            artists: [artist('a1', 'Alpha', ['jazz']), artist('a2', 'Beta', ['jazz', 'soul'])],
          })
        );
      }
      return Promise.resolve(jsonResponse({ error: 'unexpected' }, 500));
    });
    vi.stubGlobal('fetch', fetchMock);

    const genres = await spotify.getTopGenres('token', 'short_term', 5);

    const catalogCall = fetchMock.mock.calls.find((call) => String(call[0]).includes('/v1/artists?ids='));
    expect(catalogCall).toBeDefined();
    expect(String(catalogCall![0])).toContain('ids=a1,a2');
    expect(genres.map((g) => g.name)).toEqual(['jazz', 'soul']);
    expect(genres[0].swatches).toHaveLength(2);
  });

  it('returns an empty list when there are no top artists at all', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const genres = await spotify.getTopGenres('token', 'medium_term', 5);

    expect(genres).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1); // no catalog retry for an empty account
  });

  it('returns an empty list when neither top items nor catalog carry genres', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/v1/me/top/artists')) {
        return Promise.resolve(jsonResponse({ items: [artist('a1', 'Alpha', [])] }));
      }
      return Promise.resolve(jsonResponse({ artists: [artist('a1', 'Alpha', [])] }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const genres = await spotify.getTopGenres('token', 'medium_term', 5);

    expect(genres).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns an empty list without throwing when the catalog fallback fails', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/v1/me/top/artists')) {
        return Promise.resolve(jsonResponse({ items: [artist('a1', 'Alpha', [])] }));
      }
      return Promise.resolve(jsonResponse({ error: 'Forbidden' }, 403));
    });
    vi.stubGlobal('fetch', fetchMock);

    const genres = await spotify.getTopGenres('token', 'medium_term', 5);

    expect(genres).toEqual([]); // source had nothing; fallback failure must not throw
  });
});
