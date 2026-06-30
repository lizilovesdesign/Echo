'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MusicNote01Icon, AddCircleIcon, BookOpen01Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import styles from './OnboardingOverlay.module.css';

const STEPS = [
  {
    icon: MusicNote01Icon,
    title: 'Welcome to Echo',
    description: 'Your private music journal. Search any song, anchor it to a memory and a mood, and build a permanent emotional archive — all in under 20 seconds.',
  },
  {
    icon: AddCircleIcon,
    title: 'Find & Save Songs',
    description: 'Search for any track from Spotify right inside Echo. Pick the song that matches the moment and save it to your entry with one tap.',
  },
  {
    icon: BookOpen01Icon,
    title: 'Tag Moods & Reflect',
    description: 'Choose a mood that captures the feeling, write your thoughts, and add stickers. Every entry becomes a vivid snapshot of how that song made you feel.',
  },
  {
    icon: CheckmarkCircle01Icon,
    title: 'Install Echo on Your Phone',
    description: '',
    isInstallStep: true,
  },
  {
    icon: CheckmarkCircle01Icon,
    title: 'You\'re All Set',
    description: 'Your timeline is ready. Start capturing the soundtrack of your life.',
  },
];

export function OnboardingOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      onDone();
      return;
    }
    setStep((s) => s + 1);
  }, [isLast, onDone]);

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} />

      <div className={styles.card}>
        <div className={styles.carousel}>
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${step * 100}%)` }}
          >
            {STEPS.map((s, idx) => (
              <div key={idx} className={styles.slide}>
                {s.isInstallStep ? (
                  <div className={styles.installContent}>
                    <div className={styles.iconCircle}>
                      <s.icon size={32} />
                    </div>
                    <h2 className={styles.installTitle}>Install Echo on Your Phone</h2>
                    <p className={styles.slideDescription}>
                      Add Echo to your home screen for quick access and the best experience.
                    </p>
                    <div className={styles.platformRow}>
                      <div className={styles.platformSection}>
                        <h3 className={styles.platformHeading}>iPhone / iPad</h3>
                        <ol className={styles.installSteps}>
                          <li className={styles.installStep}>Open this page in Safari</li>
                          <li className={styles.installStep}>Tap the Share icon at the bottom of the screen</li>
                          <li className={styles.installStep}>Scroll down and tap &ldquo;Add to Home Screen&rdquo;</li>
                          <li className={styles.installStep}>Tap &ldquo;Add&rdquo; in the top-right corner</li>
                        </ol>
                      </div>
                      <div className={styles.platformSection}>
                        <h3 className={styles.platformHeading}>Android</h3>
                        <ol className={styles.installSteps}>
                          <li className={styles.installStep}>Open this page in Chrome</li>
                          <li className={styles.installStep}>Tap the menu icon (⋮) in Chrome</li>
                          <li className={styles.installStep}>Tap &ldquo;Add to Home Screen&rdquo; or &ldquo;Install app&rdquo;</li>
                          <li className={styles.installStep}>Tap &ldquo;Add&rdquo; or &ldquo;Install&rdquo; in the dialog</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.iconCircle}>
                      <s.icon size={32} />
                    </div>
                    <h2 className={styles.slideTitle}>{s.title}</h2>
                    <p className={styles.slideDescription}>{s.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dots}>
          {STEPS.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${idx === step ? styles.dotActive : ''}`}
              onClick={() => setStep(idx)}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.nextBtn} onClick={goNext}>
            {isLast ? 'Start Journaling' : 'Next'}
          </button>
          {!isLast && (
            <button className={styles.skipBtn} onClick={onDone}>
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function OnboardingGate() {
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isWelcome) setShow(true);
  }, [isWelcome]);

  const handleDone = useCallback(() => {
    setShow(false);
    if (isWelcome) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [isWelcome]);

  if (!show) return null;

  return <OnboardingOverlay onDone={handleDone} />;
}
