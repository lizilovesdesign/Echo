'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MusicNote01Icon, Sun01Icon, Moon01Icon, ArrowLeft01Icon } from 'hugeicons-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { useTheme } from '@/lib/theme-context';
import { useMounted } from '@/lib/use-mounted';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import styles from './page.module.css';

function validateDisplayName(name: string, isSignUp: boolean): string {
  if (!isSignUp) return '';
  if (!name.trim()) return 'A name or nickname is required.';
  if (name.trim().length < 2) return 'Must be at least 2 characters.';
  if (name.trim().length > 50) return 'Must be 50 characters or fewer.';
  return '';
}

function validateEmail(email: string): string {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return '';
}

function validatePassword(password: string, isSignUp: boolean): string {
  if (!password) return 'Password is required.';
  if (isSignUp) {
    if (password.length < 8) return 'Must be at least 8 characters.';
    if (!/[a-zA-Z]/.test(password)) return 'Include at least one letter.';
    if (!/\d/.test(password)) return 'Include at least one number.';
  }
  return '';
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resending, setResending] = useState(false);

  const mounted = useMounted();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const nameError = touched.displayName ? validateDisplayName(displayName, isSignUp) : '';
  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.password ? validatePassword(password, isSignUp) : '';
  const showStrength = isSignUp && password.length > 0;

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ displayName: true, email: true, password: true });

    const errs = {
      displayName: validateDisplayName(displayName, isSignUp),
      email: validateEmail(email),
      password: validatePassword(password, isSignUp),
    };

    if (errs.displayName || errs.email || errs.password) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const trimmedName = displayName.trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: trimmedName,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          fetch('/api/auth/after-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmedName }),
          }).catch(() => {});

          router.push('/home');
        } else {
          setSuccessMsg('Verification email sent! Check your inbox to confirm your private archive.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.refresh();
        router.push('/home');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const lower = message.toLowerCase();
      if (!message) {
        setErrorMsg('Authentication failed. Please verify credentials.');
      } else if (lower.includes('user already registered')) {
        setErrorMsg('An account with this email already exists. Try signing in instead.');
      } else if (lower.includes('rate limit') || lower.includes('too many')) {
        setErrorMsg('Too many sign-up attempts. Please wait a few minutes before trying again.');
      } else if (lower.includes('email') && (lower.includes('send') || lower.includes('fail') || lower.includes('confirm'))) {
        setErrorMsg(`Supabase email error: ${message}\n\nMake sure email is configured in your Supabase dashboard → Authentication → Settings → Email (Built-in) or SMTP. Also check the Supabase logs for details.`);
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setTouched((prev) => ({ ...prev, email: true }));
      return;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setTouched((prev) => ({ ...prev, email: true }));
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setResetEmailSent(true);
      setSuccessMsg('Password reset link sent! Check your inbox.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setDisplayName('');
    setErrorMsg('');
    setSuccessMsg('');
    setTouched({});
    setShowForgotPassword(false);
    setResetEmailSent(false);
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSuccessMsg('Confirmation email resent! Check your inbox (and spam folder).');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleCancelReset = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <MusicNote01Icon className={styles.logoIcon} />
          <span>Echo</span>
        </div>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label="Toggle dark/light theme"
        >
          {mounted ? (theme === 'dark' ? <Sun01Icon size={18} /> : <Moon01Icon size={18} />) : <div style={{ width: 18, height: 18 }} />}
        </button>
      </header>

      <main className={styles.main}>
        <Card className={styles.loginCard}>
          <div className={styles.cardHeader}>
            {showForgotPassword ? (
              <>
                <h2>Reset your password</h2>
                <p>Enter your email and we will send you a reset link.</p>
              </>
            ) : (
              <>
                <h2>{isSignUp ? 'Create your private archive' : 'Welcome to Echo'}</h2>
                <p>
                  {isSignUp
                    ? 'Begin anchoring memories to your personal music diary.'
                    : 'Sign in to access your secure timeline of musical reflections.'}
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {isSignUp && (
              <Input
                label="Name or Nickname"
                type="text"
                placeholder="What should we call you?"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); }}
                onBlur={() => handleBlur('displayName')}
                disabled={loading}
                error={nameError}
                required
                autoComplete="nickname"
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              onBlur={() => handleBlur('email')}
              disabled={loading}
              error={emailError}
              required
            />

            {!showForgotPassword && (
              <div className={styles.passwordWrapper}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); }}
                  onBlur={() => handleBlur('password')}
                  disabled={loading}
                  error={passwordError}
                  required
                />

                {showStrength && <PasswordStrength password={password} />}

                {!isSignUp && !resetEmailSent && (
                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
            {successMsg && (
              <div className={styles.successBlock}>
                <p className={styles.success}>{successMsg}</p>
                <p className={styles.spamTip}>Didn&apos;t receive it? Check your spam folder, then click below to resend.</p>
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResendConfirmation}
                  disabled={resending}
                >
                  {resending ? 'Sending...' : 'Resend confirmation email'}
                </button>
              </div>
            )}

            {showForgotPassword ? (
              <div className={styles.resetActions}>
                <Button type="button" disabled={loading} className={styles.submitBtn} onClick={handleForgotPassword}>
                  {loading ? <><Spinner size="sm" className={styles.spinner} /> Sending...</> : 'Send Reset Link'}
                </Button>
                <button type="button" className={styles.backLink} onClick={handleCancelReset}>
                  <ArrowLeft01Icon size={14} /> Back to sign in
                </button>
              </div>
            ) : (
              <Button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? (
                  <>
                    <Spinner size="sm" className={styles.spinner} />
                    Authenticating...
                  </>
                ) : isSignUp ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>
            )}
          </form>

          {!showForgotPassword && (
            <div className={styles.toggleRow}>
              <span>
                {isSignUp ? 'Already have a private log?' : 'First time journaling here?'}
              </span>
              <button
                onClick={handleToggleMode}
                className={styles.toggleBtn}
                type="button"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
