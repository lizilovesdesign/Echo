import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Echo — Private Music Journal',
    short_name: 'Echo',
    description: 'Anchor songs to memories. Capture the feeling in seconds.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1c1c1f',
    theme_color: '#1c1c1f',
    orientation: 'portrait-primary',
    categories: ['lifestyle', 'music', 'journal'],
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
