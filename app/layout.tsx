import './globals.css';
import type { Metadata, Viewport } from 'next';
import TabBar from '@/components/TabBar';

export const metadata: Metadata = {
  title: 'FINN — what matters, and who can help',
  description: 'A mobile-first investment agent: push, pull and your network.',
  appleWebApp: { capable: true, title: 'FINN', statusBarStyle: 'default' },
  manifest: '/manifest.webmanifest',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f4f1ea' }, { media: '(prefers-color-scheme: dark)', color: '#100f0d' }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="min-h-dvh">
        <div className="mx-auto max-w-[480px] min-h-dvh safe-b relative">{children}</div>
        <TabBar />
      </body>
    </html>
  );
}
