import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

const TimelineFeed = dynamic(() => import('@/components/journal/TimelineFeed').then((m) => m.TimelineFeed), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <Spinner size="lg" />
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Your Timeline — Echo',
  description: 'View your private archive of music reflections and emotional anchors.',
};

export default function TimelinePage() {
  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Memories</h1>
        <p className={styles.subtitle}>A private archive of your music and feelings.</p>
      </header>
      
      <TimelineFeed />

      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
