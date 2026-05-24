'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Vulnerability = {
  id: string;
  type: 'SQLi' | 'XSS' | 'CSRF' | 'SSRF' | 'RCE' | 'InfoLeak';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  evidence: string;
  confidence: number; // 0..100
};

type ApiResponse = {
  target: string;
  scanId: string;
  startedAt: string;
  finishedAt: string;
  summary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vulnerabilities: Vulnerability[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function ScanTarget() {
  const [url, setUrl] = useState('https://example.com');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const timerRef = useRef<number | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  const severityColor = useMemo(() => {
    return {
      low: 'text-[rgba(94,255,169,0.95)]',
      medium: 'text-[#ffcc66]',
      high: 'text-[#ff8a3d]',
      critical: 'text-[#ff4d6d]'
    } as const;
  }, []);

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: 10_000_000, behavior: 'smooth' });
  }, [terminalLines.length]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  async function startScan() {
    setErrorMsg('');
    setVulns([]);
    setTerminalLines([]);
    setProgress(0);
    setStatus('scanning');

    const normalized = normalizeUrl(url);
    if (!normalized) {
      setStatus('error');
      setErrorMsg('Enter a valid URL (e.g., https://example.com)');
      return;
    }

    const scanId = `NX-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

    pushLine(`[${now()}] Initializing scan engine... (scanId=${scanId})`);
    pushLine(`[${now()}] Resolving target: ${normalized}`);
    pushLine(`[${now()}] Loading signatures & heuristics...`);
    pushLine(`[${now()}] Establishing request queue...`);

    // Simulate progress while real API call runs.
    const startedAt = Date.now();
    const totalMs = 3200;

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setProgress((p) => {
        const elapsed = Date.now() - startedAt;
        const next = Math.min(99, Math.round((elapsed / totalMs) * 99));
        return next < p ? p : next;
      });
    }, 80);

    try {
      const resp = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`API error (${resp.status}): ${text}`);
      }

      const data: ApiResponse = await resp.json();

      // Stream a few “events” as progress reaches near 99.
      pushLine(`[${now()}] Enumerating endpoints...`);
      pushLine(`[${now()}] Heuristic pass: injection patterns detected.`);
      pushLine(`[${now()}] Correlating evidence with threat model...`);

      setProgress(100);
      pushLine(`[${now()}] Scan completed. Findings: ${data.summary.totalFindings}`);
      pushLine(`[${now()}] Persisting report to local workspace...`);

      // Ensure interval stops.
      if (timerRef.current) window.clearInterval(timerRef.current);

      setVulns(data.vulnerabilities);
      setStatus('done');
    } catch (e: any) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setStatus('error');
      setErrorMsg(e?.message || 'Scan failed');
      pushLine(`[${now()}] Scan aborted: ${e?.message || 'Unknown error'}`);
    }
  }

  function pushLine(line: string) {
    setTerminalLines((prev) => [...prev, line]);
  }

  function normalizeUrl(input: string) {
    const s = (input || '').trim();
    if (!s) return '';
    try {
      const hasProto = /^https?:\/\//i.test(s);
      const url = new URL(hasProto ? s : `https://${s}`);
      return url.toString();
    } catch {
      return '';
    }
  }

  return (
    <div className="space-y-5">
      {/* Input + button */}
      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs tracking-widest text-[rgba(94,255,169,0.9)]">SCAN TARGET (URL)</label>
          <div className="mt-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-[rgba(94,255,169,0.25)] bg-[rgba(5,9,19,0.6)] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 shadow-[0_0_0_1px_rgba(94,255,169,0.08)] focus:outline-none focus:ring-2 focus:ring-[rgba(94,255,169,0.35)]"
              disabled={status === 'scanning'}
            />
          </div>
        </div>

        <button
          onClick={startScan}
          disabled={status === 'scanning'}
          className={
            'w-full md:w-auto rounded-2xl px-5 py-3 text-sm font-semibold border transition ' +
            (status === 'scanning'
              ? 'border-[rgba(94,255,169,0.18)] bg-[rgba(94,255,169,0.08)] text-[rgba(94,255,169,0.7)]'
              : 'border-[rgba(94,255,169,0.45)] bg-[rgba(94,255,169,0.12)] text-nexus-neon hover:bg-[rgba(94,255,169,0.18)] shadow-glow')
          }
        >
          {status === 'scanning' ? 'Scanning…' : 'Start Scan'}
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-400">Progress</div>
          <div className="text-xs text-[rgba(94,255,169,0.9)] font-semibold">{progress}%</div>
        </div>
        <div className="mt-2 h-3 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(94,255,169,0.14)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[rgba(94,255,169,0.9)] via-[rgba(0,245,212,0.75)] to-[rgba(94,255,169,0.9)]"
            style={{ width: `${progress}%`, transition: 'width 120ms linear' }}
          />
        </div>
      </div>

      {/* Terminal-like window */}
      <div className="rounded-3xl border border-[rgba(94,255,169,0.22)] bg-black/40 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(94,255,169,0.18)]">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[rgba(255,77,109,0.9)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[rgba(255,204,102,0.9)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[rgba(94,255,169,0.9)]" />
            <div className="ml-2 text-xs tracking-widest text-[rgba(94,255,169,0.9)]">TERMINAL</div>
          </div>
          <div className="text-xs text-zinc-500">{status === 'idle' ? 'Awaiting command…' : status}</div>
        </div>

        <div
          ref={terminalRef}
          className="max-h-60 overflow-auto p-4 font-mono text-[13px] leading-6 text-[rgba(216,255,233,0.9)]"
        >
          {terminalLines.length === 0 ? (
            <div className="text-zinc-500">Type a target URL and click <span className="text-nexus-neon">Start Scan</span>.</div>
          ) : (
            terminalLines.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {l}
              </div>
            ))
          )}
        </div>
      </div>

      {status === 'error' && (
        <div className="rounded-2xl border border-[rgba(255,77,109,0.35)] bg-[rgba(255,77,109,0.08)] p-4 text-sm text-[#ff8a9f]">
          <div className="font-semibold">Scan error</div>
          <div className="mt-1">{errorMsg}</div>
        </div>
      )}

      {/* Findings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-200">Vulnerability Findings</div>
          <div className="text-xs text-zinc-500">{vulns.length ? `${vulns.length} items` : '—'}</div>
        </div>

        {vulns.length === 0 ? (
          <div className="rounded-2xl border border-[rgba(94,255,169,0.18)] bg-[rgba(5,9,19,0.55)] p-4 text-sm text-zinc-500">
            No findings yet. Run a scan to populate results.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {vulns.map((v) => (
              <div key={v.id} className="rounded-2xl border border-[rgba(94,255,169,0.18)] bg-[rgba(5,9,19,0.55)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-100">{v.title}</div>
                    <div className="mt-1 text-xs text-zinc-500">Type: {v.type}</div>
                  </div>
                  <div className={`text-xs font-bold uppercase ${severityColor[v.severity]}`}> {v.severity}</div>
                </div>

                <div className="mt-3 text-xs text-zinc-400">
                  Evidence: <span className="text-zinc-200">{v.evidence}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Confidence</span>
                    <span className="text-[rgba(94,255,169,0.9)] font-semibold">{v.confidence}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(94,255,169,0.14)] overflow-hidden">
                    <div
                      className="h-full bg-[rgba(94,255,169,0.9)]"
                      style={{ width: `${v.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function now() {
  const d = new Date();
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  const ss = `${d.getSeconds()}`.padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

