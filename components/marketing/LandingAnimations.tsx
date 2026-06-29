'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import styles from '@/app/(marketing)/page.module.css';

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    rotate: custom,
    transition: { duration: 0.5, ease: 'easeOut' },
  }),
};

// ─── Hero Content Animator ────────────────────────────────────────────────

export function HeroAnimator({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={styles.heroContent}
    >
      {children}
    </motion.div>
  );
}

export function FadeUpItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: 'easeOut', delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Draggable Notebook Entry Card ────────────────────────────────────────
// Users can grab and toss cards with mouse or touch (whileDrag lifts the card).
// dragElastic + dragMomentum give it an organic, physical feel.

interface NotebookCardProps {
  mood: string;
  song: string;
  artist: string;
  note: string;
  tilt: number;
  delay: number;
  className?: string;
}

export function NotebookCard({
  mood,
  song,
  artist,
  note,
  tilt,
  delay,
  className,
}: NotebookCardProps) {
  return (
    <motion.div
      className={`${styles.notebookCard} ${className ?? ''}`}
      custom={tilt}
      initial="hidden"
      animate="visible"
      variants={cardReveal}
      transition={{ delay }}
      // ── Hover / touch lift ───────────────────────────────────────────────
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
    >
      <div className={styles.cardContent}>
        {/* Mood label — sits above the ruled-line zone */}
        <div className={styles.cardMood}>
          <span className={styles.cardMoodLabel}>{mood}</span>
        </div>

        {/* Song + artist — each element bottom-aligns with a ruled line */}
        <div className={styles.cardSong}>
          <span className={styles.cardSongTitle}>{song}</span>
          <span className={styles.cardArtist}>{artist}</span>
        </div>

        {/* Reflection note */}
        <p className={styles.cardNote}>&ldquo;{note}&rdquo;</p>
      </div>

      {/* Washi tape strip */}
      <div className={styles.cardTapeStrip} aria-hidden="true" />
    </motion.div>
  );
}

// ─── Scatter Gallery wrapper ──────────────────────────────────────────────

export function ScatterGallery({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className={styles.scatterGallery}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

// ─── Section scroll-reveal ────────────────────────────────────────────────

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: 'easeOut', delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Card Animator ────────────────────────────────────────────────

export function FeatureCardAnimator({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Illustration fade-in ─────────────────────────────────────────────────

export function IllustrationReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
