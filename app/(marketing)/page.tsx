'use client';

import React from 'react';
import Link from 'next/link';
import { Sun, Moon, Music, ArrowRight } from 'lucide-react';
import { useTheme } from '../providers';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.container}>
      {/* Navigation Header */}
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

      {/* Main Hero Section */}
      <main className={styles.heroSection}>
        {/* Floating Song and Journal cards in corners (Fabric-inspired) */}
        
        {/* Top-Left: Song Cover Card */}
        <div className={`${styles.floatingCard} ${styles.topLeft}`}>
          <div className={styles.stampBorder}>
            <div className={styles.spotifyHeader}>
              <span className={styles.spotifyIcon}>🎧</span>
              <span className={styles.spotifyTag}>Verified Track</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop" 
              alt="Rose Quartz Album Cover" 
              className={styles.floatAlbumArt}
            />
            <div className={styles.floatTrackMeta}>
              <strong className={styles.floatTrackName}>Rose Quartz</strong>
              <span className={styles.floatArtistName}>Toro y Moi</span>
            </div>
          </div>
        </div>

        {/* Top-Right: Abstract Glowing Mood Card */}
        <div className={`${styles.floatingCard} ${styles.topRight}`}>
          <div className={styles.moodCard}>
            <div className={styles.moodHeader}>
              <span className={styles.moodEmoji}>🌊</span>
              <span className={styles.moodText}>Calm</span>
            </div>
            <p className={styles.moodExcerpt}>
              "Fast Car — Tracy Chapman. Reminds me of road trips with dad. The sunset was orange-yellow and warm."
            </p>
            <div className={styles.moodTime}>Just now</div>
          </div>
        </div>

        {/* Bottom-Left: Document/Journal snippet */}
        <div className={`${styles.floatingCard} ${styles.bottomLeft}`}>
          <div className={styles.journalClipping}>
            <div className={styles.clippingLine}></div>
            <div className={styles.clippingContent}>
              <div className={styles.clippingTitle}>
                <span>🌧️ Melancholic</span>
                <span className={styles.clippingTrack}>Ocean Eyes</span>
              </div>
              <p className={styles.clippingText}>
                Rainy Tuesday afternoon. Staring out the window, tracing water drops on the glass.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Tilted Album Card */}
        <div className={`${styles.floatingCard} ${styles.bottomRight}`}>
          <div className={styles.stampBorder}>
            <div className={styles.spotifyHeader}>
              <span className={styles.spotifyIcon}>⚡</span>
              <span className={styles.spotifyTag}>Active Mood</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop" 
              alt="Lost In Yesterday Album Cover" 
              className={styles.floatAlbumArt}
            />
            <div className={styles.floatTrackMeta}>
              <strong className={styles.floatTrackName}>Lost In Yesterday</strong>
              <span className={styles.floatArtistName}>Tame Impala</span>
            </div>
          </div>
        </div>

        {/* Central Content */}
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

      {/* Features Section */}
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

      {/* Footer */}
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
