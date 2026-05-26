'use client';

import React, { useState } from 'react';

interface Vulnerability {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  confidence: number;
}

export default function FindingsPage() {
  const [vulnerabilities] = useState<Vulnerability[]>([
    {
      id: 'VULN-001',
      title: 'SQL Injection on /prod/id (Simulated)',
      type: 'SQLi',
      severity: 'high',
      evidence: "GET /prod/id?id=1' OR '1'='1' --",
      confidence: 84,
    },
    {
      id: 'VULN-002',
      title: 'Reflected XSS on /search (Simulated)',
      type: 'XSS',
      severity: 'medium',
      evidence: "search=<img src=x onerror=alert(1)>",
      confidence: 71,
    },
    {
      id: 'VULN-003',
      title: 'Outdated OpenSSL version detected (Simulated)',
      type: 'InfoLeak',
      severity: 'low',
      evidence: 'TLS handshake banner indicates legacy OpenSSL build',
      confidence: 59,
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-950/30 border-red-800';
      case 'high': return 'text-orange-500 bg-orange-950/30 border-orange-800';
      case 'medium': return 'text-yellow-500 bg-yellow-950/30 border-yellow-800';
      default: return 'text-blue-400 bg-blue-950/30 border-blue-800';
    }
  };

  return (
    <div className="p-8 text-zinc-100 min-h-screen bg-transparent">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Vulnerability Findings</h1>
        <p className="text-zinc-400 text-sm mt-1">المراجعة التفصيلية للثغرات الأمنية المكتشفة.</p>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 text-sm">
              <th className="p-4">ID</th>
              <th className="p-4">Vulnerability</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Evidence</th>
              <th className="p-4 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-sm">
            {vulnerabilities.map((vuln) => (
              <tr key={vuln.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="p-4 font-mono text-zinc-500">{vuln.id}</td>
                <td className="p-4 font-semibold text-white">{vuln.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs uppercase border ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                </td>
                <td className="p-4 font-mono text-zinc-400 bg-zinc-900/40 rounded px-2 py-1 max-w-xs truncate border border-zinc-800/50">
                  {typeof vuln.evidence === 'object' ? JSON.stringify(vuln.evidence) : vuln.evidence}
                </td>
                <td className="p-4 text-right font-semibold text-emerald-400">{vuln.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}