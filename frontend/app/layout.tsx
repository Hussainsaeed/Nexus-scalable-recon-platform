import type { Metadata } from 'next';
import './globals.css';
import AppShell from './app-shell';

export const metadata: Metadata = {
  title: 'NEXUS OS — Cybersecurity Scanning Dashboard',
  description: 'Web-based Cybersecurity Scanning Dashboard (MVP)'
};

export default function RootLayout({
  children: _children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell />
      </body>
    </html>
  );
}

