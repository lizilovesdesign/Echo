/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@supabase/ssr'],
    optimizePackageImports: ['hugeicons-react', 'date-fns', 'framer-motion'],
  },
};

export default nextConfig;
