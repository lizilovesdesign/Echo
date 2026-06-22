'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MusicNote01Icon, AddCircleIcon, BookOpen01Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import styles from './OnboardingOverlay.module.css';

const ONBOARDING_KEY = 'echo::onboarding-done';

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

function getInstallInstructions(): { title: string; steps: string[] } | null {
  if (typeof window === 'undefined') return null;
  if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone) {
    return { title: 'Echo is already installed', steps: ['You\'re using the installed app. Open it anytime from your home screen.'] };
  }
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) {
    return {
      title: 'Add to Home Screen — iPhone / iPad',
      steps: [
        'Open Safari (other browsers may not support this).',
        'Tap the Share button at the bottom of the screen.',
        'Scroll down and tap "Add to Home Screen".',
        'Tap "Add" in the top-right corner.',
        'Find Echo on your home screen and enjoy the full experience.',
      ],
    };
  }
  if (/Android/.test(ua)) {
    return {
      title: 'Add to Home Screen — Android',
      steps: [
        'Open Chrome.',
        'Tap the menu icon (three dots) in the top-right corner.',
        'Tap "Add to Home Screen" or "Install app".',
        'Tap "Add" or "Install" in the bottom sheet.',
        'Find Echo on your home screen and enjoy the full experience.',
      ],
    };
  }
  return {
    title: 'Install Echo',
    steps: [
      'Open this page in Chrome or Edge.',
      'Look for the install icon in the address bar (or menu → Cast, save, and share → Install page as app).',
      'Follow the prompts to install Echo as a desktop app.',
    ],
  };
}

export function OnboardingOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [installInfo, setInstallInfo] = useState<ReturnType<typeof getInstallInstructions>>(null);

  useEffect(() => {
    setInstallInfo(getInstallInstructions());
  }, []);

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
                    <h2 className={styles.installTitle}>{installInfo?.title ?? 'Add to Home Screen'}</h2>
                    <ol className={styles.installSteps}>
                      {(installInfo?.steps ?? ['Open the browser menu and select "Add to Home Screen" or "Install App"']).map((instruction, i) => (
                        <li key={i} className={styles.installStep}>{instruction}</li>
                      ))}
                    </ol>
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
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShow(true);
  }, []);

  const handleDone = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  }, []);

  if (!show) return null;

  return <OnboardingOverlay onDone={handleDone} />;
}
