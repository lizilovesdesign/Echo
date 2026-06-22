'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEntryStore } from '@/lib/stores/entryStore';
import { MoodTag } from '@/lib/validators/echoEntry';
import { SongSearchInput } from './SongSearchInput';
import { MoodSelector } from './MoodSelector';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import styles from './EchoEntryForm.module.css';

const STICKER_EMOJIS = ['🌟', '❤️', '🎶', '💭', '🔥', '✨', '🌸', '🎵'];

export function EchoEntryForm() {
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [stickers, setStickers] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchParams = useSearchParams();
  const promptId = searchParams.get('prompt');

  const PROMPT_QUESTIONS: Record<string, string> = {
    reflect: 'What song has been living in your head today?',
    intentions: 'What feeling do you want to soundtrack right now?',
    memory: 'Which song teleports you to a specific moment?',
    gratitude: 'Name a track that always lifts your spirit.',
  };

  const selectedTrack = useEntryStore((state) => state.selectedTrack);
  const storeNote = useEntryStore((state) => state.note);
  const storeMoodTag = useEntryStore((state) => state.moodTag);
  const storeStickers = useEntryStore((state) => state.stickers);
  const editingEntryId = useEntryStore((state) => state.editingEntryId);
  const clearEntry = useEntryStore((state) => state.clearEntry);

  useEffect(() => {
    if (storeNote) setNote(storeNote);
    if (storeMoodTag) setSelectedMood(storeMoodTag);
    if (storeStickers.length > 0) setStickers(storeStickers);
  }, []);

  useEffect(() => {
    if (promptId && PROMPT_QUESTIONS[promptId] && !storeNote) {
      setNote(PROMPT_QUESTIONS[promptId]);
    }
  }, [promptId]);

  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: { moodTag: MoodTag; note: string }) => {
      const isEditing = !!editingEntryId;
      const url = isEditing ? `/api/echoes/${editingEntryId}` : '/api/echoes';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle: selectedTrack?.name,
          artist: selectedTrack?.artist,
          albumArtUrl: selectedTrack?.albumArtUrl,
          spotifyTrackId: selectedTrack?.id,
          previewUrl: selectedTrack?.previewUrl ?? null,
          moodTag: payload.moodTag,
          note: payload.note,
          stickers,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || 'Failed to save Echo entry');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['echoes'] });
      clearEntry();
      router.push('/home');
    },
    onError: (err: Error) => {
      setValidationError(err.message || 'An error occurred. Please try again.');
    },
  });

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPreview = () => {
    if (!selectedTrack?.previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(selectedTrack.previewUrl);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedTrack) {
      setValidationError('Please select a song before saving.');
      return;
    }

    if (!selectedMood) {
      setValidationError('Please select a mood.');
      return;
    }

    mutation.mutate({ moodTag: selectedMood, note });
  };

  const handleCancel = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    clearEntry();
    router.push('/home');
  };

  const addSticker = (emoji: string) => {
    if (stickers.length < 5) {
      setStickers((prev) => [...prev, emoji]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleCancel}>
          ←
        </button>
        <h1 className={styles.headerTitle}>{editingEntryId ? 'Edit Echo' : 'New Echo'}</h1>
      </header>

      <div className={styles.songSection}>
        {!selectedTrack ? (
          <SongSearchInput />
        ) : (
          <div className={styles.selectedTrack}>
            <img src={selectedTrack.albumArtUrl} alt="" className={styles.trackArt} />
            <div className={styles.trackInfo}>
              <span className={styles.trackName}>{selectedTrack.name}</span>
              <span className={styles.trackArtist}>{selectedTrack.artist}</span>
            </div>
            {selectedTrack.previewUrl && (
              <button
                type="button"
                className={styles.playBtn}
                onClick={handlePlayPreview}
                aria-label={isPlaying ? 'Stop preview' : 'Play preview'}
              >
                {isPlaying ? '⏹' : '▶'}
              </button>
            )}
            <button type="button" className={styles.clearTrack} onClick={clearEntry}>
              ×
            </button>
          </div>
        )}
      </div>

      <MoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />

      <div className={styles.stickyNote}>
        {stickers.length > 0 && (
          <div className={styles.stickersContainer}>
            {stickers.map((st, idx) => (
              <span key={idx} className={styles.sticker}>{st}</span>
            ))}
          </div>
        )}
        <textarea
          className={styles.noteTextarea}
          placeholder="What memories does this song bring up? How do you feel right now?"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          maxLength={500}
        />
        <div className={styles.counter}>{note.length} / 500</div>
      </div>

      <div className={styles.stickersSection}>
        <span className={styles.stickersLabel}>Stickers</span>
        <div className={styles.stickersRow}>
          {STICKER_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={styles.stickerBtn}
              onClick={() => addSticker(emoji)}
              disabled={stickers.length >= 5}
            >
              {emoji}
            </button>
          ))}
          {stickers.length > 0 && (
            <button
              type="button"
              className={styles.clearStickers}
              onClick={() => setStickers([])}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {validationError && <p className={styles.error}>{validationError}</p>}

      <Button
        type="submit"
        variant="primary"
        disabled={mutation.isPending}
        className={styles.saveBtn}
      >
        {mutation.isPending ? (
          <>
            <Spinner size="sm" />
            Saving memory...
          </>
        ) : (
          'Save Echo'
        )}
      </Button>
    </form>
  );
}
