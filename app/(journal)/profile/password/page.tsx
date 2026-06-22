'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import styles from './page.module.css';

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadEmail() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    }
    loadEmail();
  }, [supabase]);

  const handleSave = async () => {
    setError('');

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('New password must include at least one letter and one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect.');
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('reauthentication') || message.toLowerCase().includes('session')) {
        setError('Session expired. Please sign out and sign back in, then try again.');
      } else {
        setError(message || 'Failed to change password. Please try again.');
      }
    }
    setSaving(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/profile')} className={styles.backBtn} aria-label="Go back">
          <ArrowLeft01Icon size={22} />
        </button>
        <h1 className={styles.title}>Change password</h1>
      </header>

      {success ? (
        <div className={styles.successBlock}>
          <p className={styles.successText}>Password changed successfully.</p>
          <button onClick={() => router.push('/profile')} className={styles.doneBtn}>
            Done
          </button>
        </div>
      ) : (
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              type="password"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={saving}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters, one letter and one number"
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              disabled={saving}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
              {saving ? 'Changing...' : 'Change Password'}
            </button>
            <button onClick={() => router.push('/profile')} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={styles.navSpacer} aria-hidden="true" />
    </div>
  );
}
