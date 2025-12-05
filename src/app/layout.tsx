import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ESPProvider } from '../context/ESPContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ESP32 Pod Monitor',
  description: 'Real-time monitoring and control system for ESP32 pod',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ESPProvider>{children}</ESPProvider>
      </body>
    </html>
  );
}