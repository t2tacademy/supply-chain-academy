import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo Supply Chain — T2T Academy',
    description: '59 cursos únicos, 7 especializaciones. Formación práctica basada en +20 años de experiencia real.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
