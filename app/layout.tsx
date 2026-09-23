import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-tc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://supply-chain-academy.vercel.app'),
  title: "Catálogo Supply Chain — T2T Academy",
  description: "59 cursos únicos, 7 especializaciones. Formación práctica en Supply Chain basada en +20 años de experiencia real. ~50% de descuento.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-256.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: '/favicon-256.png',
  },
  openGraph: {
    title: 'Catálogo Supply Chain — T2T Academy',
    description: '59 cursos únicos, 7 especializaciones. Formación práctica basada en +20 años de experiencia real. ~50% de descuento.',
    type: 'website',
    images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: 'Catálogo Supply Chain — T2T Academy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo Supply Chain — T2T Academy',
    description: '59 cursos únicos, 7 especializaciones. Formación práctica basada en +20 años de experiencia real.',
    images: ['/og-image-v2.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
