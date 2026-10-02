import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduGenie AI - Intelligent Learning Studio',
  description: 'AI-Powered Educational Learning Assistant built with Next.js, React, and Google Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        {children}
      </body>
    </html>
  );
}