import React from 'react';
import type { Metadata } from 'next';
import { UserGreeting } from '@/components/shared/UserGreeting';
import { WeekCalendarStrip } from '@/components/shared/WeekCalendarStrip';
import { HomeRecentEchoes } from '@/components/journal/HomeRecentEchoes';
import { JournalPrompts } from '@/components/journal/JournalPrompts';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Home — Echo',
  description: 'Your private music and mood journal. Anchor songs to memories, track your emotional journey.',
};

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Welcome header: name + avatar */}
      <UserGreeting />

      {/* 7-day week calendar strip */}
      <WeekCalendarStrip />

      {/* 3 most recent echoes */}
      <HomeRecentEchoes />

      {/* Journaling prompt cards */}
      <JournalPrompts />

      {/* Bottom padding so content clears the fixed nav bar */}
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
