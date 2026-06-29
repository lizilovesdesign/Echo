'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search01Icon } from 'hugeicons-react';
import { useEntryStore } from '@/lib/stores/entryStore';
import { MusicTrack } from '@/lib/validators/music';
import { Spinner } from '../ui/Spinner';
import styles from './SongSearchInput.module.css';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SongSearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const setSelectedTrack = useEntryStore((state) => state.setSelectedTrack);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tracks = [], isLoading } = useQuery<MusicTrack[]>({
    queryKey: ['spotifySearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const json = await res.json();
      return json.data || [];
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <Search01Icon className={styles.searchIcon} size={20} />
        <input
          ref={inputRef}
          type="text"
          placeholder="I'm listening to..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
          aria-label="Search for a song"
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {isLoading && (
        <div className={styles.loadingWrapper}>
          <Spinner size="sm" />
          <span className={styles.loadingText}>Searching...</span>
        </div>
      )}

      {query.trim().length > 0 && !isLoading && tracks.length === 0 && debouncedQuery === query && (
        <div className={styles.noResults}>No matching tracks found</div>
      )}

      {tracks.length > 0 && (
        <ul className={styles.resultsList}>
          {tracks.map((track) => (
            <li key={track.id} className={styles.resultItem}>
              <button
                type="button"
                className={styles.trackButton}
                onClick={() => setSelectedTrack(track)}
              >
                <Image
                  src={track.albumArtUrl}
                  alt={`Album art for ${track.name} by ${track.artist}`}
                  width={40}
                  height={40}
                  className={styles.albumArt}
                />
                <div className={styles.meta}>
                  <span className={styles.trackName}>{track.name}</span>
                  <span className={styles.artistName}>{track.artist}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
