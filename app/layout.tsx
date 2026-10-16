import type { Metadata, Viewport } from 'next';
import './globals.css';
import { EWSProvider } from '@/lib/EWSContext';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'EWS — Early Warning System',
  description: 'Sistem Peringatan Dini dan Monitoring Ketinggian Air Realtime',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
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
          <div className="pb-20">
            {children}
          </div>
          <BottomNav />
        </EWSProvider>
      </body>
    </html>
  );
}
