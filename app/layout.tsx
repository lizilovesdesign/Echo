import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Echo — A Private Music & Emotional Journal',
  description: 'Bridge the gap between music discovery and emotional reflection. Anchor your favorite tracks to personal memories and moods in a secure, distraction-free emotional archive.',
  keywords: ['music journal', 'emotional reflection', 'spotify diary', 'mood tracking', 'private journal'],
  authors: [{ name: 'Echo Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (!t) { t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
                  if (t === 'dark') { document.documentElement.classList.add('dark', 'dark-theme'); }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
