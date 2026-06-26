import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { UserGreeting } from '@/components/shared/UserGreeting';
import { WeekCalendarStrip } from '@/components/shared/WeekCalendarStrip';
import { HomeRecentEchoes } from '@/components/journal/HomeRecentEchoes';
import { JournalPrompts } from '@/components/journal/JournalPrompts';
import styles from './page.module.css';

const OnboardingGate = dynamic(() => import('@/components/journal/OnboardingOverlay').then((m) => m.OnboardingGate), {
  ssr: false,
  loading: () => null,
});

const NowPlaying = dynamic(() => import('@/components/journal/NowPlaying').then((m) => m.NowPlaying), {
  ssr: false,
  loading: () => null,
});

export const metadata: Metadata = {
  title: 'Home — Echo',
  description: 'Your private music and mood journal. Anchor songs to memories, track your emotional journey.',
};

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={null}>
        <OnboardingGate />
      </Suspense>

      {/* Welcome header: name + avatar */}
      <UserGreeting />

      {/* 7-day week calendar strip */}
      <WeekCalendarStrip />

      {/* Currently playing / listening habits */}
      <NowPlaying />

      {/* 3 most recent echoes */}
      <HomeRecentEchoes />

      {/* Journaling prompt cards */}
      <JournalPrompts />

      {/* Bottom padding so content clears the fixed nav bar */}
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
