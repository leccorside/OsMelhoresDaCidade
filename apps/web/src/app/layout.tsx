import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata();

export const viewport: Viewport = {
  themeColor: '#FF3B4F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="min-h-screen bg-[#FCF9F8] text-[#171717] antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}

