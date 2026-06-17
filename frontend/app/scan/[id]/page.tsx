'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'next/navigation';
import { getApiUrl }
  from '../../../lib/config';
import {apiFetch,} from '../../../services/api';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Vulnerability {

  name?: string;

  title?: string;

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

  technologies?: {
  name: string;
  category: string;
}[];

  vulnerabilities?: Vulnerability[];

  headers?: Record<string, string>;

  ssl?: any;

  title?: string;

  hostIp?: string;

  hostingType?: string;

  operatingSystem?: string;

  webServer?: string;

  statusCode?: number;

  contentLength?: number;

  responseTime?: string;

  url?: string;

  cdnName?: string;

  cdnType?: string;

  subdomains?: string[];

  ipv4?: string[];

  ipv6?: string[];


  mx?: any[];

txt?: string[][];

ns?: string[];

cname?: string[];

spf?: boolean;

dmarc?: boolean;

dmarcPolicy?: string | null;

dkim?: boolean;

emailSecurityScore?: number;

country?: string;

region?: string;

city?: string;

timezone?: string;

isp?: string;

organization?: string;

asn?: string;

asnCountry?: string;

}

export default function ScanDetailsPage() {

  const params = useParams();

  const id = params.id as string;

  const [scan, setScan] =
    useState<ScanData | null>(null);

    const criticalCount =
  scan?.vulnerabilities?.filter(
    (v) => v.severity === 'critical'
  ).length || 0;

const highCount =
  scan?.vulnerabilities?.filter(
    (v) => v.severity === 'high'
  ).length || 0;

const mediumCount =
  scan?.vulnerabilities?.filter(
    (v) => v.severity === 'medium'
  ).length || 0;

const lowCount =
  scan?.vulnerabilities?.filter(
    (v) => v.severity === 'low'
  ).length || 0;

const infoCount =
  scan?.vulnerabilities?.filter(
    (v) => v.severity === 'info'
  ).length || 0;

  const [loading, setLoading] =
    useState(true);

    const [progress, setProgress] =
  useState(0);

const [stage, setStage] =
  useState('Waiting...');

  const stages = [
  'DNS Lookup',
  'Port Scan',
  'HTTPX',
  'SSL Scan',
  'Subdomain Enumeration',
  'Email Security',
  'GeoIP Intelligence',
  'Completed',
];

  useEffect(() => {

    const fetchScan = async () => {

      try {

        const response =
  await apiFetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/scan/${id}`
);

          const data =
          await response.json();
        
        const job = data.job;

        console.log(
  'JOB RESULTS:',
  job.results
);
        
        setScan({
          target: job.target,
          openPorts:
            job.results?.openPorts || [],
          riskScore:
            job.results?.riskScore || 0,
          technologies:
            job.results?.technologies || [],
          vulnerabilities:
            job.results?.vulnerabilities || [],
          headers:
            job.results?.headers || {},
          ssl:
            job.results?.ssl || {},

            hostIp: job.results?.hostIp || '',
            cdnName: job.results?.cdnName || '',
            cdnType: job.results?.cdnType || '',
  webServer: job.results?.webServer || '',
  hostingType:
  job.results?.hostingType || '',

operatingSystem:
  job.results?.operatingSystem || '',
  statusCode: job.results?.statusCode || 0,
  contentLength: job.results?.contentLength || 0,
  responseTime: job.results?.responseTime || '',
  url: job.results?.url || '',
  title:
  job.results?.title || '',

  subdomains:
  job.results?.subdomains || [],

  ipv4:
  job.results?.ipv4 || [],

ipv6:
  job.results?.ipv6 || [],

  mx:
  job.results?.mx || [],

txt:
  job.results?.txt || [],

ns:
  job.results?.ns || [],

cname:
  job.results?.cname || [],

  spf:
  job.results?.spf || false,

dmarc:
  job.results?.dmarc || false,

dmarcPolicy:
  job.results?.dmarcPolicy || null,

dkim:
  job.results?.dkim || false,

emailSecurityScore:
  job.results?.emailSecurityScore || 0,

  country:
  job.results?.country || '',

region:
  job.results?.region || '',

city:
  job.results?.city || '',

timezone:
  job.results?.timezone || '',

        });

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

    fetchScan();

    const socket =
  io(getApiUrl());

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

  const getStatusColor = (
  code?: number
) => {

  if (!code)
    return "text-zinc-400";

  if (code >= 200 && code < 300)
    return "text-emerald-400";

  if (code >= 300 && code < 400)
    return "text-yellow-400";

  if (code >= 400)
    return "text-red-400";

  return "text-zinc-400";
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
  `${process.env.NEXT_PUBLIC_API_URL}/api/scan/report/${id}`,
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

  <div className="space-y-2 mb-5">

  {stages.map((s) => {

    const currentIndex =
      stages.indexOf(stage);

    const stageIndex =
      stages.indexOf(s);

      const completed =
      stage === 'Completed'
        ? true
        : stageIndex < currentIndex;

      const active =
      s === stage &&
      stage !== 'Completed';

    return (

      <div
        key={s}
        className="flex items-center gap-3"
      >

        <div
          className={`
            w-3 h-3 rounded-full
            ${
              completed
                ? 'bg-emerald-500'
                : active
                ? 'bg-yellow-400'
                : 'bg-zinc-600'
            }
          `}
        />

        <span
          className={
            completed
              ? 'text-emerald-400'
              : active
              ? 'text-yellow-400'
              : 'text-zinc-500'
          }
        >
          {s}
        </span>

      </div>
    );

  })}

</div>

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

<div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
  <p className="text-red-400 text-sm">Critical</p>
  <p className="text-3xl font-bold">{criticalCount}</p>
</div>

<div className="bg-orange-900/30 border border-orange-700 rounded-xl p-4">
  <p className="text-orange-400 text-sm">High</p>
  <p className="text-3xl font-bold">{highCount}</p>
</div>

<div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
  <p className="text-yellow-400 text-sm">Medium</p>
  <p className="text-3xl font-bold">{mediumCount}</p>
</div>

<div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4">
  <p className="text-emerald-400 text-sm">Low</p>
  <p className="text-3xl font-bold">{lowCount}</p>
</div>

<div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
  <p className="text-blue-400 text-sm">Info</p>
  <p className="text-3xl font-bold">{infoCount}</p>
</div>

</div>

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
        {
          name: 'Info',
          value:
            scan.vulnerabilities?.filter(
              (v) => v.severity === 'info'
            ).length || 0,
        },
      ]}
      dataKey="value"
      outerRadius={140}
      label={({ name, value }) =>
        `${name} (${value})`
      }
    >
      <Cell fill="#dc2626" />
      <Cell fill="#ea580c" />
      <Cell fill="#eab308" />
      <Cell fill="#16a34a" />
      <Cell fill="#2563eb" />
    </Pie>

    <Tooltip />
    <Legend />

  </PieChart>

</ResponsiveContainer>

        </div>

      </section>

      {/* Ports */}

      <section className="mb-10">

          <h2 className="text-2xl font-bold mb-4">
          HTTPX Information
  </h2>

  <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-zinc-900 rounded-2xl p-5">
      <p className="text-zinc-500 text-sm">
        URL
      </p>
      <p className="text-emerald-400 break-all">
        {scan.url}
      </p>
    </div>

    <div className="bg-zinc-900 rounded-2xl p-5">
      <p className="text-zinc-500 text-sm">
        Host IP
      </p>
      <p>
        {scan.hostIp}
      </p>
    </div>

    <div className="bg-zinc-900 rounded-2xl p-5">
  <p className="text-zinc-500 text-sm">
    CDN Name
  </p>

  <p>
    {scan.cdnName}
  </p>
</div>

<div className="bg-zinc-900 rounded-2xl p-5">
  <p className="text-zinc-500 text-sm">
    CDN Type
  </p>

  <p>
    {scan.cdnType}
  </p>
</div>

    <div className="bg-zinc-900 rounded-2xl p-5">
      <p className="text-zinc-500 text-sm">
        Web Server
      </p>
      <p>
        {scan.webServer}
      </p>
    </div>

    <div className="bg-zinc-900 rounded-2xl p-5">
  <p className="text-zinc-500 text-sm">
    Status Code
  </p>

  <p
    className={`font-semibold ${getStatusColor(
      scan.statusCode
    )}`}
  >
    {scan.statusCode}
  </p>
</div>

    <div className="bg-zinc-900 rounded-2xl p-5">
      <p className="text-zinc-500 text-sm">
        Response Time
      </p>
      <p>
        {scan.responseTime}
      </p>
    </div>

    <div className="bg-zinc-900 rounded-2xl p-5">
      <p className="text-zinc-500 text-sm">
        Content Length
      </p>
      <p>
        {scan.contentLength}
      </p>
    </div>

    <div className="bg-zinc-900 rounded-2xl p-5">
  <p className="text-zinc-500 text-sm">
    Operating System
  </p>

  <p>
    {scan.operatingSystem}
  </p>
</div>

<div className="bg-zinc-900 rounded-2xl p-5">
  <p className="text-zinc-500 text-sm">
    Hosting Type
  </p>

  <p>
    {scan.hostingType}
  </p>
</div>

<div className="bg-zinc-900 rounded-2xl p-5 md:col-span-2">
  <p className="text-zinc-500 text-sm">
    Page Title
  </p>

  <p>
    {scan.title}
  </p>
</div>

  </div>

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

      <section className="mb-10">

  <h2 className="text-2xl font-bold mb-4">
    Subdomains
  </h2>

  <div className="grid md:grid-cols-2 gap-3">

    {scan.subdomains?.length ? (

      scan.subdomains.map(
        (
          sub,
          index
        ) => (

          <div
            key={index}
            className="
              bg-zinc-900
              border
              border-cyan-500/20
              rounded-xl
              px-4
              py-3
              break-all
            "
          >
            {sub}
          </div>

        )
      )

    ) : (

      <div className="text-zinc-500">
        No subdomains found
      </div>

    )}

  </div>

</section>

{/* DNS Recon */}

<section className="mb-10">

  <h2 className="text-2xl font-bold mb-4">
    DNS Recon
  </h2>

  <div className="space-y-6">

    <div>
      <h3 className="font-semibold mb-2">
        A Records
      </h3>

      {scan?.ipv4?.map((ip) => (
        <div
          key={ip}
          className="bg-zinc-900 p-2 rounded"
        >
          {ip}
        </div>
      ))}
    </div>

    <div>
      <h3 className="font-semibold mb-2">
        AAAA Records
      </h3>

      {scan?.ipv6?.map((ip) => (
        <div
          key={ip}
          className="bg-zinc-900 p-2 rounded"
        >
          {ip}
        </div>
      ))}
    </div>

    <div>
      <h3 className="font-semibold mb-2">
        MX Records
      </h3>

      {scan?.mx?.map((record, index) => (
        <div
          key={index}
          className="bg-zinc-900 p-2 rounded"
        >
          {record.exchange}
          {" "}
          (Priority: {record.priority})
        </div>
      ))}
    </div>

    <div>
      <h3 className="font-semibold mb-2">
        NS Records
      </h3>

      {scan?.ns?.map((record) => (
        <div
          key={record}
          className="bg-zinc-900 p-2 rounded"
        >
          {record}
        </div>
      ))}
    </div>

    <div>
      <h3 className="font-semibold mb-2">
        TXT Records
      </h3>

      {scan?.txt?.map((record, index) => (
        <div
          key={index}
          className="bg-zinc-900 p-2 rounded break-all"
        >
          {record.join(" ")}
        </div>
      ))}
    </div>

    <div>
      <h3 className="font-semibold mb-2">
        CNAME Records
      </h3>

      {scan?.cname?.map((record) => (
        <div
          key={record}
          className="bg-zinc-900 p-2 rounded"
        >
          {record}
        </div>
      ))}
    </div>

  </div>

</section>

{/* Email Security */}

<div className="mt-8">

  <h2 className="text-xl font-bold mb-4">
    Email Security
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div className="bg-zinc-900 p-4 rounded-lg">

      <p>
        SPF:
        {" "}
        {scan?.spf
          ? "Enabled ✅"
          : "Missing ❌"}
      </p>

      <p>
        DMARC:
        {" "}
        {scan?.dmarc
          ? "Enabled ✅"
          : "Missing ❌"}
      </p>

      <p>
        DKIM:
        {" "}
        {scan?.dkim
          ? "Enabled ✅"
          : "Missing ❌"}
      </p>

      {scan?.dmarcPolicy && (
        <p>
          Policy:
          {" "}
          {scan.dmarcPolicy}
        </p>
      )}

    </div>

    <div className="bg-zinc-900 p-4 rounded-lg">

      <h3 className="font-semibold mb-2">
        Email Security Score
      </h3>

      <div className="text-3xl font-bold text-emerald-400">
        {scan?.emailSecurityScore || 0}
        /100
      </div>

    </div>

  </div>

</div>

{/* GeoIP Intelligence */}

<div className="mt-8">

  <h2 className="text-xl font-bold mb-4">
    GeoIP Intelligence
  </h2>

  <div className="bg-zinc-900 p-4 rounded-lg">

    <p>
      Country: {scan?.country || "Unknown"}
    </p>

    <p>
      Region: {scan?.region || "Unknown"}
    </p>

    <p>
      City: {scan?.city || "Unknown"}
    </p>

    <p>
      Timezone: {scan?.timezone || "Unknown"}
    </p>

  </div>

</div>

{/* ASN Intelligence */}

<div className="mt-8">

  <h2 className="text-xl font-bold mb-4">
    ASN Intelligence
  </h2>

  <div className="bg-zinc-900 p-4 rounded-lg">

    <p>
      ISP:
      {" "}
      {scan?.isp || "Unknown"}
    </p>

    <p>
      Organization:
      {" "}
      {scan?.organization || "Unknown"}
    </p>

    <p>
      ASN:
      {" "}
      {scan?.asn || "Unknown"}
    </p>

    <p>
      ASN Country:
      {" "}
      {scan?.asnCountry || "Unknown"}
    </p>

  </div>

</div>

      {/* Technologies */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Technologies
        </h2>

        <div className="flex gap-3 flex-wrap">

          {scan.technologies?.map((tech: any) => (

  <div
    key={tech.name}
    className="
      bg-blue-900
      px-3
      py-2
      rounded-xl
      text-sm
    "
  >

    <div>
      {tech.name}
    </div>

    <div
      className="
        text-xs
        text-zinc-400
      "
    >
      {tech.category}
    </div>

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
                    {vuln.name || vuln.title}
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