import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { BottomNav } from '@/components/shared/BottomNav';
import styles from './layout.module.css';

export default async function JournalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      redirect('/login');
    }
  } catch (err) {
    // Force redirect on error
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  );
}
