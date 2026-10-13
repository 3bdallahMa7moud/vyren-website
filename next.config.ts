import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.VYREN_BUILD_DIR ?? '.next',
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      ...['manifest.json', 'poster-desktop.webp', 'poster-mobile.webp'].map(asset => ({
        source: `/assets/exploded-cycles/${asset}`,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      })),
    ];
  },
};
export default config;
