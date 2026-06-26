'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Delete01Icon } from 'hugeicons-react';
import { MoodTag } from '@/lib/validators/echoEntry';
import { useEntryStore } from '@/lib/stores/entryStore';
import { useAudioPreview } from '@/lib/hooks/useAudioPreview';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import styles from './EchoEntryCard.module.css';

export interface EchoEntryData {
  id: string;
  songTitle: string;
  artist: string;
  albumArtUrl: string;
  spotifyTrackId: string;
  previewUrl: string | null;
  entryType: string;
  albumName: string | null;
  spotifyAlbumId: string | null;
  moodTag: MoodTag;
  note: string;
  stickers: string[];
  createdAt: string;
}

interface EchoEntryCardProps {
  entry: EchoEntryData;
}

export function EchoEntryCard({ entry }: EchoEntryCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const prefillFromEntry = useEntryStore((state) => state.prefillFromEntry);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isPlaying, isLoading, hasError, toggle } = useAudioPreview();

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

  const handleCardClick = () => {
    prefillFromEntry({
      id: entry.id,
      songTitle: entry.songTitle,
      artist: entry.artist,
      albumArtUrl: entry.albumArtUrl,
      spotifyTrackId: entry.spotifyTrackId,
      previewUrl: entry.previewUrl,
      entryType: entry.entryType,
      albumName: entry.albumName,
      spotifyAlbumId: entry.spotifyAlbumId,
      moodTag: entry.moodTag,
      note: entry.note,
      stickers: entry.stickers ?? [],
    });
    router.push('/create');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    deleteMutation.mutate();
  };

  const handlePlayPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(entry.previewUrl, entry.spotifyTrackId);
  };

  const timeAgo = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });

  return (
    <Card
      className={`${styles.card} ${deleteMutation.isPending ? styles.deleting : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
    >
      <div className={styles.header}>
        <div className={styles.songInfo}>
          <button
            className={styles.albumArtBtn}
            onClick={handlePlayPreview}
            disabled={isLoading}
            aria-label={isPlaying ? 'Stop preview' : 'Play preview'}
          >
            <img
              src={entry.albumArtUrl}
              alt={`Album cover of ${entry.songTitle}`}
              className={styles.albumArt}
            />
            <span className={`${styles.playOverlay} ${hasError ? styles.playOverlayError : ''}`}>
              {isLoading ? '⏳' : isPlaying ? '⏹' : hasError ? '⛔' : '▶'}
            </span>
          </button>
          <div className={styles.trackDetails}>
            <h4 className={styles.songTitle}>{entry.songTitle}</h4>
            <p className={styles.artist}>{entry.artist}</p>
            {entry.entryType === 'album' && (
              <span className={styles.albumBadge}>Album</span>
            )}
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
        <div className={styles.stickersRow}>
          {entry.stickers?.map((st, idx) => (
            <span key={idx} className={styles.stickerEmoji}>{st}</span>
          ))}
        </div>
        <span className={styles.timestamp}>{timeAgo}</span>
      </div>

      {entry.note && <p className={styles.note}>{entry.note}</p>}

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete memory?"
      >
        <p className={styles.deleteWarning}>
          This will permanently remove this entry from your timeline. This action cannot be undone.
        </p>
        <div className={styles.deleteActions}>
          <button
            className={styles.cancelBtn}
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </Card>
  );
}
