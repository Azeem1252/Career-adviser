import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from '@/components/toaster';
import { NeuralCursor } from '@/components/neural-cursor';
import { PageTransition } from '@/components/page-transition';
import { CommandPalette } from '@/components/command-palette';
import { ScrollProgress } from '@/components/scroll-effects';
import { ChatWidget } from '@/components/chat-widget';
import { LayoutWrapper } from '@/components/shared/LayoutWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CarreAdviser AI | Your Strategic Career Success Partner',
  description: 'Advanced AI-powered career advisor and strategist. Leverage professional career analytics to align your expertise with the evolving global job market.',
  keywords: ['AI career advisor', 'career guidance', 'resume analysis', 'career strategy', 'professional development', 'AI coaching'],
  authors: [{ name: 'CarreAdviser AI' }],
  openGraph: {
    title: 'CarreAdviser AI | Your Strategic Career Success Partner',
    description: 'Advanced AI-powered career advisor and strategist.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarreAdviser AI | Your Strategic Career Success Partner',
    description: 'Advanced AI-powered career advisor and strategist.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative min-h-screen bg-background antialiased`}>
        <ThemeProvider>
          <LayoutWrapper>
            <NeuralCursor />
            <ScrollProgress />
            <CommandPalette />
            <ChatWidget />
            <div className="noise" />
            <PageTransition>
              {children}
            </PageTransition>
          </LayoutWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
