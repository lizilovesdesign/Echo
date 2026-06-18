'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEntryStore } from '@/lib/stores/entryStore';
import { MoodTag } from '@/lib/validators/echoEntry';
import { MoodSelector } from './MoodSelector';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import styles from './EchoEntryForm.module.css';

export function EchoEntryForm() {
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');
  const selectedTrack = useEntryStore((state) => state.selectedTrack);
  const clearEntry = useEntryStore((state) => state.clearEntry);

  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: { moodTag: MoodTag; note: string }) => {
      const res = await fetch('/api/echoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songTitle: selectedTrack?.name,
          artist: selectedTrack?.artist,
          albumArtUrl: selectedTrack?.albumArtUrl,
          spotifyTrackId: selectedTrack?.id,
          moodTag: payload.moodTag,
          note: payload.note,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to save Echo entry');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['echoes'] });
      clearEntry();
      router.push('/home');
    },
    onError: (err: any) => {
      setValidationError(err.message || 'An error occurred. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedMood) {
      setValidationError('Please select a mood that matches your reflection.');
      return;
    }

    mutation.mutate({ moodTag: selectedMood, note });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <MoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />

      <div className={styles.textareaWrapper}>
        <label htmlFor="reflection-note" className={styles.label}>
          Write a memory or reflection (optional)
        </label>
        <textarea
          id="reflection-note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))} // Strictly enforce length limit
          maxLength={500}
          placeholder="What memories does this song bring up? How do you feel right now?"
          className={styles.textarea}
        />
        <div className={styles.counterRow}>
          {validationError && <span className={styles.error}>{validationError}</span>}
          <span className={styles.counter}>{note.length} / 500</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={clearEntry}
          disabled={mutation.isPending}
          className={styles.actionBtn}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={mutation.isPending}
          className={styles.actionBtn}
        >
          {mutation.isPending ? (
            <>
              <Spinner size="sm" className={styles.spinner} />
              Saving memory...
            </>
          ) : (
            'Save Echo'
          )}
        </Button>
      </div>
    </form>
  );
}
