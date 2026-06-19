'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { EchoEntryCard, EchoEntryData } from './EchoEntryCard';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import styles from './TimelineFeed.module.css';

export function TimelineFeed() {
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
      {entries.map((entry) => (
        <EchoEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
