'use client';

import { useMemo, useState } from 'react';

import ScanTarget from '@/components/ScanTarget';
import type { ApiResponse, ScanSummary } from '@/app/scan/_types';

type SeverityCounts = {
  critical: number;
  high: number;
  medium: number;
};

export default function Page() {
  const [lastSummary, setLastSummary] = useState<ScanSummary | null>(null);
  const [lastRaw, setLastRaw] = useState<ApiResponse | null>(null);

  const totals = useMemo(() => {
    const totalFindings = lastSummary?.totalFindings ?? 0;
    const critical = lastSummary?.critical ?? 0;
    const high = lastSummary?.high ?? 0;
    const medium = lastSummary?.medium ?? 0;
    return {
      totalFindings,
      critical,
      high,
      medium,
      highMed: high + medium
    };
  }, [lastSummary]);

  const onScanComplete = (summary: ScanSummary, raw: ApiResponse) => {
    setLastSummary(summary);
    setLastRaw(raw);
  };

  return (
    <div className="space-y-6">
      {/* Top dynamic KPIs */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Cyber Scan Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
              Live terminal scan engine with real-time severity telemetry (local React state).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            label="Total Scans"
            value={totals.totalFindings.toString()}
            hint={lastRaw ? `Target: ${lastRaw.target}` : 'Awaiting scan results'}
          />
          <KpiCard
            label="Critical"
            value={totals.critical.toString()}
            hint="Highest-severity exposures"
            tone="critical"
          />
          <KpiCard
            label="High/Med"
            value={totals.highMed.toString()}
            hint="High + Medium grouped"
            tone="highMed"
          />
        </div>
      </section>

      {/* Live Scan engine right below KPIs */}
      <section className="rounded-3xl border border-[rgba(94,255,169,0.22)] bg-black/30 backdrop-blur p-4 sm:p-6">
        <ScanTarget onScanComplete={onScanComplete} />
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'critical' | 'highMed';
}) {
  const valueClass =
    tone === 'critical'
      ? 'text-[#ff4d6d] drop-shadow-[0_0_18px_rgba(255,77,109,0.35)]'
      : tone === 'highMed'
        ? 'text-[#ff8a3d] drop-shadow-[0_0_18px_rgba(255,138,61,0.30)]'
        : 'text-[rgba(94,255,169,0.95)] drop-shadow-[0_0_18px_rgba(94,255,169,0.30)]';

  return (
    <div className="rounded-3xl border border-[rgba(94,255,169,0.22)] bg-[rgba(5,9,19,0.55)] p-5 hover:bg-[rgba(5,9,19,0.65)] transition">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs tracking-widest text-zinc-500">{label.toUpperCase()}</div>
        <div className="h-2 w-2 rounded-full bg-[rgba(94,255,169,0.9)] shadow-[0_0_18px_rgba(94,255,169,0.35)]" />
      </div>

      <div className={`mt-3 text-3xl font-semibold ${valueClass}`}>{value}</div>

      <div className="mt-2 text-sm text-zinc-400">{hint}</div>
    </div>
  );
}

