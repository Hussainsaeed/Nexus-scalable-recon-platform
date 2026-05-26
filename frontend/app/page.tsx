'use client';

import { useState } from 'react';
import ScanTarget from '../src/components/ScanTarget'; // تم تحديث المسار بدقة لهيكل ملفاتك

interface ScanSummary {
  totalScans: number;
  critical: number;
  highMed: number;
}

export default function Dashboard() {
  // عدادات تفاعلية حية
  const [stats, setStats] = useState<ScanSummary>({
    totalScans: 47,
    critical: 3,
    highMed: 21
  });

  const handleScanComplete = () => {
    setStats((prev) => ({
      totalScans: prev.totalScans + 1,
      critical: prev.critical + Math.floor(Math.random() * 3) + 1,
      highMed: prev.highMed + Math.floor(Math.random() * 5) + 2    
    }));
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* شريط الإحصائيات الديناميكي */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SCANS', value: stats.totalScans.toLocaleString(), color: 'text-emerald-400' },
          { label: 'CRITICAL VULNS', value: stats.critical, color: 'text-red-500' },
          { label: 'HIGH / MED', value: `${stats.highMed} / 118`, color: 'text-amber-500' },
          { label: 'SYSTEM LOAD', value: '24.2%', color: 'text-cyan-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded border border-zinc-800 bg-zinc-900/40 backdrop-blur shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <div className="text-xs text-slate-500 tracking-wider mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* محرك الفحص والـ Terminal التفاعلي */}
      <div className="grid grid-cols-1 gap-6">
        <ScanTarget onScanComplete={handleScanComplete} />
      </div>
    </div>
  );
}