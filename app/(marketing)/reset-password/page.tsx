'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MusicNote01Icon, Sun01Icon, Moon01Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { useTheme } from '@/lib/theme-context';
import { useMounted } from '@/lib/use-mounted';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const mounted = useMounted();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const passwordError = touched.password ? validatePassword(password) : '';
  const confirmError = touched.confirmPassword
    ? !confirmPassword
      ? 'Please confirm your new password.'
      : password !== confirmPassword
        ? 'Passwords do not match.'
        : ''
    : '';

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    const errs = {
      password: validatePassword(password),
      confirm: !confirmPassword
        ? 'Please confirm your new password.'
        : password !== confirmPassword
          ? 'Passwords do not match.'
          : '',
    };

    if (errs.password || errs.confirm) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <MusicNote01Icon className={styles.logoIcon} />
            <span>Echo</span>
          </div>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle dark/light theme">
            {mounted ? (theme === 'dark' ? <Sun01Icon size={18} /> : <Moon01Icon size={18} />) : <div style={{ width: 18, height: 18 }} />}
          </button>
        </header>
        <main className={styles.main}>
          <Card className={styles.card}>
            <div className={styles.successState}>
              <CheckmarkCircle01Icon size={48} className={styles.successIcon} />
              <h2>Password updated</h2>
              <p>Your password has been changed successfully.</p>
              <Button onClick={() => router.push('/timeline')} className={styles.submitBtn}>
                Go to Timeline
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <MusicNote01Icon className={styles.logoIcon} />
          <span>Echo</span>
        </div>
        <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle dark/light theme">
          {mounted ? (theme === 'dark' ? <Sun01Icon size={18} /> : <Moon01Icon size={18} />) : <div style={{ width: 18, height: 18 }} />}
        </button>
      </header>

      <main className={styles.main}>
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Set a new password</h2>
            <p>Choose a strong password for your Echo account.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              disabled={loading}
              error={passwordError}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              disabled={loading}
              error={confirmError}
              required
            />

            {errorMsg && <p className={styles.error}>{errorMsg}</p>}

            <Button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <>
                  <Spinner size="sm" className={styles.spinner} /> Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}

function validatePassword(password: string): string {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(password)) return 'Include at least one letter.';
  if (!/\d/.test(password)) return 'Include at least one number.';
  return '';
}
