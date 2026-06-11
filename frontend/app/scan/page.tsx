'use client';

import React, {useState,useEffect,} from 'react';
import { getApiUrl } from '../../lib/config';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import {apiFetch,} from '../../services/api';

interface Vulnerability {

  name: string;

  severity: string;

  description?: string;

  matched?: string;

  cve?: string[];
}

export default function ScanPage() {

  const router = useRouter();

  const [target, setTarget] =
    useState('');

  const [progress, setProgress] =
    useState(0);

  const [scanning, setScanning] =
    useState(false);

  const [logs, setLogs] =
    useState<string[]>([]);

    interface Technology {
  name: string;
  category: string;
}

const [liveTechnologies, setLiveTechnologies] =
  useState<Technology[]>([]);

  const [liveVulnerabilities, setLiveVulnerabilities] =
    useState<any[]>([]);

  const [currentStage, setCurrentStage] =
    useState('Waiting...');

    useEffect(() => {

      const socket =
        io(getApiUrl());
    
      socket.on(
        'scan-log',
        (data: any) => {
    
          setLogs((old) => [
            ...old,
            data.message,
          ]);
    
        }
      );
    
      socket.on(
        'technologies',
        (data: any) => {
    
          setLiveTechnologies(
            data.technologies || []
          );
    
        }
      );
    
      socket.on(
        'vulnerabilities',
        (data: any) => {
    
          setLiveVulnerabilities(
            data.vulnerabilities || []
          );
    
        }
      );

      socket.on(
        'scan-progress',
        (data: any) => {

          console.log(
            'PROGRESS EVENT:',
            data
          );
      
          setProgress(
            data.progress || 0
          );
      
        }
      );

      socket.on(
        'scan-stage',
        (data: any) => {
      
          setCurrentStage(
            data.stage || 'Unknown'
          );
      
        }
      );

      socket.on(
        'scan-completed',
        () => {
      
          setLogs((old) => [
            ...old,
            '[✓] Scan Completed',
          ]);
      
        }
      );
    
      return () => {
        socket.disconnect();
      };
    
    }, []);

  const [result, setResult] =
    useState<any>(null);

  const calculateRisk = (
    vulns: Vulnerability[]
  ) => {

    let score = 0;

    vulns?.forEach((v) => {

      switch (
        v.severity?.toLowerCase()
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
    });

    return score;
  };

  const getSeverityColor = (
    severity: string
  ) => {

    switch (
      severity?.toLowerCase()
    ) {

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

  const handleScan = async () => {

    if (!target) {

      return alert(
        'Please enter a target first'
      );
    }

    setScanning(true);

    setProgress(0);

    setLogs([]);

    setResult(null);

    try {

      setLogs((l) => [

        ...l,

        '[00:01] Initializing scan engine...',

        `[00:02] Target locked: ${target}`,

      ]);

      const API_URL =
  getApiUrl();

  const cleanTarget =
  target
    .replace('https://', '')
    .replace('http://', '')
    .split('/')[0];
    const response =
    await apiFetch(
      `${API_URL}/api/scan`,
          {

            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              url: cleanTarget,
            }),
          }
        );

      const data =
        await response.json();

        console.log(
          'SCAN RESPONSE:',
          data
        );

      setResult(data);

      router.push(
        `/scan/${data.jobId}`
      );

      setLogs([]);

    } catch (err) {

      console.error(err);

      setLogs((l) => [

        ...l,

        '[ERROR] Failed to connect to backend scanner',

      ]);

    } finally {

      setScanning(false);
    }
  };

  const vulnerabilities =
  liveVulnerabilities.length > 0
    ? liveVulnerabilities
    : result?.results?.vulnerabilities || [];

  const riskScore =
    calculateRisk(vulnerabilities);

  return (

    <div className="p-8 text-zinc-100 min-h-screen bg-black">

      <h1 className="text-5xl font-bold text-emerald-400 mb-8">
        Nexus Recon Scanner
      </h1>

      {/* INPUT */}

      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="google.com"
          value={target}
          onChange={(e) =>
            setTarget(e.target.value)
          }
          className="
            w-full
            max-w-2xl
            bg-zinc-900
            border
            border-zinc-800
            rounded-xl
            p-4
            text-white
            focus:border-emerald-500
            outline-none
          "
        />

        <button
          onClick={handleScan}
          disabled={scanning}
          className="
            px-8
            py-4
            bg-emerald-600
            hover:bg-emerald-500
            rounded-xl
            font-bold
            text-black
            transition-all
          "
        >

          {scanning
            ? 'SCANNING...'
            : 'START SCAN'}

        </button>

      </div>

      {/* PROGRESS */}

      <div className="mb-2 text-sm text-emerald-400">

          Current Stage:

      <span className="ml-2 font-semibold">
        {currentStage}
      </span>

      </div>

      <div className="
        w-full
        max-w-2xl
        bg-zinc-900
        h-3
        rounded-full
        overflow-hidden
        mb-6
      ">

        <div
          className="
            bg-emerald-400
            h-full
            transition-all
            duration-300
          "
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {/* LOGS */}

      <div className="
        bg-black
        border
        border-zinc-800
        rounded-2xl
        p-4
        font-mono
        text-xs
        text-zinc-400
        h-56
        overflow-y-auto
        mb-8
        max-w-4xl
      ">

        {logs.map((log, i) => (

          <div
            key={i}
            className="mb-2"
          >
            {log}
          </div>

        ))}

      </div>

      {/* RESULTS */}

      {result && (

        <div className="space-y-8 max-w-6xl">

          {/* OVERVIEW */}

          <div className="
            grid
            grid-cols-1
            md:grid-cols-4
            gap-6
          ">

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">

              <h2 className="text-zinc-400 text-sm">
                Open Ports
              </h2>

              <p className="text-4xl font-bold mt-3 text-emerald-400">

                {result?.results?.openPorts?.length || 0}

              </p>

            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">

              <h2 className="text-zinc-400 text-sm">
                Technologies
              </h2>

              <p className="text-4xl font-bold mt-3 text-blue-400">

                {liveTechnologies.length ||
                  result?.results?.technologies?.length || 0}

              </p>

            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">

              <h2 className="text-zinc-400 text-sm">
                Vulnerabilities
              </h2>

              <p className="text-4xl font-bold mt-3 text-red-400">

                {vulnerabilities.length}

              </p>

            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">

              <h2 className="text-zinc-400 text-sm">
                Risk Score
              </h2>

              <p className="text-4xl font-bold mt-3 text-yellow-400">

                {riskScore}

              </p>

            </div>

          </div>

          {/* TECHNOLOGIES */}

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-6
          ">

            <h2 className="text-2xl font-bold mb-4">
              Technologies
            </h2>

            <div className="flex gap-3 flex-wrap">

            {(
liveTechnologies.length > 0
? liveTechnologies
: result?.results?.technologies || []
).map(
(tech: Technology) => (

                  <div
  key={tech.name}
  className="
    bg-blue-900
    px-4
    py-2
    rounded-xl
  "
>
  <div>{tech.name}</div>

  <div className="text-xs text-zinc-400">
    {tech.category}
  </div>
</div>

                )
              )}

            </div>

          </div>

          {/* VULNERABILITIES */}

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-6
          ">

            <h2 className="text-2xl font-bold mb-6">
              Vulnerabilities
            </h2>

            <div className="space-y-4">

              {vulnerabilities.length === 0 && (

                <div className="text-zinc-500">
                  No vulnerabilities detected.
                </div>

              )}

              {vulnerabilities.map(
                (
                  vuln: Vulnerability,
                  index: number
                ) => (

                  <div
                    key={index}
                    className="
                      bg-black
                      border
                      border-zinc-800
                      rounded-2xl
                      p-5
                    "
                  >

                    <div className="
                      flex
                      items-center
                      justify-between
                      mb-4
                    ">

                      <h3 className="text-xl font-bold">

                        {vuln.name}

                      </h3>

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-xl
                          text-sm
                          font-bold
                          ${getSeverityColor(
                            vuln.severity
                          )}
                        `}
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

                        <div className="text-zinc-500 text-sm mb-1">
                          Matched URL
                        </div>

                        <div className="text-emerald-400 break-all">
                          {vuln.matched}
                        </div>

                      </div>

                    )}

                    {vuln.cve &&
                      vuln.cve.length > 0 && (

                      <div className="flex gap-2 flex-wrap">

                        {vuln.cve.map(
                          (cve) => (

                            <a
                              key={cve}
                              href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                              target="_blank"
                              className="
                                bg-red-900
                                hover:bg-red-700
                                px-3
                                py-1
                                rounded-lg
                                text-sm
                              "
                            >

                              {cve}

                            </a>

                          )
                        )}

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}