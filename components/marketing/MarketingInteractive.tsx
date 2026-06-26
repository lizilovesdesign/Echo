'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sun01Icon, Moon01Icon, ArrowRight01Icon, HeartAddIcon } from 'hugeicons-react';
import { useTheme } from '@/lib/theme-context';
import { useMounted } from '@/lib/use-mounted';
import { Button } from '@/components/ui/Button';
import styles from '@/app/(marketing)/page.module.css';

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label="Toggle dark/light theme"
    >
      {mounted ? (theme === 'dark' ? <Sun01Icon size={18} /> : <Moon01Icon size={18} />) : <div style={{ width: 18, height: 18 }} />}
    </button>
  );
}

export function FooterThemeButton() {
  const mounted = useMounted();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.footerThemeBtn}
      aria-label="Switch theme"
    >
      {mounted ? (theme === 'dark' ? <Sun01Icon size={14} /> : <Moon01Icon size={14} />) : <div style={{ width: 14, height: 14 }} />}
      {mounted ? (
        <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
      ) : (
        <span style={{ display: 'inline-block', width: 70 }} />
      )}
    </button>
  );
}

export function HeroCta() {
  const router = useRouter();

  return (
    <Button size="md" variant="primary" className={styles.heroCta} onClick={() => router.push('/login?mode=signup')}>
      Join Echo <ArrowRight01Icon size={16} className={styles.arrow} />
    </Button>
  );
}

export function FooterHeart() {
  return <HeartAddIcon size={12} className={styles.heartIcon} />;
}
