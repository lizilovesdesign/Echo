'use client';

import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Delete01Icon } from 'hugeicons-react';
import { MoodTag } from '@/lib/validators/echoEntry';
import { useEntryStore } from '@/lib/stores/entryStore';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handlePlayPreview = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
      return;
    }

    setPreviewError(false);

    let previewUrl = entry.previewUrl;

    if (!previewUrl) {
      setIsLoadingPreview(true);
      try {
        const res = await fetch(`/api/music/track/${entry.spotifyTrackId}`);
        if (!res.ok) {
          setIsLoadingPreview(false);
          setPreviewError(true);
          return;
        }
        const json = await res.json();
        previewUrl = json.data?.previewUrl;
        if (!previewUrl) {
          setIsLoadingPreview(false);
          setPreviewError(true);
          return;
        }
      } catch {
        setIsLoadingPreview(false);
        setPreviewError(true);
        return;
      } finally {
        setIsLoadingPreview(false);
      }
    }

    const audio = new Audio(previewUrl);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      audioRef.current = null;
    });
    audio.play().catch(() => {
      setIsPlaying(false);
      setPreviewError(true);
    });
    audioRef.current = audio;
    setIsPlaying(true);
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
            onClick={(e) => { e.stopPropagation(); handlePlayPreview(); }}
            disabled={isLoadingPreview}
            aria-label={isPlaying ? 'Stop preview' : 'Play preview'}
          >
            <img
              src={entry.albumArtUrl}
              alt={`Album cover of ${entry.songTitle}`}
              className={styles.albumArt}
            />
            <span className={`${styles.playOverlay} ${previewError ? styles.playOverlayError : ''}`}>
              {isLoadingPreview ? '⏳' : isPlaying ? '⏹' : previewError ? '⛔' : '▶'}
            </span>
          </button>
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
