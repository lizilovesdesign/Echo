'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/providers';
import { useMounted } from '@/lib/use-mounted';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import {
  UserIcon,
  Moon01Icon,
  MusicNote01Icon,
  Mail01Icon,
  Logout01Icon,
  Delete01Icon,
  Settings01Icon,
} from 'hugeicons-react';
import styles from './page.module.css';

export default function ProfilePage() {
  const mounted = useMounted();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email ?? '');
          setName(user.user_metadata?.name ?? user.email?.split('@')[0] ?? '');
          setNameInput(user.user_metadata?.name ?? user.email?.split('@')[0] ?? '');
        }
      } catch {
        // Silently fail
      }
    }
    loadProfile();
  }, [supabase]);

  const handleSaveName = useCallback(async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: nameInput.trim() || name },
      });
      if (!error) {
        setName(nameInput.trim() || name);
      }
    } catch {
      // Silently fail
    }
    setEditingName(false);
  }, [nameInput, name, supabase]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push('/login');
    } catch {
      // Silently fail
    }
  }, [supabase, router]);

  const handleDeleteAccount = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
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
          <UserIcon size={28} />
        </div>
        <div className={styles.info}>
          {editingName ? (
            <div className={styles.editNameRow}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className={styles.nameInput}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                autoFocus
              />
              <button onClick={handleSaveName} className={styles.saveBtn}>Save</button>
              <button onClick={() => setEditingName(false)} className={styles.cancelBtn}>Cancel</button>
            </div>
          ) : (
            <span className={styles.name}>{name || 'Echo User'}</span>
          )}
          {email && <span className={styles.email}>{email}</span>}
        </div>
        {!editingName && (
          <button onClick={() => setEditingName(true)} className={styles.editBtn} aria-label="Edit name">
            <Settings01Icon size={18} />
          </button>
        )}
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
            <MusicNote01Icon size={18} className={styles.settingIcon} />
            <span>Music service</span>
          </div>
          <span className={styles.settingValue}>Spotify</span>
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
      </div>

      <div className={styles.actions}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <Logout01Icon size={18} />
          Sign out
        </button>
        <button
          onClick={handleDeleteAccount}
          className={styles.deleteBtn}
          disabled={deleting}
        >
          <Delete01Icon size={18} />
          {deleting ? 'Deleting...' : 'Delete account'}
        </button>
      </div>

      {!mounted && <div className={styles.placeholder} />}
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
