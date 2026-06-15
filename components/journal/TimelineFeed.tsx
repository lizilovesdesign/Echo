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
      <div className={styles.centeredState}>
        <p className={styles.errorText}>Failed to load timeline entries.</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎵</div>
        <h3 className={styles.emptyTitle}>Your timeline is silent</h3>
        <p className={styles.emptySubtitle}>
          Anchor your first song to a personal memory and mood in under 20 seconds.
        </p>
        <Link href="/create" passHref>
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
