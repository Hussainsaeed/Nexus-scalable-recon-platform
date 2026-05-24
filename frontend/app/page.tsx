import ScanTarget from './scan/ScanTarget';

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cybersecurity Scanning Dashboard</h1>
          <p className="mt-2 text-zinc-400 max-w-2xl">
            Enter a target URL to simulate an active scan. The UI will stream progress and
            display dummy vulnerability findings (MVP).
          </p>
        </div>

        <div className="hidden xl:block rounded-2xl border border-[rgba(94,255,169,0.22)] bg-[rgba(5,9,19,0.55)] px-5 py-4">
          <div className="text-xs tracking-widest text-[rgba(94,255,169,0.9)]">NEXT SIGNAL</div>
          <div className="mt-2 text-sm text-zinc-300">
            Connect UI ↔ Express API via <span className="text-nexus-neon">/api/scan</span>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-[rgba(94,255,169,0.22)] bg-[rgba(4,6,10,0.35)] backdrop-blur">
        <div className="p-6 md:p-8">
          <ScanTarget />
        </div>
      </section>

      <section className="rounded-3xl border border-[rgba(94,255,169,0.22)] bg-[rgba(4,6,10,0.35)]">
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-nexus-neon">Mission Panel</h2>
          <div className="mt-3 grid md:grid-cols-3 gap-4">
            <InfoCard title="Threat Model" body="Simulated payload analysis focusing on SQLi/XSS style findings." />
            <InfoCard title="Transport" body="Frontend calls backend with JSON over HTTP. CORS enabled on Express." />
            <InfoCard title="Output" body="Terminal-like stream + structured JSON vulnerability list." />
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(94,255,169,0.18)] bg-[rgba(5,9,19,0.55)] p-4">
      <div className="text-sm font-semibold text-zinc-100">{title}</div>
      <div className="mt-2 text-sm text-zinc-400">{body}</div>
    </div>
  );
}

