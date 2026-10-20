import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TopItemsView } from '@/components/journal/TopItemsView';

const genreItems = [
  { id: 'indie pop', name: 'indie pop', artistCount: 4, weight: 830, swatches: ['https://i.scdn.co/image/a', 'https://i.scdn.co/image/b', 'https://i.scdn.co/image/c', 'https://i.scdn.co/image/d'] },
  { id: 'rock', name: 'rock', artistCount: 3, weight: 610, swatches: ['https://i.scdn.co/image/e'] },
  { id: 'r&b', name: 'r&b', artistCount: 2, weight: 400, swatches: ['https://i.scdn.co/image/f', 'https://i.scdn.co/image/g'] },
];

const artistItems = [
  { id: 'a1', name: 'Artist One', image: 'https://i.scdn.co/image/x', genres: ['indie pop'] },
];

describe('TopItemsView genres tab', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const type = new URL(url, 'http://localhost').searchParams.get('type');
      const items = type === 'genres' ? genreItems : artistItems;
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true, data: { connected: true, items } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }) as typeof fetch;
  });

  afterEach(() => cleanup());

  it('renders genres with hero, list, and subtitles when API returns genre data', async () => {
    const user = userEvent.setup();
    render(<TopItemsView />);

    // Initial artists tab should resolve
    expect(await screen.findByText('Your Top Artists')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /genres/i }));

    expect(await screen.findByText('Your Top Genres')).toBeInTheDocument();
    expect(screen.getByText('Indie Pop')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('R&b')).toBeInTheDocument();
    expect(screen.getByText('4 artists')).toBeInTheDocument();
    expect(screen.getByText('3 artists')).toBeInTheDocument();
    // numbered list rows
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows a genres-specific message when Spotify returns no genre data', async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      const type = new URL(url, 'http://localhost').searchParams.get('type');
      const items = type === 'genres' ? [] : artistItems;
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true, data: { connected: true, items } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    render(<TopItemsView />);
    expect(await screen.findByText('Your Top Artists')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /genres/i }));

    expect(
      await screen.findByText('Spotify has no genre data for your top artists yet.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Your Top Genres')).not.toBeInTheDocument();
  });
});
