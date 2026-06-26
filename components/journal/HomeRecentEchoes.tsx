'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { MusicNote02Icon } from 'hugeicons-react';
import { EchoEntryData } from '@/components/journal/EchoEntryCard';
import { Spinner } from '@/components/ui/Spinner';
import styles from './HomeRecentEchoes.module.css';

const moodEmojis: Record<string, string> = {
  Nostalgic: '🍂',
  Energetic: '⚡',
  Melancholic: '🌧️',
  Calm: '🌊',
};

export function HomeRecentEchoes() {
  const { data: entries = [], isLoading, error } = useQuery<EchoEntryData[]>({
    queryKey: ['echoes'],
    queryFn: async () => {
      const res = await fetch('/api/echoes');
      if (!res.ok) throw new Error('Failed to load entries');
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 60_000,
  });

  const recent = entries.slice(0, 3);

  return (
    <section className={styles.section} aria-label="Recent echoes">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>My Journal</h2>
        <Link href="/timeline" className={styles.seeAll}>
          See all →
        </Link>
      </div>

      {isLoading && (
        <div className={styles.loadingState}>
          <Spinner size="sm" />
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Unable to load recent entries.</p>
        </div>
      )}

      {!isLoading && !error && recent.length === 0 && (
        <div className={styles.emptyState}>
          <MusicNote02Icon className={styles.emptyIcon} size={32} />
          <p className={styles.emptyText}>Your first Echo is waiting to be created.</p>
          <Link href="/create" className={styles.emptyLink}>
            Start now →
          </Link>
        </div>
      )}

      {!isLoading && !error && recent.length > 0 && (
        <div className={styles.list}>
          {recent.map((entry, idx) => (
            <div
              key={entry.id}
              className={styles.rowWrapper}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
            <Link
              href="/timeline"
              className={styles.entryRow}
            >
              <img
                src={entry.albumArtUrl}
                alt={`Album art for ${entry.songTitle}`}
                className={styles.albumArt}
              />
              <div className={styles.entryInfo}>
                <p className={styles.songTitle}>{entry.songTitle}</p>
                <p className={styles.artist}>{entry.artist}</p>
                {entry.entryType === 'album' && (
                  <span className={styles.albumBadge}>Album</span>
                )}
              </div>
              <div className={styles.entryMeta}>
                <span className={styles.moodEmoji} aria-label={entry.moodTag}>
                  {moodEmojis[entry.moodTag] ?? '🎵'}
                </span>
                <span className={styles.timestamp}>
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
