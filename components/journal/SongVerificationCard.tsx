'use client';

import React from 'react';
import { useEntryStore } from '@/lib/stores/entryStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import styles from './SongVerificationCard.module.css';

interface SongVerificationCardProps {
  onConfirm: () => void;
}

export function SongVerificationCard({ onConfirm }: SongVerificationCardProps) {
  const selectedTrack = useEntryStore((state) => state.selectedTrack);
  const clearEntry = useEntryStore((state) => state.clearEntry);

  if (!selectedTrack) return null;

  return (
    <Card className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={selectedTrack.albumArtUrl}
          alt={`Album art for ${selectedTrack.name} by ${selectedTrack.artist}`}
          className={styles.albumArt}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.trackName}>{selectedTrack.name}</h3>
        <p className={styles.artistName}>{selectedTrack.artist}</p>
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={clearEntry} className={styles.btn}>
          Search Again
        </Button>
        <Button variant="primary" onClick={onConfirm} className={styles.btn}>
          Use This Song
        </Button>
      </div>
    </Card>
  );
}
