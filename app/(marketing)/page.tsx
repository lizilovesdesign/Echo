'use client';

import React from 'react';
import Link from 'next/link';
import { Sun, Moon, Music, ArrowRight, Github, Twitter, Heart, ChevronUp } from 'lucide-react';
import { useTheme } from '../providers';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

const floatingEntries = [
  {
    mood: 'Calm',
    moodEmoji: '🌊',
    song: 'Rose Quartz',
    artist: 'Toro y Moi',
    note: 'Sunset drive home. Windows down. Everything felt okay.',
    position: 'topLeft',
  },
  {
    mood: 'Melancholic',
    moodEmoji: '🌧️',
    song: 'Ocean Eyes',
    artist: 'Billie Eilish',
    note: 'Rainy Tuesday. Tracing drops on the glass.',
    position: 'topRight',
  },
  {
    mood: 'Nostalgic',
    moodEmoji: '🍂',
    song: 'Fast Car',
    artist: 'Tracy Chapman',
    note: 'Road trips with dad. Warm amber sunset.',
    position: 'bottomLeft',
  },
  {
    mood: 'Energetic',
    moodEmoji: '⚡',
    song: 'Lost In Yesterday',
    artist: 'Tame Impala',
    note: 'That bass drop still hits the same.',
    position: 'bottomRight',
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Music className={styles.logoIcon} />
          <span>Echo</span>
        </div>

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
            Your life has a <br />
            <span className={styles.highlight}>soundtrack</span>
          </h1>

          <p className={styles.subtitle}>
            Anchor songs to memories. Capture the feeling in seconds.
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
        <div className={styles.footerWave} />
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <Music size={20} className={styles.footerLogoIcon} />
                <span>Echo</span>
              </div>
              <p className={styles.footerTagline}>
                Permanently archiving the soundtrack of your life.
              </p>
              <div className={styles.footerSocial}>
                <a href="#" className={styles.socialLink} aria-label="Twitter">
                  <Twitter size={16} />
                </a>
                <a href="#" className={styles.socialLink} aria-label="GitHub">
                  <Github size={16} />
                </a>
              </div>
            </div>

            <div className={styles.footerColumns}>
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Product</h4>
                <a href="#" className={styles.footerColLink}>Features</a>
                <a href="#" className={styles.footerColLink}>PWA Guide</a>
                <a href="#" className={styles.footerColLink}>Changelog</a>
              </div>
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Company</h4>
                <a href="#" className={styles.footerColLink}>About</a>
                <a href="#" className={styles.footerColLink}>Blog</a>
                <a href="#" className={styles.footerColLink}>Contact</a>
              </div>
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Legal</h4>
                <a href="#" className={styles.footerColLink}>Privacy</a>
                <a href="#" className={styles.footerColLink}>Terms</a>
                <a href="#" className={styles.footerColLink}>Cookies</a>
              </div>
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              &copy; {currentYear} Echo. Made with <Heart size={12} className={styles.heartIcon} /> for music lovers.
            </p>
            <div className={styles.footerTheme}>
              <button
                onClick={toggleTheme}
                className={styles.footerThemeBtn}
                aria-label="Switch theme"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
