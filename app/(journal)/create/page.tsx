'use client';

import React, { useState, useEffect } from 'react';
import { useEntryStore } from '@/lib/stores/entryStore';
import { SongSearchInput } from '@/components/journal/SongSearchInput';
import { SongVerificationCard } from '@/components/journal/SongVerificationCard';
import { EchoEntryForm } from '@/components/journal/EchoEntryForm';
import styles from './page.module.css';

export default function CreateEntryPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const selectedTrack = useEntryStore((state) => state.selectedTrack);

  // If the selected track is cleared, reset confirmation state
  useEffect(() => {
    if (!selectedTrack) {
      setIsConfirmed(false);
    }
  }, [selectedTrack]);

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>New Echo</h1>
        <p className={styles.subtitle}>
          {!selectedTrack
            ? 'Search for the song playing in your mind.'
            : !isConfirmed
            ? 'Confirm this is the track you want to anchor.'
            : 'Capture the feeling and memory.'}
        </p>
      </header>

      <div className={styles.canvas}>
        {!selectedTrack ? (
          <SongSearchInput />
        ) : !isConfirmed ? (
          <SongVerificationCard onConfirm={() => setIsConfirmed(true)} />
        ) : (
          <div className={styles.formContainer}>
            <div className={styles.trackSnippet}>
              <img
                src={selectedTrack.albumArtUrl}
                alt={selectedTrack.name}
                className={styles.snippetArt}
              />
              <div className={styles.snippetDetails}>
                <span className={styles.snippetTitle}>{selectedTrack.name}</span>
                <span className={styles.snippetArtist}>{selectedTrack.artist}</span>
              </div>
            </div>
            <EchoEntryForm />
          </div>
        )}
      </div>
    </div>
  );
}
