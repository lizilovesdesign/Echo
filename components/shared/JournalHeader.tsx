'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Music, Plus, LogOut, Sun, Moon } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { useTheme } from '@/app/providers';
import { useMounted } from '@/lib/use-mounted';
import { Button } from '../ui/Button';
import styles from './JournalHeader.module.css';

export function JournalHeader() {
  const mounted = useMounted();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push('/login');
    } catch (err) {
      // Suppress signout logs
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/timeline" className={styles.logo}>
            <Music className={styles.logoIcon} />
            <span>Echo</span>
          </Link>
        </div>

        <div className={styles.right}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {mounted ? (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />) : <div style={{ width: 18, height: 18 }} />}
          </button>

          <Link href="/create" className={styles.createLink}>
            <Button size="sm" variant="primary" className={styles.createBtn}>
              <Plus size={16} className={styles.plusIcon} />
              <span>New Echo</span>
            </Button>
          </Link>

          <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
