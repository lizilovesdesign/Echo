'use client';

import React from 'react';
import { MoodTag } from '@/lib/validators/echoEntry';
import { getMoodConfig } from '@/lib/moods';
import styles from './MoodBubble.module.css';

interface MoodBubbleProps {
  mood: MoodTag;
  isSelected: boolean;
  onSelect: (mood: MoodTag) => void;
}

export function MoodBubble({ mood, isSelected, onSelect }: MoodBubbleProps) {
  const config = getMoodConfig(mood);

  const inlineStyle: React.CSSProperties = isSelected
    ? {
        borderColor: config?.bubbleBgHover ?? 'currentColor',
        color: config?.bubbleText ?? 'inherit',
        backgroundColor: config?.bubbleBg ?? 'transparent',
      }
    : {};

  return (
    <button
      type="button"
      className={styles.bubble}
      onClick={() => onSelect(mood)}
      aria-pressed={isSelected}
      style={inlineStyle}
    >
      <span className={styles.emoji}>{config?.emoji}</span>
      <span>{config?.label}</span>
    </button>
  );
}
