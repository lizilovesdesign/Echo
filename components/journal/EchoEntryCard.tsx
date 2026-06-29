'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
    if (!entry.previewUrl && entry.spotifyTrackId) {
      window.open(`https://open.spotify.com/track/${entry.spotifyTrackId}`, '_blank', 'noopener');
      return;
    }
    toggle(entry.previewUrl, entry.spotifyTrackId);
  };

  const handleOpenSpotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://open.spotify.com/track/${entry.spotifyTrackId}`, '_blank', 'noopener');
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
            aria-label={entry.previewUrl ? (isPlaying ? 'Stop preview' : 'Play 30-second preview') : `Open ${entry.songTitle} on Spotify`}
          >
            <Image
              src={entry.albumArtUrl}
              alt={`Album cover of ${entry.songTitle}`}
              width={48}
              height={48}
              className={styles.albumArt}
            />
          </button>
          <div className={styles.trackDetails}>
            <div className={styles.titleRow}>
              <h4 className={styles.songTitle}>{entry.songTitle}</h4>
              {entry.spotifyTrackId && (
                <button
                  className={styles.spotifyLink}
                  onClick={handleOpenSpotify}
                  aria-label={`Open ${entry.songTitle} on Spotify`}
                  title="Open on Spotify"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                </button>
              )}
            </div>
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
