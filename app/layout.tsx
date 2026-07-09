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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://echo-journaling.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  openGraph: {
    title: 'Echo — A Private Music & Emotional Journal',
    description: 'Anchor your favorite songs to personal memories and moods.',
    siteName: 'Echo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo — A Private Music & Emotional Journal',
    description: 'Anchor your favorite songs to personal memories and moods.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${satoshi.variable} dark dark-theme`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="preconnect" href="https://i.scdn.co" />
        <link rel="dns-prefetch" href="https://i.scdn.co" />
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
