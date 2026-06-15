'use client';

import React from 'react';
import Link from 'next/link';
import { Sun, Moon, Music, ArrowRight } from 'lucide-react';
import { useTheme } from '../providers';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

const floatingEntries = [
  {
    mood: 'Calm',
    moodEmoji: '🌊',
    song: 'Rose Quartz',
    artist: 'Toro y Moi',
    note: 'Sunset drive home. Windows down. Felt like everything was going to be okay.',
    position: 'topLeft',
  },
  {
    mood: 'Melancholic',
    moodEmoji: '🌧️',
    song: 'Ocean Eyes',
    artist: 'Billie Eilish',
    note: 'Rainy Tuesday. Tracing water drops on the glass. Missing someone.',
    position: 'topRight',
  },
  {
    mood: 'Nostalgic',
    moodEmoji: '🍂',
    song: 'Fast Car',
    artist: 'Tracy Chapman',
    note: 'Road trips with dad. The sunset was orange-yellow and warm.',
    position: 'bottomLeft',
  },
  {
    mood: 'Energetic',
    moodEmoji: '⚡',
    song: 'Lost In Yesterday',
    artist: 'Tame Impala',
    note: 'Pre-game playlist. That bass drop still hits the same.',
    position: 'bottomRight',
  },
  {
    mood: 'Calm',
    moodEmoji: '🌊',
    song: 'Holocene',
    artist: 'Bon Iver',
    note: 'Early morning coffee. Frost on the window. Silence.',
    position: 'midLeft',
  },
  {
    mood: 'Nostalgic',
    moodEmoji: '🍂',
    song: 'Ribs',
    artist: 'Lorde',
    note: 'Late summer night. Driving with no destination.',
    position: 'midRight',
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Music className={styles.logoIcon} />
          <span>Echo</span>
          <span className={styles.beta}>Beta</span>
        </div>

        <nav className={styles.navLinks}>
          <a href="#features" className={styles.link}>Features</a>
          <a href="#privacy" className={styles.link}>Privacy</a>
          <a href="#download" className={styles.link}>Download</a>
        </nav>

        <div className={styles.actions}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link href="/login" passHref>
            <span className={styles.loginLink}>Log in</span>
          </Link>

          <Link href="/login" passHref>
            <Button size="sm" variant="primary" className={styles.getStartedBtn}>
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className={styles.heroSection}>
        {floatingEntries.map((entry, i) => (
          <div
            key={i}
            className={`${styles.floatingCard} ${styles[entry.position]}`}
          >
            <div className={styles.entryCard}>
              <div className={styles.entryMood}>
                <span>{entry.moodEmoji}</span>
                <span className={styles.entryMoodLabel}>{entry.mood}</span>
              </div>
              <div className={styles.entrySong}>
                <span className={styles.entrySongTitle}>{entry.song}</span>
                <span className={styles.entryArtist}>{entry.artist}</span>
              </div>
              <p className={styles.entryNote}>{entry.note}</p>
            </div>
          </div>
        ))}

        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            One home for <br />
            <span className={styles.highlight}>your emotional soundtrack</span>
          </h1>

          <p className={styles.subtitle}>
            A private, distraction-free space to anchor songs to personal memories and moods.
            Build your permanent emotional archive in under 20 seconds.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/login" passHref>
              <Button size="md" variant="primary" className={styles.heroCta}>
                Get Echo Free <ArrowRight size={16} className={styles.arrow} />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>Why Echo?</h2>
          <p>Strictly private, designed to capture reflections instantaneously.</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>Absolute Privacy</h3>
            <p>No social feeds, likes, or profiles. Your memories and listening patterns belong strictly to you.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>20-Second Capture</h3>
            <p>A optimized workflow to catalog a feeling, associate the soundtrack, and save the memory instantly.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🎵</div>
            <h3>Spotify Verification</h3>
            <p>Every song is searched and verified against Spotify Web API metadata to preserve accuracy.</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <Music className={styles.logoIcon} />
              <span>Echo</span>
            </div>
            <p className={styles.footerTagline}>Permanently archiving the soundtrack of your life.</p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.linkGroup}>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#download">Mobile Client</a>
              <a href="#changelog">Changelog</a>
            </div>
            <div className={styles.linkGroup}>
              <h4>Security</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#audits">Data Portability</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Echo Inc. All rights reserved. Strictly private.</p>
          <div className={styles.footerTheme}>
            <span>Theme:</span>
            <button onClick={toggleTheme} className={styles.footerThemeBtn}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
