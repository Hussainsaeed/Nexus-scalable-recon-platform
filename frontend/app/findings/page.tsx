'use client';

import React, {useState,useEffect} from 'react';
import { getApiUrl } from '../../lib/config';
import {apiFetch,} from '../../services/api';

interface Vulnerability {

  name: string;

  severity: string;

  description?: string;

  matched?: string;

  template?: string;
}

export default function FindingsPage() {
  const [vulnerabilities, setVulnerabilities] =
  useState<Vulnerability[]>([]);
  const [scanInfo, setScanInfo] =
  useState({
    target: '',
    riskScore: 0,
    findings: 0,
  });
  useEffect(() => {

    const fetchFindings =
      async () => {

        const API_URL =
        getApiUrl();
  
        try {
  
          const response =
  await apiFetch(
    `${API_URL}/api/scan/history`
  );
  
          const data =
            await response.json();
  
            const jobs =
            data.jobs || [];
          
          if (!jobs.length) return;
          
          const latestJob = jobs[0];

const findings =
  latestJob.results?.vulnerabilities || [];

setVulnerabilities(findings);

setScanInfo({
  target:
    latestJob.target || '-',

  riskScore:
    latestJob.results?.riskScore || 0,

  findings:
    findings.length,
});
  
        } catch (error) {
  
          console.error(
            error
          );
        }
      };
  
    fetchFindings();
  
  }, []);

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

      <div className="grid grid-cols-3 gap-4 mb-6">

  <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
    <p className="text-zinc-500 text-xs">
      Target
    </p>

    <p className="text-emerald-400 font-semibold">
      {scanInfo.target}
    </p>
  </div>

  <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
    <p className="text-zinc-500 text-xs">
      Risk Score
    </p>

    <p className="text-red-400 font-semibold">
      {scanInfo.riskScore}
    </p>
  </div>

  <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
    <p className="text-zinc-500 text-xs">
      Findings
    </p>

    <p className="text-blue-400 font-semibold">
      {scanInfo.findings}
    </p>
  </div>

</div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 text-sm">
              <th className="p-4">ID</th>
              <th className="p-4">Vulnerability</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Evidence</th>
              <th className="p-4 text-right">Template</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-sm">
  {vulnerabilities.map((vuln, index) => (
    <tr
      key={index}
      className="hover:bg-zinc-900/30 transition-colors"
    >
      <td className="p-4 font-mono text-zinc-500">
        {index + 1}
      </td>

      <td className="p-4 font-semibold text-white">
        {vuln.name}
      </td>

      <td className="p-4">
        <span
          className={`px-2 py-1 rounded text-xs uppercase border ${getSeverityColor(
            vuln.severity
          )}`}
        >
          {vuln.severity}
        </span>
      </td>

      <td className="p-4 font-mono text-zinc-400">
        {vuln.matched || '-'}
      </td>

      <td className="p-4 text-right text-blue-400">
        {vuln.template || '-'}
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}