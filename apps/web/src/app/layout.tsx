import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const jakarta = Inter({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'We Love Memory — Foto Lembrança',
  description: 'Foto Lembrança Digital para Casamentos — Montagem Clássica e IA Generativa',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#faf8f5',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#faf8f5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${playfair.variable} antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="w-full h-full min-h-screen bg-[#faf8f5] text-[#2c2621]">
        {children}
      </body>
    </html>
  );
}