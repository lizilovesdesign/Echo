'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MusicNote01Icon, PlusSignIcon, Logout01Icon, Sun01Icon, Moon01Icon } from 'hugeicons-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { useTheme } from '@/lib/theme-context';
import { useMounted } from '@/lib/use-mounted';
import { Button } from '../ui/Button';
import styles from './JournalHeader.module.css';

export function JournalHeader() {
  const mounted = useMounted();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // Redirect even if sign-out fails
    }
    router.refresh();
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/timeline" className={styles.logo}>
            <MusicNote01Icon className={styles.logoIcon} />
            <span>Echo</span>
          </Link>
        </div>

        <div className={styles.right}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {mounted ? (theme === 'dark' ? <Sun01Icon size={18} /> : <Moon01Icon size={18} />) : <div style={{ width: 18, height: 18 }} />}
          </button>

          <Link href="/create" className={styles.createLink}>
            <Button size="sm" variant="primary" className={styles.createBtn}>
              <PlusSignIcon size={16} className={styles.plusIcon} />
              <span>New Echo</span>
            </Button>
          </Link>

          <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Sign out" disabled={loggingOut}>
            <Logout01Icon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
