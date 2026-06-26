import React from 'react';
import Link from 'next/link';
import styles from './JournalPrompts.module.css';

interface Prompt {
  id: string;
  emoji: string;
  title: string;
  question: string;
}

const PROMPTS: Prompt[] = [
  {
    id: 'reflect',
    emoji: '🌱',
    title: 'Pause & reflect',
    question: 'What song has been living in your head today?',
  },
  {
    id: 'intentions',
    emoji: '☀️',
    title: 'Set intentions',
    question: 'What feeling do you want to soundtrack right now?',
  },
  {
    id: 'memory',
    emoji: '🎞️',
    title: 'Capture a memory',
    question: 'Which song teleports you to a specific moment?',
  },
  {
    id: 'gratitude',
    emoji: '💫',
    title: 'Express gratitude',
    question: 'Name a track that always lifts your spirit.',
  },
];

export function JournalPrompts() {
  return (
    <section className={styles.section} aria-label="Journal prompts">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Quick Journal</h2>
      </div>

      <div className={styles.scrollContainer}>
        <div className={styles.promptList}>
          {PROMPTS.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/create?prompt=${prompt.id}`}
              className={styles.promptCard}
              aria-label={`Start: ${prompt.title}`}
            >
              <span className={styles.emoji} aria-hidden="true">
                {prompt.emoji}
              </span>
              <h3 className={styles.promptTitle}>{prompt.title}</h3>
              <p className={styles.promptQuestion}>{prompt.question}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
