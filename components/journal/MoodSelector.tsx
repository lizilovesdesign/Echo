'use client';

import React from 'react';
import { MoodTag } from '@/lib/validators/echoEntry';
import { MoodBubble } from './MoodBubble';
import styles from './MoodSelector.module.css';

interface MoodSelectorProps {
  selectedMood: MoodTag | null;
  onSelectMood: (mood: MoodTag) => void;
}

const moods: MoodTag[] = ['Calm', 'Melancholic', 'Nostalgic', 'Energetic'];

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>How does this song make you feel?</span>
      <div className={styles.grid}>
        {moods.map((mood) => (
          <MoodBubble
            key={mood}
            mood={mood}
            isSelected={selectedMood === mood}
            onSelect={onSelectMood}
          />
        ))}
      </div>
    </div>
  );
}
