import React from 'react';
import Link from 'next/link';
import { MusicNote01Icon } from 'hugeicons-react';
import { HeroCta, FooterHeart } from '@/components/marketing/MarketingInteractive';
import {
  HeroAnimator,
  FadeUpItem,
  NotebookCard,
  ScatterGallery,
} from '@/components/marketing/LandingAnimations';
import styles from './page.module.css';

// ─── Echo Entry Notebook Cards ──────────────────────────────────────────────

const notebookCards = [
  {
    mood: 'Calm',
    song: 'Rose Quartz',
    artist: 'Toro y Moi',
    note: 'Sunset drive home. Windows down. Everything felt okay.',
    tilt: -4,
    delay: 0.05,
    position: 'card1',
  },
  {
    mood: 'Melancholic',
    song: 'Ocean Eyes',
    artist: 'Billie Eilish',
    note: 'Rainy Tuesday. Tracing drops on the glass.',
    tilt: 3,
    delay: 0.15,
    position: 'card2',
  },
  {
    mood: 'Nostalgic',
    song: 'Fast Car',
    artist: 'Tracy Chapman',
    note: 'Road trips with dad. Warm amber light.',
    tilt: -2.5,
    delay: 0.25,
    position: 'card3',
  },
  {
    mood: 'Energetic',
    song: 'Lost In Yesterday',
    artist: 'Tame Impala',
    note: 'That bass drop still hits the same.',
    tilt: 4,
    delay: 0.1,
    position: 'card4',
  },
];



// ─── Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>

      {/* ── 100 vh viewport: Nav + Hero ─────────────────────────────── */}
      <div className={styles.heroViewport}>

        {/* Ambient floating orbs */}
        <div className={styles.ambientOrbs} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orb1}`} />
          <span className={`${styles.orb} ${styles.orb2}`} />
          <span className={`${styles.orb} ${styles.orb3}`} />
        </div>

        {/* ── Nav ───────────────────────────────────────────────────── */}
        {/* Changes: removed Features and Journal nav links */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <MusicNote01Icon className={styles.logoIcon} />
            <span>Echo</span>
          </div>
          <div className={styles.actions}>
            <Link href="/login">
              <span className={styles.loginLink}>Log in</span>
            </Link>
          </div>
        </header>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <main className={styles.heroSection}>
          {/* Left hero column */}
          <HeroAnimator>
            <FadeUpItem delay={0}>
              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} aria-hidden="true" />
                <span>Private Music Journal</span>
              </div>
            </FadeUpItem>

            <FadeUpItem delay={0.08}>
              <h1 className={styles.title}>
                Your life has a<br />
                <span className={styles.highlight}>soundtrack.</span>
              </h1>
            </FadeUpItem>

            <FadeUpItem delay={0.18}>
              <p className={styles.subtitle}>
                Anchor songs to memories. Capture the feeling in under 20 seconds.
                A strictly private emotional archive — yours forever.
              </p>
            </FadeUpItem>

            <FadeUpItem delay={0.28}>
              <div className={styles.ctaGroup}>
                <HeroCta />
              </div>
            </FadeUpItem>
          </HeroAnimator>

          {/* Right scattered draggable notebook cards */}
          <ScatterGallery>
            {notebookCards.map((card, i) => (
              <NotebookCard
                key={i}
                mood={card.mood}
                song={card.song}
                artist={card.artist}
                note={card.note}
                tilt={card.tilt}
                delay={card.delay}
                className={styles[card.position]}
              />
            ))}
          </ScatterGallery>
        </main>

        {/* Scroll-hint chevron */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollChevron} />
        </div>

      </div>

      {/* Features section removed — 100vh single screen design */}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.notesContainer} aria-hidden="true">
          {['♪', '♫', '♩', '♬', '♪', '♫'].map((note, i) => (
            <span key={i} className={`${styles.floatingNote} ${styles[`note${i + 1}`]}`}>
              {note}
            </span>
          ))}
        </div>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <MusicNote01Icon size={20} className={styles.footerLogoIcon} />
              <span>Echo</span>
            </div>
          </div>
          <p className={styles.footerCopyright}>
            &copy; {currentYear} Echo. Made with <FooterHeart /> for music lovers.
          </p>
        </div>
      </footer>
    </div>
  );
}
