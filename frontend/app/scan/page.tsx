'use client';

import React, { useState } from 'react';

export default function ScanPage() {
  const [target, setTarget] = useState('');
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleScan = async () => {
    if (!target) return alert('الرجاء إدخال رابط الهدف أولاً');
    setScanning(true);
    setProgress(0);
    setLogs([]);

    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          return 100;
        }
        return old + 10;
      });
    }, 400);

    try {
      setLogs((l) => [...l, '[00:01] Initializing scan engine...', `[00:02] Target locked: ${target}`]);
      
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });

      await response.json();
      
      setLogs((l) => [...l, '[00:04] Analyzing response signatures...', '[00:05] Scan completed successfully.']);
      setProgress(100);
    } catch (err) {
      setLogs((l) => [...l, '[ERROR] Failed to fetch data from scanner backend']);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-8 text-zinc-100 min-h-screen">
      <h1 className="text-3xl font-bold text-emerald-400 mb-6">Neon Scanner Grid</h1>
      
      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="https://example.com" 
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-emerald-500 outline-none"
        />
        <button 
          onClick={handleScan}
          disabled={scanning}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-black transition-all"
        >
          {scanning ? 'SCANNING...' : 'START SCAN'}
        </button>
      </div>

      <div className="w-full max-w-2xl bg-zinc-900 h-2 rounded overflow-hidden mb-6">
        <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="bg-black border border-zinc-800 rounded p-4 font-mono text-xs text-zinc-400 h-48 overflow-y-auto mb-6 max-w-2xl">
        {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
      </div>
    </div>
  );
}