'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Sun, Moon } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useTheme } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Register a new account
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        
        if (data.session) {
          // Instantly logged in
          router.push('/timeline');
        } else {
          setSuccessMsg('Verification email sent! Check your inbox to confirm your private archive.');
        }
      } else {
        // Sign into an existing account
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Force a page reload/redirect to populate the server context
        router.refresh();
        router.push('/timeline');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <Music className={styles.logoIcon} />
          <span>Echo</span>
        </div>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className={styles.main}>
        <Card className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <h2>{isSignUp ? 'Create your private archive' : 'Welcome to Echo'}</h2>
            <p>
              {isSignUp
                ? 'Begin anchoring memories to your personal music diary.'
                : 'Sign in to access your secure timeline of musical reflections.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
            {successMsg && <p className={styles.success}>{successMsg}</p>}

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
          </form>

          <div className={styles.toggleRow}>
            <span>
              {isSignUp ? 'Already have a private log?' : 'First time journaling here?'}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={styles.toggleBtn}
              type="button"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
}
