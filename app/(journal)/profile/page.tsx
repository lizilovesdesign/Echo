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
  Mail01Icon,
  Logout01Icon,
  Delete01Icon,
  Edit01Icon,
  LockIcon,
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

  const resetPasswordForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  }, []);

  const handleChangePassword = useCallback(async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError('New password must include at least one letter and one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError('Current password is incorrect.');
        setChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordSuccess(true);
      resetPasswordForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('reauthentication') || message.toLowerCase().includes('session')) {
        setPasswordError('Session expired. Please sign out and sign back in, then try again.');
      } else {
        setPasswordError(message || 'Failed to change password. Please try again.');
      }
    }
    setChangingPassword(false);
  }, [email, currentPassword, newPassword, confirmPassword, supabase, resetPasswordForm]);

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

        <button className={styles.actionRow} onClick={() => { resetPasswordForm(); setShowPasswordModal(true); }}>
          <span className={styles.actionInfo}>
            <LockIcon size={18} className={styles.actionIcon} />
            <span>Change password</span>
          </span>
          <span className={styles.actionChevron}>→</span>
        </button>
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

      {showPasswordModal && (
        <div className={styles.overlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.passwordDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Change password</h3>

            {passwordSuccess ? (
              <div className={styles.passwordSuccessBlock}>
                <p className={styles.passwordSuccessText}>Password changed successfully.</p>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className={styles.saveBtn}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className={styles.passwordField}>
                  <label className={styles.passwordLabel} htmlFor="current-password">Current password</label>
                  <input
                    id="current-password"
                    type="password"
                    className={styles.passwordInput}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={changingPassword}
                    autoFocus
                  />
                </div>
                <div className={styles.passwordField}>
                  <label className={styles.passwordLabel} htmlFor="new-password">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    className={styles.passwordInput}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    disabled={changingPassword}
                  />
                </div>
                <div className={styles.passwordField}>
                  <label className={styles.passwordLabel} htmlFor="confirm-password">Confirm new password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className={styles.passwordInput}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    disabled={changingPassword}
                  />
                </div>

                {passwordError && <p className={styles.passwordError}>{passwordError}</p>}

                <div className={styles.confirmActions}>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className={styles.cancelBtn}
                    disabled={changingPassword}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className={styles.saveBtn}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!mounted && <div className={styles.placeholder} />}
      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
