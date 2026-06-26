'use client';

import React, { useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import styles from '@/app/(marketing)/page.module.css';

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 30, rotate: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    rotate: custom,
    transition: { type: 'spring', stiffness: 60, damping: 14, mass: 1 },
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
        hidden: { opacity: 0, y: 32 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 80, damping: 18, delay },
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
  const constraintsRef = useRef(null);

  return (
    <motion.div
      className={`${styles.notebookCard} ${className ?? ''}`}
      custom={tilt}
      initial="hidden"
      animate="visible"
      variants={cardReveal}
      transition={{ delay }}
      // ── Drag ──────────────────────────────────────────────────────────────
      drag
      dragMomentum
      dragElastic={0.18}
      whileDrag={{
        scale: 1.06,
        rotate: tilt + 1.5,
        zIndex: 50,
        boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
        cursor: 'grabbing',
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      }}
      // ── Hover (non-drag) ─────────────────────────────────────────────────
      whileHover={{
        y: -8,
        scale: 1.02,
        rotate: tilt * 0.4,
        transition: { type: 'spring', stiffness: 180, damping: 18 },
      }}
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      {/* Ruled lines — background gradient approach so lines are always behind text */}
      <div className={styles.cardRuledLines} aria-hidden="true" />

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
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 48 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 70, damping: 16, delay },
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
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 70, damping: 16, delay }}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 200, damping: 20 } }}
    >
      {children}
    </motion.div>
  );
}

// ─── Illustration fade-in ─────────────────────────────────────────────────

export function IllustrationReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: 'spring', stiffness: 60, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}
