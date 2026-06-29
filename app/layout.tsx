import React from 'react';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Providers } from './providers';
import './globals.css';

const satoshi = localFont({
  src: [
    { path: '../fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'optional',
});

export const metadata: Metadata = {
  title: 'Echo — A Private Music & Emotional Journal',
  description: 'Bridge the gap between music discovery and emotional reflection. Anchor your favorite tracks to personal memories and moods in a secure, distraction-free emotional archive.',
  keywords: ['music journal', 'emotional reflection', 'spotify diary', 'mood tracking', 'private journal'],
  authors: [{ name: 'Echo Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Echo',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1c1c1f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={satoshi.variable}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="preconnect" href="https://i.scdn.co" />
        <link rel="dns-prefetch" href="https://i.scdn.co" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (!t) { t = 'dark'; }
                  if (t === 'dark') { document.documentElement.classList.add('dark', 'dark-theme'); }
                  else { document.documentElement.classList.add('light-theme'); }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          src="/sw-register.js"
        />
      </body>
    </html>
  );
}
