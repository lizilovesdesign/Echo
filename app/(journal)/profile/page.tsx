import React from 'react';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Profile — Echo',
  description: 'Manage your Echo account and preferences.',
};

export default function ProfilePage() {
  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Your account and settings.</p>
      </header>

      <div className={styles.comingSoon}>
        <span className={styles.icon}>🎧</span>
        <p className={styles.message}>Profile settings coming soon.</p>
      </div>

      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
