import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { LocationProvider } from '@/context/LocationContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LocationSelectorModal } from '@/components/layout/LocationSelectorModal';

export const metadata: Metadata = {
  title: 'HeatShield – Real-Time Urban Heat Protection',
  description: 'Understand your personal and area-level urban heat risk in real time. Powered by hyperlocal thermal models and actionable safety guidance.',
  keywords: ['urban heat', 'heat risk', 'heat shield', 'extreme heat protection', 'heat wave', 'wet bulb globe temperature'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FDF6F0] text-[#2D2A26] antialiased">
        <LocationProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <LocationSelectorModal />
          <Footer />
        </LocationProvider>
      </body>
    </html>
  );
}
