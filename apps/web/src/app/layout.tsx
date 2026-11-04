import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.log('SW registration error: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
