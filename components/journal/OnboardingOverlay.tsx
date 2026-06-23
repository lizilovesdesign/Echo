'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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

function getInstallInstructions(): { title: string; subtitle: string; steps: string[] } | null {
  if (typeof window === 'undefined') return null;
  if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone) {
    return { title: 'Echo is already installed', subtitle: 'You\'re using the installed app. Open it anytime from your home screen.', steps: [] };
  }
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) {
    return {
      title: 'Add to Home Screen — iPhone / iPad',
      subtitle: 'Install Echo on your phone for quick access, offline support, and a full-screen experience.',
      steps: [
        'Open this page in Safari (other browsers won\'t show the install option).',
        'Tap the Share icon at the bottom of the screen — it looks like a square with an arrow pointing up.',
        'Scroll down in the share sheet and tap "Add to Home Screen".',
        'Tap "Add" in the top-right corner. Echo will appear on your home screen like a native app.',
      ],
    };
  }
  if (/Android/.test(ua)) {
    return {
      title: 'Add to Home Screen — Android',
      subtitle: 'Install Echo on your phone for quick access, offline support, and a full-screen experience.',
      steps: [
        'Open this page in Chrome.',
        'Tap the menu icon (three dots) in the top-right corner of Chrome.',
        'Tap "Add to Home Screen" or "Install app". If a banner appears at the bottom, tap "Install".',
        'Tap "Add" or "Install" in the dialog. Echo will appear on your home screen like a native app.',
      ],
    };
  }
  return {
    title: 'Install on Your Phone',
    subtitle: 'Open this page on your phone\'s browser and follow the steps for iPhone or Android.',
    steps: [
      'iPhone: Open in Safari, tap the Share icon, then "Add to Home Screen".',
      'Android: Open in Chrome, tap the menu (⋮), then "Add to Home Screen" or "Install app".',
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
                    {installInfo?.subtitle && (
                      <p className={styles.slideDescription}>{installInfo.subtitle}</p>
                    )}
                    <ol className={styles.installSteps}>
                      {(installInfo?.steps ?? []).map((instruction, i) => (
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
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isWelcome) {
      localStorage.removeItem(ONBOARDING_KEY);
      setShow(true);
      return;
    }
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShow(true);
  }, [isWelcome]);

  const handleDone = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
    if (isWelcome) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [isWelcome]);

  if (!show) return null;

  return <OnboardingOverlay onDone={handleDone} />;
}
