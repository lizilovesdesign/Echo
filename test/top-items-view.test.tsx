import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TopItemsView } from '@/components/journal/TopItemsView';

const artistItems = [
  { id: 'a1', name: 'Artist One', image: 'https://i.scdn.co/image/x' },
  { id: 'a2', name: 'Artist Two', image: 'https://i.scdn.co/image/y' },
];

const trackItems = [
  { id: 't1', name: 'Track One', image: 'https://i.scdn.co/image/z', artist: 'Artist One' },
];

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('TopItemsView', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const type = new URL(url, 'http://localhost').searchParams.get('type');
      const items = type === 'tracks' ? trackItems : artistItems;
      return Promise.resolve(okJson({ ok: true, data: { connected: true, items } }));
    }) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the artists recap with hero and ranked list', async () => {
    render(<TopItemsView />);

    expect(await screen.findByText('Your Top Artists')).toBeInTheDocument();

    const ranked = screen.getByRole('list', { name: 'Your top items' });
    expect(within(ranked).getByText('Artist One')).toBeInTheDocument();
    expect(within(ranked).getByText('Artist Two')).toBeInTheDocument();
    expect(within(ranked).getByText('1')).toBeInTheDocument();
    expect(within(ranked).getByText('2')).toBeInTheDocument();

    // The number one pick is also celebrated as the hero.
    expect(screen.getByText('No. 1')).toBeInTheDocument();
  });

  it('offers only Artists, Songs and Albums tabs', async () => {
    render(<TopItemsView />);

    expect(await screen.findByRole('tablist')).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs.map((tab) => tab.textContent)).toEqual(['🎤Artists', '🎵Songs', '💿Albums']);
    expect(screen.queryByRole('tab', { name: /genres/i })).not.toBeInTheDocument();
  });

  it('offers only This week, Last week and Last month time ranges', async () => {
    render(<TopItemsView />);

    expect(await screen.findByText('This week')).toBeInTheDocument();
    expect(screen.getByText('Last week')).toBeInTheDocument();
    expect(screen.getByText('Last month')).toBeInTheDocument();
    expect(screen.queryByText('All time')).not.toBeInTheDocument();
  });

  it('switches to Songs and renders the track list with its subtitle', async () => {
    const user = userEvent.setup();
    render(<TopItemsView />);

    expect(await screen.findByText('Your Top Artists')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /songs/i }));

    expect(await screen.findByText('Your Top Tracks')).toBeInTheDocument();
    const ranked = screen.getByRole('list', { name: 'Your top items' });
    expect(within(ranked).getByText('Track One')).toBeInTheDocument();
    expect(within(ranked).getByText('Artist One')).toBeInTheDocument();
  });

  it('shows the empty state when the API returns no items', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve(okJson({ ok: true, data: { connected: true, items: [] } }))
    );

    render(<TopItemsView />);

    expect(await screen.findByText('Nothing here yet. Go make some noise! 🎧')).toBeInTheDocument();
  });
});
