import React from 'react';
import type { Metadata } from 'next';
import { TimelineFeed } from '@/components/journal/TimelineFeed';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Your Timeline — Echo',
  description: 'View your private archive of music reflections and emotional anchors.',
};

export default function TimelinePage() {
  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Your Timeline</h1>
        <p className={styles.subtitle}>A private archive of your music and feelings.</p>
      </header>
      
      <TimelineFeed />
    </div>
  );
}
