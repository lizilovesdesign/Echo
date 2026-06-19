'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Delete01Icon } from 'hugeicons-react';
import { MoodTag } from '@/lib/validators/echoEntry';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import styles from './EchoEntryCard.module.css';

export interface EchoEntryData {
  id: string;
  songTitle: string;
  artist: string;
  albumArtUrl: string;
  spotifyTrackId: string;
  moodTag: MoodTag;
  note: string;
  createdAt: string;
}

interface EchoEntryCardProps {
  entry: EchoEntryData;
}

const moodEmojis: Record<MoodTag, string> = {
  Nostalgic: '🍂',
  Energetic: '⚡',
  Melancholic: '🌧️',
  Calm: '🌊',
};

export function EchoEntryCard({ entry }: EchoEntryCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/echoes/${entry.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete Echo entry');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['echoes'] });
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this memory?')) {
      deleteMutation.mutate();
    }
  };

  const timeAgo = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });

  return (
    <Card className={`${styles.card} ${deleteMutation.isPending ? styles.deleting : ''}`}>
      <div className={styles.header}>
        <div className={styles.songInfo}>
          <img
            src={entry.albumArtUrl}
            alt={`Album cover of ${entry.songTitle}`}
            className={styles.albumArt}
          />
          <div className={styles.trackDetails}>
            <h4 className={styles.songTitle}>{entry.songTitle}</h4>
            <p className={styles.artist}>{entry.artist}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
          disabled={deleteMutation.isPending}
          aria-label="Delete entry"
        >
          <Delete01Icon size={16} />
        </button>
      </div>

      <div className={styles.metaRow}>
        <div className={`${styles.moodTag} ${styles[entry.moodTag]}`}>
          <span>{moodEmojis[entry.moodTag]}</span>
          <span>{entry.moodTag}</span>
        </div>
        <span className={styles.timestamp}>{timeAgo}</span>
      </div>

      {entry.note && <p className={styles.note}>{entry.note}</p>}
    </Card>
  );
}
