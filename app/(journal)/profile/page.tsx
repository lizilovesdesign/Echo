'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { useMounted } from '@/lib/use-mounted';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import {
  UserIcon,
  Moon01Icon,
  MusicNote01Icon,
  MusicNote02Icon,
  Mail01Icon,
  Logout01Icon,
  Delete01Icon,
  Edit01Icon,
  LockIcon,
  Link01Icon,
  Unlink01Icon,
} from 'hugeicons-react';
import styles from './page.module.css';

export default function ProfilePage() {
  const mounted = useMounted();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyLoading, setSpotifyLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email ?? '');
          setAvatarUrl(user.user_metadata?.avatar_url ?? null);
          setName(user.user_metadata?.name ?? user.email?.split('@')[0] ?? '');
        }
      } catch {
        // Silently fail
      }
    }
    loadProfile();
  }, [supabase]);

  useEffect(() => {
    async function checkSpotify() {
      try {
        const res = await fetch('/api/auth/spotify/status');
        const json = await res.json();
        if (json.ok) {
          setSpotifyConnected(json.data.connected);
        }
      } catch {
        // Silently fail
      } finally {
        setSpotifyLoading(false);
      }
    }
    checkSpotify();
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // Redirect even if sign-out fails
    }
    router.refresh();
    router.push('/login');
  }, [supabase, router]);

  const handleDeleteAccount = useCallback(async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      if (res.ok) {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
      }
    } catch {
      // Silently fail
    }
    setDeleting(false);
  }, [supabase, router]);

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Your account and settings.</p>
      </header>

      <div className={styles.card}>
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
          ) : (
            <UserIcon size={28} />
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{name || 'Echo User'}</span>
          {email && <span className={styles.email}>{email}</span>}
        </div>
        <Link href="/profile/edit" className={styles.editBtn} aria-label="Edit profile">
          <Edit01Icon size={18} />
        </Link>
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Preferences</h2>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <Moon01Icon size={18} className={styles.settingIcon} />
            <span>Dark mode</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`${styles.toggle} ${theme === 'dark' ? styles.toggleActive : ''}`}
            aria-label="Toggle dark mode"
            aria-pressed={theme === 'dark'}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            {spotifyConnected ? (
              <MusicNote02Icon size={18} className={styles.settingIcon} />
            ) : (
              <MusicNote01Icon size={18} className={styles.settingIcon} />
            )}
            <span>Spotify</span>
          </div>
          {spotifyLoading ? (
            <span className={styles.settingValue}>Checking...</span>
          ) : spotifyConnected ? (
            <button
              onClick={async () => {
                await fetch('/api/auth/spotify/unlink', { method: 'POST' });
                setSpotifyConnected(false);
              }}
              className={styles.linkBtn}
              aria-label="Disconnect Spotify"
            >
              <Unlink01Icon size={16} />
              <span>Disconnect</span>
            </button>
          ) : (
            <a href="/api/auth/spotify/link" className={styles.linkBtn}>
              <Link01Icon size={16} />
              <span>Connect</span>
            </a>
          )}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Account</h2>

        {email && (
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <Mail01Icon size={18} className={styles.settingIcon} />
              <span>Email</span>
            </div>
            <span className={styles.settingValue}>{email}</span>
          </div>
        )}

        <Link href="/profile/password" className={styles.actionRow}>
          <span className={styles.actionInfo}>
            <LockIcon size={18} className={styles.actionIcon} />
            <span>Change password</span>
          </span>
          <span className={styles.actionChevron}>→</span>
        </Link>
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Actions</h2>

        <button className={styles.actionRow} onClick={handleLogout} disabled={loggingOut}>
          <span className={styles.actionInfo}>
            <Logout01Icon size={18} className={styles.actionIcon} />
            <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>
          </span>
          <span className={styles.actionChevron}>→</span>
        </button>

        <button className={styles.actionRow} onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
          <span className={styles.actionInfo}>
            <Delete01Icon size={18} className={styles.dangerIcon} />
            <span className={styles.dangerText}>Delete account</span>
          </span>
          <span className={styles.actionChevron}>→</span>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className={styles.overlay}>
          <div className={styles.confirmDialog}>
            <h3 className={styles.confirmTitle}>Delete account?</h3>
            <p className={styles.confirmText}>
              This will permanently delete your account and all your Echo entries. This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={() => setShowDeleteConfirm(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className={styles.confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {!mounted && <div className={styles.placeholder} />}
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
