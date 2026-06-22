import { MoodTag } from './validators/echoEntry';

export interface MoodConfig {
  tag: MoodTag;
  emoji: string;
  label: string;
  bubbleBg: string;
  bubbleBgHover: string;
  bubbleText: string;
  pillInactiveBg: string;
  pillInactiveColor: string;
  pillActiveBg: string;
  pillActiveColor: string;
}

export const MOODS: MoodConfig[] = [
  {
    tag: 'Nostalgic',
    emoji: '🍂',
    label: 'Nostalgic',
    bubbleBg: 'hsl(37, 100%, 72%)',
    bubbleBgHover: 'hsl(37, 100%, 62%)',
    bubbleText: 'hsl(25, 90%, 12%)',
    pillInactiveBg: 'rgba(230, 92, 0, 0.08)',
    pillInactiveColor: 'hsl(24, 100%, 40%)',
    pillActiveBg: 'rgba(230, 92, 0, 0.12)',
    pillActiveColor: 'hsl(24, 100%, 40%)',
  },
  {
    tag: 'Energetic',
    emoji: '⚡',
    label: 'Energetic',
    bubbleBg: 'hsl(45, 100%, 65%)',
    bubbleBgHover: 'hsl(45, 100%, 55%)',
    bubbleText: 'hsl(32, 95%, 10%)',
    pillInactiveBg: 'rgba(255, 193, 7, 0.10)',
    pillInactiveColor: 'hsl(45, 100%, 30%)',
    pillActiveBg: 'rgba(255, 193, 7, 0.15)',
    pillActiveColor: 'hsl(45, 100%, 30%)',
  },
  {
    tag: 'Melancholic',
    emoji: '🌧️',
    label: 'Melancholic',
    bubbleBg: 'hsl(270, 75%, 78%)',
    bubbleBgHover: 'hsl(270, 75%, 68%)',
    bubbleText: 'hsl(271, 80%, 15%)',
    pillInactiveBg: 'rgba(142, 45, 226, 0.08)',
    pillInactiveColor: 'hsl(270, 70%, 45%)',
    pillActiveBg: 'rgba(142, 45, 226, 0.12)',
    pillActiveColor: 'hsl(270, 70%, 45%)',
  },
  {
    tag: 'Calm',
    emoji: '🌊',
    label: 'Calm',
    bubbleBg: 'hsl(210, 85%, 72%)',
    bubbleBgHover: 'hsl(210, 85%, 62%)',
    bubbleText: 'hsl(217, 70%, 12%)',
    pillInactiveBg: 'rgba(77, 150, 230, 0.08)',
    pillInactiveColor: 'var(--color-primary)',
    pillActiveBg: 'rgba(77, 150, 230, 0.12)',
    pillActiveColor: 'var(--color-primary)',
  },
];

export const MOOD_ORDER: MoodTag[] = MOODS.map((m) => m.tag);

export function getMoodConfig(tag: MoodTag): MoodConfig | undefined {
  return MOODS.find((m) => m.tag === tag);
}
