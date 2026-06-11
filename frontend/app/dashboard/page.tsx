'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { io } from 'socket.io-client';

import { getApiUrl } from '../../lib/config';

import {
  apiFetch,
} from '../../services/api';


interface Vulnerability {
  name: string;
  severity: string;
}

interface Technology {
  name: string;
  category: string;
}

interface ScanResult {
  technologies?: Technology[];
  vulnerabilities?: Vulnerability[];
}

interface ScanJob {
  _id: string;
  target: string;
  status: string;
  results?: ScanResult;
}

export default function DashboardPage() {

  const API_URL = getApiUrl();

  const router = useRouter();

  const logout = () => {

    localStorage.removeItem(
      'token'
    );
  
    router.push(
      '/auth/login'
    );
  };

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    risk: 0,
    vulnerabilities: 0,
    averageRisk: 0,
  });

  const [jobs, setJobs] =
    useState<ScanJob[]>([]);

    const clearHistory = async () => {

      const confirmed =
        confirm(
          'Are you sure you want to delete all scan history?'
        );
    
      if (!confirmed) {
        return;
      }
    
      try {
    
        const API_URL =
          getApiUrl();
    
          await apiFetch(
            `${API_URL}/api/scan/history`,
            {
              method: 'DELETE',
            }
          );
    
        setJobs([]);
    
        setStats({
          total: 0,
          completed: 0,
          failed: 0,
          risk: 0,
          vulnerabilities: 0,
          averageRisk: 0,
        });
    
      } catch (error) {
    
        console.error(error);
    
        alert(
          'Failed to clear history'
        );
      }
    };

  useEffect(() => {

    const token =
  localStorage.getItem(
    'token'
  ) ||
  sessionStorage.getItem(
    'token'
  );

if (!token) {

  router.push(
    '/auth/login'
  );

  return;
}

    const fetchStats = async () => {

      try {

        const response =
        await apiFetch(
          `${API_URL}/api/scan/history`
        );

        const data =
          await response.json();

        const jobsData =
          data.jobs || [];

        setJobs(jobsData);

        const total =
          jobsData.length;
        const completed =
          jobsData.filter(
            (job: ScanJob) =>
              job.status === 'completed'
          ).length;

        const failed =
          jobsData.filter(
            (job: ScanJob) =>
              job.status === 'failed'
          ).length;

          let totalVulnerabilities = 0;

        let totalRisk = 0;

        jobsData.forEach(
          (job: ScanJob) => {

            const vulns =
              job.results?.vulnerabilities || [];

              totalVulnerabilities +=
                vulns.length;

            vulns.forEach(
              (vuln: Vulnerability) => {

                if (
                  vuln.severity === 'critical'
                ) {
                  totalRisk += 10;
                }

                else if (
                  vuln.severity === 'high'
                ) {
                  totalRisk += 7;
                }

                else if (
                  vuln.severity === 'medium'
                ) {
                  totalRisk += 4;
                }

                else if (
                  vuln.severity === 'low'
                ) {
                  totalRisk += 1;
                }
              }
              
            );
          }
        );

        const averageRisk =
  total > 0
    ? Math.round(totalRisk / total)
    : 0;

        setStats({
          total,
          completed,
          failed,
          risk: totalRisk,
          vulnerabilities:
          totalVulnerabilities,
          averageRisk,
        });

      } catch (error) {

        console.error(error);
      }
    };

    fetchStats();

const socket = io(API_URL);

socket.on(
  'scan-completed',
  () => {
    fetchStats();
  }
);

return () => {
  socket.disconnect();
};

}, [router]);

  return (

    <main className="min-h-screen bg-black text-white p-10">

<div className="flex items-center justify-between mb-10">

<h1 className="text-5xl font-bold text-emerald-400">
  Nexus Recon Dashboard
</h1>

<button
  onClick={logout}
  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-all"
>
  Logout
</button>

</div>

      {/* STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-emerald-500 transition-all">
          <h2 className="text-zinc-400 text-sm">
            Total Scans
          </h2>

          <p className="text-4xl font-bold mt-3">
            {stats.total}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-emerald-500 transition-all">
          <h2 className="text-zinc-400 text-sm">
            Completed
          </h2>

          <p className="text-4xl font-bold mt-3 text-emerald-400">
            {stats.completed}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-red-500 transition-all">
          <h2 className="text-zinc-400 text-sm">
            Failed
          </h2>

          <p className="text-4xl font-bold mt-3 text-red-400">
            {stats.failed}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-yellow-500 transition-all">
          <h2 className="text-zinc-400 text-sm">
            Risk Score
          </h2>

          <p className="text-4xl font-bold mt-3 text-yellow-400">
            {stats.risk}
          </p>
        </div>

      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-blue-500 transition-all">

  <h2 className="text-zinc-400 text-sm">
    Total Vulnerabilities
  </h2>

  <p className="text-4xl font-bold mt-3 text-blue-400">
    {stats.vulnerabilities}
  </p>

</div>

<div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-cyan-500 transition-all">

  <h2 className="text-zinc-400 text-sm">
    Average Risk
  </h2>

  <p className="text-4xl font-bold mt-3 text-cyan-400">
    {stats.averageRisk}
  </p>

</div>

      {/* RESULTS TABLE */}

      <div>

      <div className="flex items-center justify-between mb-6">

<h2 className="text-3xl font-bold">
  Recent Recon Results
</h2>

<button
  onClick={clearHistory}
  className="
    px-4
    py-2
    bg-red-600
    hover:bg-red-500
    rounded-lg
    text-sm
    font-semibold
    transition-all
  "
>
  Clear History
</button>

</div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">

          <table className="w-full text-left">

            <thead className="bg-zinc-900">

              <tr>

                <th className="p-4">
                  Target
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Technologies
                </th>

                <th className="p-4">
                  Vulnerabilities
                </th>

              </tr>

            </thead>

            <tbody>

              {jobs.map((job) => (

                <tr
                  key={job._id}
                  className="border-t border-zinc-800 bg-black hover:bg-zinc-950 transition-all"
                >

                  {/* TARGET */}

                  <td className="py-4 px-4">

  <Link
    href={`/scan/${job._id}`}
    className="text-emerald-400 hover:text-emerald-300 transition"
  >
    {job.target}
  </Link>

</td>

                  {/* STATUS */}

                  <td className="p-4">

                    <span
                      className={`font-semibold ${
                        job.status === 'completed'
                          ? 'text-emerald-400'

                          : job.status === 'running'
                          ? 'text-yellow-400'

                          : 'text-red-400'
                      }`}
                    >
                      {job.status}
                    </span>

                  </td>

                  {/* TECHNOLOGIES */}

                  <div className="flex flex-wrap gap-2">

  {(job.results?.technologies || [])
    .slice(0, 4)
    .map((tech) => (

      <span
        key={tech.name}
        className="bg-zinc-800 px-2 py-1 rounded text-xs border border-zinc-700"
      >
        {tech.name}
      </span>

    ))}

</div>

                  {/* VULNERABILITIES */}

                  <td className="p-4">

                    <div className="flex flex-wrap gap-2">

                      {(job.results?.vulnerabilities || []).length > 0 ? (

                        (job.results?.vulnerabilities || [])
                          .slice(0, 3)
                          .map((vuln, i) => (

                            <span
                              key={i}
                              className={`px-2 py-1 rounded text-xs font-bold border

                                ${
                                  vuln.severity === 'critical'
                                    ? 'bg-red-700/30 text-red-300 border-red-700'

                                  : vuln.severity === 'high'
                                    ? 'bg-orange-600/30 text-orange-300 border-orange-600'

                                  : vuln.severity === 'medium'
                                    ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500'

                                  : 'bg-blue-600/30 text-blue-300 border-blue-600'
                                }
                              `}
                            >

                              {vuln.name}

                            </span>

                          ))

                      ) : (

                        <span className="text-zinc-500 text-sm">
                          No Findings
                        </span>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );
}