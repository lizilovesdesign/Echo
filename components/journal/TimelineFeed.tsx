'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ViewOffIcon } from 'hugeicons-react';
import { EchoEntryCard, EchoEntryData } from './EchoEntryCard';
import { MoodTag } from '@/lib/validators/echoEntry';
import { MOOD_ORDER, getMoodConfig } from '@/lib/moods';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import styles from './TimelineFeed.module.css';

type Filter = 'All' | MoodTag | 'Hidden';
type TypeFilter = 'all' | 'song' | 'album';

const filters: Filter[] = ['All', 'Hidden', ...MOOD_ORDER];

const typeTabs: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All entries' },
  { key: 'song', label: 'Songs' },
  { key: 'album', label: 'Albums' },
];

export function TimelineFeed() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const { data: entries = [], isLoading, error } = useQuery<EchoEntryData[]>({
    queryKey: ['echoes'],
    queryFn: async () => {
      const res = await fetch('/api/echoes');
      if (!res.ok) {
        throw new Error('Failed to load journal logs');
      }
      const json = await res.json();
      return json.data || [];
    },
  });

  const filtered = useMemo(() => {
    // Hidden memories are kept out of the normal feed; the "Hidden" view is
    // the only place they surface, so they can always be restored.
    let result = activeFilter === 'Hidden'
      ? entries.filter((e) => e.hidden)
      : entries.filter((e) => !e.hidden);

    if (activeFilter !== 'All' && activeFilter !== 'Hidden') {
      result = result.filter((e) => e.moodTag === activeFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((e) => e.entryType === typeFilter);
    }
    return result;
  }, [entries, activeFilter, typeFilter]);

  if (isLoading) {
    return (
      <div className={styles.centeredState}>
        <Spinner size="lg" />
        <p className={styles.loadingText}>Restoring your emotional archive...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyTitle}>Unable to load timeline</h3>
        <p className={styles.emptySubtitle}>
          There was a problem fetching your entries. Please try again.
        </p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg className={styles.emptyIllustration} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="56" stroke="var(--color-outline-variant)" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="60" cy="60" r="40" stroke="var(--color-outline-variant)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M52 48V78a6 6 0 01-6 6h-2a6 6 0 01-6-6 6 6 0 016-6h2V48l24-4v24a6 6 0 01-6 6h-2a6 6 0 01-6-6 6 6 0 016-6h2V44l24-4v24" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
        <h3 className={styles.emptyTitle}>Your timeline is silent</h3>
        <p className={styles.emptySubtitle}>
          Anchor your first song to a personal memory and mood in under 20 seconds.
        </p>
        <Link href="/create">
          <Button variant="primary">Create an Echo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <div className={styles.typeTabRow}>
        {typeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key)}
            className={`${styles.typeTab} ${typeFilter === tab.key ? styles.typeTabActive : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.filterRow}>
        {filters.map((f) => {
          const isActive = activeFilter === f;
          const isHiddenView = f === 'Hidden';
          const moodConfig = f === 'All' || isHiddenView ? null : getMoodConfig(f);
          const pillStyle = f === 'All'
            ? isActive
              ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
              : {}
            : isHiddenView
              ? {
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface-variant)',
                  opacity: isActive ? 1 : 0.7,
                }
              : {
                  backgroundColor: isActive ? moodConfig?.pillActiveBg : moodConfig?.pillInactiveBg,
                  color: isActive ? moodConfig?.pillActiveColor : moodConfig?.pillInactiveColor,
                  opacity: isActive ? 1 : 0.7,
                };

          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={styles.filterPill}
              style={pillStyle}
            >
              {moodConfig && <span>{moodConfig.emoji}</span>}
              {isHiddenView && <ViewOffIcon size={14} />}
              <span>{moodConfig ? moodConfig.label : isHiddenView ? 'Hidden' : f}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptySubtitle}>
            {activeFilter === 'Hidden'
              ? 'Nothing hidden right now. Memories you hide will wait here.'
              : 'No entries match this filter.'}
          </p>
        </div>
      ) : (
        <div className={styles.moodEntries}>
          {filtered.map((entry, idx) => (
            <div
              key={entry.id}
              className={styles.cardWrapper}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <EchoEntryCard entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
