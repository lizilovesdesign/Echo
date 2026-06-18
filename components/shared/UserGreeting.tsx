'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import styles from './UserGreeting.module.css';

interface UserMeta {
  displayName: string;
  avatarUrl: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function UserGreeting() {
  const [user, setUser] = useState<UserMeta | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const meta = data.user.user_metadata ?? {};
      const displayName =
        meta.full_name ||
        meta.name ||
        data.user.email?.split('@')[0] ||
        'there';
      const avatarUrl = meta.avatar_url || meta.picture || null;
      setUser({ displayName, avatarUrl });
    });
  }, []);

  const greeting = getGreeting();
  const firstName = user?.displayName.split(' ')[0] ?? '';

  return (
    <div className={styles.greeting}>
      <div className={styles.textBlock}>
        <p className={styles.greetingLine}>{greeting},</p>
        <h1 className={styles.name}>{firstName || 'Welcome back'} 👋</h1>
      </div>

      <div className={styles.avatarWrapper}>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.displayName}'s profile`}
            className={styles.avatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.avatarFallback} aria-label="Profile avatar">
            <User size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
