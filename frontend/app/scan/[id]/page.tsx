'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'next/navigation';
import {apiFetch,} from '../../../services/api';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Vulnerability {

  name: string;

  severity: string;

  cve?: string[];

  description?: string;

  matched?: string;

  template?: string;
}

interface ScanData {

  target: string;

  openPorts?: number[];

  riskScore?: number;

  technologies?: string[];

  fingerprints?: string[];

  vulnerabilities?: Vulnerability[];

  headers?: Record<string, string>;

  ssl?: any;
}

export default function ScanDetailsPage() {

  const params = useParams();

  const id = params.id as string;

  const [scan, setScan] =
    useState<ScanData | null>(null);

  const [loading, setLoading] =
    useState(true);

    const [progress, setProgress] =
  useState(0);

const [stage, setStage] =
  useState('Waiting...');

  useEffect(() => {

    const fetchScan = async () => {

      try {

        const response =
  await apiFetch(
    `http://localhost:5000/api/scan/${id}`
  );

          const data =
          await response.json();
        
        const job = data.job;
        
        setScan({
          target: job.target,
          openPorts:
            job.results?.openPorts || [],
          riskScore:
            job.results?.riskScore || 0,
          technologies:
            job.results?.technologies || [],
          fingerprints:
            job.results?.fingerprints || [],
          vulnerabilities:
            job.results?.vulnerabilities || [],
          headers:
            job.results?.headers || {},
          ssl:
            job.results?.ssl || {},
        });

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

    fetchScan();

    const socket =
      io('http://localhost:5000');

      const jobId =
  Array.isArray(id)
    ? id[0]
    : id;

socket.emit(
  'join-scan',
  jobId
);
    
    socket.on(
      'scan-progress',
      (data) => {
    
        setProgress(
          data.progress
        );
      }
    );
    
    socket.on(
      'scan-stage',
      (data) => {
    
        setStage(
          data.stage
        );
      }
    );
    
    socket.on(
      'scan-completed',
      () => {
    
        fetchScan();
      }
    );
    
    return () => {
    
      socket.disconnect();
    };
    
    }, [id]);

  const getSeverityColor = (
    severity: string
  ) => {

    switch (severity?.toLowerCase()) {

      case 'critical':
        return 'bg-red-600';

      case 'high':
        return 'bg-orange-500';

      case 'medium':
        return 'bg-yellow-500';

      case 'low':
        return 'bg-emerald-500';

      default:
        return 'bg-zinc-600';
    }
  };

  const calculateRisk = () => {

    if (!scan?.vulnerabilities)
      return 0;

    let score = 0;

    scan.vulnerabilities.forEach(
      (vuln) => {

        switch (
          vuln.severity?.toLowerCase()
        ) {

          case 'critical':
            score += 10;
            break;

          case 'high':
            score += 7;
            break;

          case 'medium':
            score += 4;
            break;

          case 'low':
            score += 1;
            break;
        }
      }
    );

    return score;
  };

  if (loading) {

    return (

      <div className="min-h-screen bg-black text-white p-10">
        Loading scan results...
      </div>
    );
  }

  if (!scan) {

    return (

      <div className="min-h-screen bg-black text-red-500 p-10">
        Scan not found.
      </div>
    );
  }

      const riskScore =
      scan.riskScore || 0;

  return (

    <main className="min-h-screen bg-black text-white p-10">

<div className="flex items-center justify-between mb-10">

<h1 className="text-5xl font-bold text-emerald-400">
  {scan.target}
</h1>

<button
  onClick={async () => {
    const token =
      localStorage.getItem('token');
  
    const response = await fetch(
      `http://localhost:5000/api/scan/report/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const blob =
      await response.blob();
  
    const url =
      window.URL.createObjectURL(blob);
  
    window.open(url, '_blank');
  }}
  className="
    bg-emerald-600
    hover:bg-emerald-500
    px-5
    py-3
    rounded-xl
    font-semibold
  "
>
  📄 Export PDF
</button>

</div>

<div className="mb-10 bg-zinc-900 rounded-2xl p-5">

  <h2 className="text-xl font-bold mb-3">
    Scan Progress
  </h2>

  <p className="mb-3 text-emerald-400">
    {stage}
  </p>

  <div className="w-full h-4 bg-zinc-700 rounded">

    <div
      className="h-4 bg-emerald-500 rounded transition-all"
      style={{
        width: `${progress}%`,
      }}
    />

  </div>

  <p className="mt-2">
    {progress}%
  </p>

</div>

      {/* Risk Meter */}

      <div className="mb-10">

        <h2 className="text-xl mb-3">
          Risk Score
        </h2>

        <div className="w-full h-6 bg-zinc-800 rounded overflow-hidden">

          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{
              width: `${Math.min(
                riskScore * 5,
                100
              )}%`,
            }}
          />

        </div>

        <p className="mt-2 text-yellow-400 text-2xl font-bold">
          {riskScore}
        </p>

      </div>

      {/* Vulnerability Chart */}

      <section className="mb-12">

        <h2 className="text-2xl font-bold mb-6">
          Vulnerability Distribution
        </h2>

        <div className="bg-zinc-900 rounded-2xl p-6 h-[400px]">

        <ResponsiveContainer
  width="100%"
  height={350}
>

  <PieChart>

    <Pie
      data={[
        {
          name: 'Critical',
          value:
            scan.vulnerabilities?.filter(
              (v) => v.severity === 'critical'
            ).length || 0,
        },
        {
          name: 'High',
          value:
            scan.vulnerabilities?.filter(
              (v) => v.severity === 'high'
            ).length || 0,
        },
        {
          name: 'Medium',
          value:
            scan.vulnerabilities?.filter(
              (v) => v.severity === 'medium'
            ).length || 0,
        },
        {
          name: 'Low',
          value:
            scan.vulnerabilities?.filter(
              (v) => v.severity === 'low'
            ).length || 0,
        },
      ]}
      dataKey="value"
      outerRadius={140}
      label
    >
      <Cell fill="#dc2626" />
      <Cell fill="#ea580c" />
      <Cell fill="#eab308" />
      <Cell fill="#16a34a" />
    </Pie>

    <Tooltip />

  </PieChart>

</ResponsiveContainer>

        </div>

      </section>

      {/* Ports */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Open Ports
        </h2>

        <div className="flex gap-3 flex-wrap">

          {scan.openPorts?.map((port) => (

            <div
              key={port}
              className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl"
            >
              {port}
            </div>

          ))}

        </div>

      </section>

      {/* Technologies */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Technologies
        </h2>

        <div className="flex gap-3 flex-wrap">

          {scan.technologies?.map((tech) => (

            <div
              key={tech}
              className="bg-blue-900 px-4 py-2 rounded-xl"
            >
              {tech}
            </div>

          ))}

        </div>

      </section>

      {/* Fingerprints */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Fingerprints
        </h2>

        <div className="flex gap-3 flex-wrap">

          {scan.fingerprints?.map((fp) => (

            <div
              key={fp}
              className="bg-purple-900 px-4 py-2 rounded-xl"
            >
              {fp}
            </div>

          ))}

        </div>

      </section>

      {/* Vulnerabilities */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Vulnerabilities
        </h2>

        <div className="space-y-4">

          {scan.vulnerabilities?.map(
            (vuln, index) => (

              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
              >

                <div className="flex items-center justify-between mb-4">

                  <h3 className="text-xl font-bold">
                    {vuln.name}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-xl text-sm font-bold ${getSeverityColor(
                      vuln.severity
                    )}`}
                  >
                    {vuln.severity}
                  </span>

                </div>

                {vuln.description && (

                  <p className="text-zinc-400 mb-4">
                    {vuln.description}
                  </p>

                )}

                {vuln.matched && (

                  <div className="mb-4">

                    <span className="text-zinc-500 text-sm">
                      Matched:
                    </span>

                    <div className="text-emerald-400 break-all">
                      {vuln.matched}
                    </div>

                  </div>

                )}

                {vuln.template && (

                  <div className="mb-4">

                    <span className="text-zinc-500 text-sm">
                      Template:
                    </span>

                    <div className="text-blue-400">
                      {vuln.template}
                    </div>

                  </div>

                )}

                {vuln.cve &&
                  vuln.cve.length > 0 && (

                  <div className="flex gap-2 flex-wrap">

                    {vuln.cve.map((cve) => (

                      <a
                        key={cve}
                        href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                        target="_blank"
                        className="bg-red-900 hover:bg-red-700 transition px-3 py-1 rounded-lg text-sm"
                      >
                        {cve}
                      </a>

                    ))}

                  </div>

                )}

              </div>
            )
          )}

        </div>

      </section>

      {/* Headers */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Headers
        </h2>

        <div className="bg-zinc-900 rounded-2xl p-5 overflow-auto">

          <pre className="text-sm text-zinc-300">
            {JSON.stringify(
              scan.headers,
              null,
              2
            )}
          </pre>

        </div>

      </section>

      {/* SSL */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          SSL Information
        </h2>

        <div className="bg-zinc-900 rounded-2xl p-5 overflow-auto">

          <pre className="text-sm text-zinc-300">
            {JSON.stringify(
              scan.ssl,
              null,
              2
            )}
          </pre>

        </div>

      </section>

    </main>
  );
}