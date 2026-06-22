'use client';

import React from 'react';
import { MoodTag } from '@/lib/validators/echoEntry';
import styles from './MoodBubble.module.css';

interface MoodBubbleProps {
  mood: MoodTag;
  isSelected: boolean;
  onSelect: (mood: MoodTag) => void;
}

const moodEmojis: Record<MoodTag, string> = {
  Nostalgic: '🍂',
  Energetic: '⚡',
  Melancholic: '🌧️',
  Calm: '🌊',
};

export function MoodBubble({ mood, isSelected, onSelect }: MoodBubbleProps) {
  const moodKey = mood.toLowerCase() as keyof typeof styles;
  const moodClass = styles[moodKey] || '';
  const componentClass = `${styles.bubble} ${moodClass} ${isSelected ? styles.selected : styles.inactive}`.trim();

  return (
    <button
      type="button"
      className={componentClass}
      onClick={() => onSelect(mood)}
      aria-pressed={isSelected}
    >
      <span className={styles.emoji}>{moodEmojis[mood]}</span>
      <span>{mood}</span>
    </button>
  );
}
