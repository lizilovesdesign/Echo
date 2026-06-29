import React from 'react';
import Link from 'next/link';
import { MusicNote01Icon } from 'hugeicons-react';
import { ThemeToggle, FooterThemeButton, HeroCta, FooterHeart } from '@/components/marketing/MarketingInteractive';
import {
  HeroAnimator,
  FadeUpItem,
  NotebookCard,
  ScatterGallery,
  ScrollReveal,
  FeatureCardAnimator,
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

// ─── Feature Items ────────────────────────────────────────────────────────

const features = [
  {
    icon: '🔒',
    title: 'Absolute Privacy',
    description: 'No feeds, no likes, no profiles. Your memories belong strictly and entirely to you.',
  },
  {
    icon: '⚡',
    title: '20-Second Capture',
    description: 'An optimized flow to catalogue a feeling, anchor a song, and save the moment instantly.',
  },
  {
    icon: '💭',
    title: 'Musical Time Capsule',
    description: 'Every entry freezes a moment — revisit who you were through the songs that defined it.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.container}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      {/* Changes: removed Features and Journal nav links */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <MusicNote01Icon className={styles.logoIcon} />
          <span>Echo</span>
        </div>
        <div className={styles.actions}>
          <ThemeToggle />
          <Link href="/login">
            <span className={styles.loginLink}>Log in</span>
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
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

      {/* ── Features ──────────────────────────────────────────────────── */}
      {/* Changes: removed border on cards, removed ::before accent strip */}
      <section id="features" className={styles.featuresSection} aria-labelledby="features-heading">
        <ScrollReveal className={styles.sectionHeader}>
          <h2 id="features-heading">Why Echo?</h2>
          <p>Strictly private, designed to capture reflections instantaneously.</p>
        </ScrollReveal>

        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <FeatureCardAnimator key={i} delay={i * 0.12}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </FeatureCardAnimator>
          ))}
        </div>
      </section>

      {/* Bottom CTA section removed per user request */}

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
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <MusicNote01Icon size={20} className={styles.footerLogoIcon} />
                <span>Echo</span>
              </div>
              <p className={styles.footerTagline}>
                Permanently archiving the soundtrack of your life.
              </p>
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              &copy; {currentYear} Echo. Made with <FooterHeart /> for music lovers.
            </p>
            <div className={styles.footerTheme}>
              <FooterThemeButton />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
