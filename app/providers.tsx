'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeContext } from '@/lib/theme-context';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

function InactivityTracker() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Do not run on marketing/auth pages
    if (!pathname || pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/auth')) return;

    // Check if added to homescreen (PWA standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (!isStandalone) return;

    let timeoutId: NodeJS.Timeout;
    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity

    const handleInactivity = () => {
      const supabase = createBrowserSupabaseClient();
      supabase.auth.signOut().then(() => {
        router.push('/login');
      });
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivity, TIMEOUT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer, true));

    resetTimer(); // init

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer, true));
    };
  }, [router, pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 300000,
          },
        },
      })
  );

  const noop = () => {};

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: noop }}>
        <InactivityTracker />
        {children}
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
