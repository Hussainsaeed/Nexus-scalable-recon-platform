import type { Metadata } from 'next';
import './globals.css';
import AppShell from './app-shell';

export const metadata: Metadata = {
  title: 'NEXUS OS',
  description: 'Cybersecurity Scanning Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}