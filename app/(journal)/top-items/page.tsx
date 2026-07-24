import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

const TopItemsView = dynamic(() => import('@/components/journal/TopItemsView').then((m) => m.TopItemsView), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <Spinner size="lg" />
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Your Top Items — Echo',
  description: 'See your most-listened artists, songs, and albums from Spotify.',
};

export default function TopItemsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Your Top Items</h1>
        <p className={styles.subtitle}>Artists, songs, and albums you listen to most.</p>
      </header>

      <TopItemsView />

      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
