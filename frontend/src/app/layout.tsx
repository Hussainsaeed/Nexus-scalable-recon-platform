import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'NEXUS OS — Cybersecurity Scanning Dashboard',
  description: 'Web-based Cybersecurity Scanning Dashboard (MVP)'
};

type NavItem = {
  href: string;
  label: string;
};

const nav: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/scan', label: 'Scans' },
  { href: '/findings', label: 'Findings' }, // تم تغييرها لتطابق مجلد findings
  { href: '/settings', label: 'Settings' }
];

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(94,255,169,0.10),transparent_55%),radial-gradient(900px_500px_at_20%_20%,rgba(0,245,212,0.08),transparent_60%),#04060a] text-zinc-100">
        <div className="relative">
          {/* Neon grid */}
          <div
            className="pointer-events-none fixed inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(94,255,169,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(94,255,169,0.06) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
          />

          {/* Scanlines */}
          <div className="pointer-events-none fixed inset-0 nexus-scanlines opacity-60" />

          <div className="relative">
            <div className="flex min-h-screen">
              <aside className="hidden md:flex w-72 flex-col border-r border-[rgba(94,255,169,0.18)] bg-[rgba(4,6,10,0.55)] backdrop-blur">
                <div className="px-5 py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[rgba(94,255,169,0.12)] border border-[rgba(94,255,169,0.35)] shadow-glow flex items-center justify-center">
                      <span className="text-nexus-neon font-bold">N</span>
                    </div>
                    <div>
                      <div className="text-sm text-[rgba(94,255,169,0.9)] tracking-widest">NEXUS</div>
                      <div className="text-lg font-semibold">OS Dashboard</div>
                    </div>
                  </div>
                </div>

                <nav className="px-3 pb-6">
                  <div className="space-y-2">
                    {nav.map((item) => (
                      <SidebarLink key={item.href} href={item.href} label={item.label} />
                    ))}
                  </div>
                </nav>

                <div className="mt-auto px-5 pb-6">
                  <div className="rounded-2xl border border-[rgba(94,255,169,0.22)] bg-[rgba(5,9,19,0.55)] p-4">
                    <div className="text-xs text-[rgba(94,255,169,0.9)] tracking-widest">SYSTEM STATUS</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-nexus-neon shadow-glow" />
                        <span className="text-sm">Operational</span>
                      </div>
                      <span className="text-xs text-[rgba(94,255,169,0.8)]">v0.1</span>
                    </div>
                    <div className="mt-3 text-xs text-zinc-400">Simulated scanning MVP for UI + API integration.</div>
                  </div>
                </div>
              </aside>

              <main className="flex-1">
                <header className="sticky top-0 z-10 border-b border-[rgba(94,255,169,0.18)] bg-[rgba(4,6,10,0.65)] backdrop-blur">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="text-xs tracking-widest text-[rgba(94,255,169,0.9)]">SYSTEMS</div>
                      <div className="text-xl font-semibold">
                        <span className="text-nexus-neon drop-shadow-[0_0_18px_rgba(94,255,169,0.45)]">OPERATIONAL</span>
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-3">
                      <StatPill label="Targets" value="12" />
                      <StatPill label="Avg Risk" value="High" />
                      <StatPill label="Scans" value="47" />
                    </div>
                  </div>
                </header>

                <div className="p-4 md:p-8">{children}</div>
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={
        'group flex items-center justify-between rounded-xl px-4 py-3 text-sm border border-transparent bg-transparent text-zinc-300 ' +
        'hover:border-[rgba(94,255,169,0.25)] hover:bg-[rgba(94,255,169,0.06)]'
      }
    >
      <span>{label}</span>
      <span className="text-zinc-500 group-hover:text-[rgba(94,255,169,0.75)]">▸</span>
    </Link>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(94,255,169,0.22)] bg-[rgba(5,9,19,0.55)] px-4 py-2">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-semibold text-nexus-neon">{value}</div>
    </div>
  );
}

