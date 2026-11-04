import type { Metadata, Viewport } from 'next';
import './globals.css';
import { EWSProvider } from '@/lib/EWSContext';
import { BottomNav } from '@/components/BottomNav';
import { ForegroundAlertBanner } from '@/components/ForegroundAlertBanner';

export const metadata: Metadata = {
  title: 'EWS — Early Warning System',
  description: 'Sistem Peringatan Dini dan Monitoring Ketinggian Air Realtime',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EWS',
  },
};

export const viewport: Viewport = {
  themeColor: '#2196F3',
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
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-700">
        <EWSProvider>
          <ForegroundAlertBanner />
          <div className="pb-20">
            {children}
          </div>
          <BottomNav />
        </EWSProvider>
      </body>
    </html>
  );
}
