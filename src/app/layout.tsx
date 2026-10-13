import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'VYREN — NOCTIS 01 | Time, redefined.',
  description: 'An exploration of precision. Discover the NOCTIS 01 concept through cinematic detail, mechanical assembly and an interactive 3D experience.',
  openGraph: { title: 'VYREN — Time, redefined.', description: 'NOCTIS 01. An exploration of precision.', images: [{ url: '/assets/hero-dark-1600.webp', width: 1600, height: 1200 }] },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: '#080A0D', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
