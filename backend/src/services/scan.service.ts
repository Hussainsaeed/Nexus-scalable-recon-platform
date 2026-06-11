import net from "net";
import https from "https";
import tls from "tls";
import { getAsnInfo } from '../utils/asnLookup';

import {
  exec,
  execSync,
} from "child_process";

import { promisify } from "util";

import ScanJob from "../models/ScanJob.model";
import ScanResult from "../models/ScanResult";
import { calculateRiskScore } from "./risk.service";
import { runHttpx } from "./httpx.service";
import { runDnsLookup } from "./dns.service";
import {
  analyzeSecurityHeaders,
} from "./securityHeaders.service";
import { runSubfinder }
  from "./subfinder.service";

import { io } from "../server";
import {
  getGeoIpInfo,
} from "./geoip.service";

const execAsync = promisify(exec);

// ======================================
// PORT SCANNER
// ======================================

const scanPort = (
  host: string,
  port: number
): Promise<boolean> => {

  return new Promise((resolve) => {

    const socket =
      new net.Socket();

    socket.setTimeout(2000);

    socket.on(
      "connect",
      () => {

        socket.destroy();

        resolve(true);
      }
    );

    socket.on(
      "timeout",
      () => {

        socket.destroy();

        resolve(false);
      }
    );

    socket.on(
      "error",
      () => {

        socket.destroy();

        resolve(false);
      }
    );

    socket.connect(
      port,
      host
    );
  });
};

// ======================================
// RUN FULL RECON PIPELINE
// ======================================

export const runScanJob = async (
  jobId: string,
  target: string
) => {

  const startedAt =
    new Date();

  try {

    // ======================================
    // UPDATE STATUS
    // ======================================

    await ScanJob.findByIdAndUpdate(
      jobId,
      {
        status: "running",
        progress: 10,
        startedAt,
      }
    );

    console.log(
      `[JOB CREATED] ${target}`
    );

    io.to(jobId).emit(
      "scan-log",
      {
        message:
          `[+] Scan started for ${target}`,
      }
    );
    
    io.to(jobId).emit(
      'scan-progress',
      {
        progress: 10,
      }
    );
    // ======================================
// DNS LOOKUP
// ======================================

const {
  ipv4,
  ipv6,
  mx,
  txt,
  ns,
  cname,
  spf,
  dmarc,
  dmarcPolicy,
  dkim,
} =
  await runDnsLookup(
    target
  );

await ScanJob.findByIdAndUpdate(
  jobId,
  {
    progress: 25,
  }
);

io.to(jobId).emit(
  'scan-progress',
  {
    progress: 25,
  }
);

io.to(jobId).emit(
  'scan-stage',
  {
    stage: 'DNS Lookup',
  }
);

console.log("DNS IPv4:", ipv4);
console.log("DNS IPv6:", ipv6);
console.log("DNS MX:", mx);
console.log("DNS TXT:", txt);
console.log("DNS NS:", ns);
console.log("DNS CNAME:", cname);
console.log(
  "SPF DETECTED:",
  spf
);
console.log(
  "DMARC DETECTED:",
  dmarc
);

console.log(
  "DMARC POLICY:",
  dmarcPolicy
);

console.log(
  "DKIM DETECTED:",
  dkim
);


  // ======================================
    // PORT SCAN
    // ======================================

    const ports = [
      21,
      22,
      80,
      443,
      3306,
    ];

    const openPorts: number[] = [];

    for (const port of ports) {

      const isOpen =
        await scanPort(
          ipv4[0],
          port
        );

      if (isOpen) {

        openPorts.push(port);
      }
    }

    await ScanJob.findByIdAndUpdate(
      jobId,
      {
        progress: 50,
      }
    );

    io.to(jobId).emit(
      'scan-progress',
      {
        progress: 50,
      }
    );
    
    io.to(jobId).emit(
      'scan-stage',
      {
        stage: 'Port Scan',
      }
    );

     // ======================================
    // HTTP HEADERS
    // ======================================

    let headersData: any = {};

    try {

      headersData =
        await new Promise<any>(
          (
            resolve,
            reject
          ) => {

            const req =
              https.get(
                `https://${target}`,

                (response) => {

                  resolve(
                    response.headers
                  );
                }
              );

            req.setTimeout(
              10000,

              () => {

                req.destroy(
                  new Error(
                    "Headers timeout"
                  )
                );
              }
            );

            req.on(
              "error",
              reject
            );
          }
        );

    } catch (error) {

      console.error(
        "HEADERS ERROR:",
        error
      );
    }

    // ======================================
    // SSL SCAN
    // ======================================

    io.to(jobId).emit(
  'scan-stage',
  {
    stage: 'SSL Scan',
  }
);

io.to(jobId).emit(
  'scan-log',
  {
    message:
      '[+] Running SSL Scan...',
  }
);

    let sslData: any = {};

    try {

      sslData =
        await new Promise<any>(
          (
            resolve,
            reject
          ) => {

            const socket =
              tls.connect(
                {
                  host: target,
                  port: 443,
                  servername:
                    target,
                },

                () => {

                  const cert =
                    socket.getPeerCertificate();

                  resolve({

                    issuer:
                      cert.issuer?.O,

                    valid_from:
                      cert.valid_from,

                    valid_to:
                      cert.valid_to,
                  });

                  socket.end();
                }
              );

            socket.setTimeout(
              10000,

              () => {

                socket.destroy(
                  new Error(
                    "SSL timeout"
                  )
                );
              }
            );

            socket.on(
              "error",
              reject
            );
          }
        );

    } catch (error) {

      console.error(
        "SSL ERROR:",
        error
      );
    }

    // ======================================
// HTTPX RECON
// ======================================

io.to(jobId).emit(
  'scan-stage',
  {
    stage: 'HTTPX',
  }
);

io.to(jobId).emit(
  "scan-log",
  {
    message:
      "[+] Running HTTPX...",
  }
);

console.log('[DEBUG] BEFORE HTTPX');

const httpxData =
  await runHttpx(target);

  const subdomains =
  await runSubfinder(target);

console.log(
  "SUBDOMAINS FOUND:",
  subdomains.length
);

console.log('[DEBUG] AFTER HTTPX');

const headerFindings =
  analyzeSecurityHeaders(
    headersData
  );

console.log(
  "HEADER FINDINGS:",
  headerFindings
);

const hasLaravelHeaders =

  Object.entries(
    headersData || {}
  ).some(
    ([key, value]) =>

      String(key)
        .toLowerCase()
        .includes(
          "x-powered-by"
        ) &&

      String(value)
        .toLowerCase()
        .includes(
          "laravel"
        )
  );

  const cookies =

  Array.isArray(
    headersData?.["set-cookie"]
  )

    ? headersData["set-cookie"]
        .join(" ")

    : String(
        headersData?.["set-cookie"] || ""
      );

const hasLaravelCookies =

  cookies
    .toLowerCase()
    .includes(
      "laravel_session"
    )

  ||

  cookies
    .toLowerCase()
    .includes(
      "xsrf-token"
    );
  
    // ======================================
    // EXTRACT HTTPX
    // ======================================

    const technologyCategories: Record<
  string,
  string
> = {

  "Next.js":
    "Frontend Framework",

  "React":
    "JavaScript Library",

  "Node.js":
    "Runtime Environment",

  "Nginx:1.30.2":
    "Web Server",

  "Webpack":
    "Module Bundler",

  "WordPress":
    "CMS",

  "Laravel":
    "PHP Framework",

  "PHP":
    "Programming Language",

  "jQuery":
    "JavaScript Library",

  "Bootstrap":
    "CSS Framework",

  "Cloudflare":
    "CDN",

  "Google Analytics":
    "Analytics Platform",

    "Google Font API":
  "Font Service",

"Google Hosted Libraries":
  "CDN Library",

"HSTS":
  "Security Policy",

"HTTP/3":
  "Network Protocol",

"OneTrust":
  "Privacy Platform",

"hCaptcha":
  "Captcha Service",

"jQuery:3.5.1":
  "JavaScript Library",

  "Cloudflare Bot Management":
  "Security Service",

"Fathom":
  "Analytics Platform",

};

    const technologies =
  (httpxData?.tech || []).map(
    (tech: string) => ({

      name: tech,

      category:

  tech.toLowerCase()
    .includes("wordpress")

    ? "CMS"

  : tech.toLowerCase()
    .includes("woocommerce")

    ? "E-Commerce Platform"

  : tech.toLowerCase()
    .includes("yoast")

    ? "SEO Plugin"

  : tech.toLowerCase()
    .includes("mysql")

    ? "Database"

  : tech.toLowerCase()
    .includes("google tag manager")

    ? "Analytics Platform"

    : tech.toLowerCase()
    .includes("nginx")

    ? "Web Server"

  : technologyCategories[
      tech
    ] || "Unknown",

      confidence:

  tech.toLowerCase().includes("wordpress")
    ? "very-high"

  : tech.toLowerCase().includes("woocommerce")
    ? "very-high"

  : tech.toLowerCase().includes("laravel")
    ? "very-high"

  : tech.toLowerCase().includes("cloudflare")
    ? "very-high"

  : tech.toLowerCase().includes("php")
    ? "high"

  : tech.toLowerCase().includes("mysql")
    ? "high"

  : "medium",

    })
  );

  const rawTechnologies =
  httpxData?.tech || [];

  const isLaravel =
  rawTechnologies.some(
    (t: string) =>
      t.toLowerCase().includes(
        "laravel"
      )
  );

  if (
  isLaravel &&
  !technologies.some(
    (t: any) =>
      t.name === "Laravel"
  )
) {

  technologies.push({
    name: "Laravel",
    category:
      "PHP Framework",
    confidence:
      "high",
  });

}

  const serverHeader =
  httpxData?.webserver
    ?.toLowerCase() || "";

if (
  rawTechnologies.some(
    (t: string) =>
      t.toLowerCase().includes(
        "cloudflare"
      )
  )
) {

  console.log(
    "CLOUDFLARE DETECTED"
  );

}

if (isLaravel) {

  console.log(
    "LARAVEL DETECTED"
  );

}

if (
  hasLaravelHeaders
) {

  console.log(
    "LARAVEL HEADER DETECTED"
  );

}

if (
  hasLaravelCookies
) {

  console.log(
    "LARAVEL COOKIE DETECTED"
  );

}

const hasWordPress =
  technologies.some(
    (t: any) =>
      t.name
        .toLowerCase()
        .includes(
          "wordpress"
        )
  );

if (hasWordPress) {

  console.log(
    "WORDPRESS DETECTED"
  );

}

      console.log(
  "RAW TECHNOLOGIES:",
  technologies
);

const uniqueTechnologies =
  technologies.filter(
    (
      tech: any,
      index: number,
      self: any[]
    ) => {

      const normalizedName =

        tech.name
          .toLowerCase()

          .includes("wordpress")

          ? "wordpress"

        : tech.name
          .toLowerCase()
          .includes("woocommerce")

          ? "woocommerce"

        : tech.name
          .toLowerCase()
          .includes("yoast")

          ? "yoast"

        : tech.name
          .toLowerCase()
          .includes("nginx")

          ? "nginx"

        : tech.name
          .toLowerCase()
          .includes("jquery")

          ? "jquery"

        : tech.name
          .toLowerCase()
          .includes("php")

          ? "php"

        : tech.name
          .toLowerCase()
          .includes("mysql")

          ? "mysql"

        : tech.name;

      return (
        index ===
        self.findIndex(
          (t: any) => {

            const compareName =

              t.name
                .toLowerCase()
                .includes("wordpress")

                ? "wordpress"

              : t.name
                .toLowerCase()
                .includes("woocommerce")

                ? "woocommerce"

              : t.name
                .toLowerCase()
                .includes("yoast")

                ? "yoast"

              : t.name
                .toLowerCase()
                .includes("nginx")

                ? "nginx"

              : t.name
                .toLowerCase()
                .includes("jquery")

                ? "jquery"

              : t.name
                .toLowerCase()
                .includes("php")

                ? "php"

              : t.name
                .toLowerCase()
                .includes("mysql")

                ? "mysql"

              : t.name;

            return (
              compareName ===
              normalizedName
            );

          }
        )
      );

    }
  );

console.log(
  "FINAL TECHNOLOGIES:",
  uniqueTechnologies
);

    const statusCode =
  httpxData?.status_code || null;

const title =
  httpxData?.title || null;

const hostIp =
  httpxData?.host_ip || null;

  const geoInfo =
  getGeoIpInfo(hostIp);

  const asnInfo =
  await getAsnInfo(hostIp);

console.log(
  'ASN INFO:',
  asnInfo
);

console.log(
  "GEO INFO:",
  geoInfo
);

  const cdnName =
  httpxData?.cdn_name || null;

const cdnType =
  httpxData?.cdn_type || null;

console.log(
  "CDN NAME:",
  cdnName
);

console.log(
  "CDN TYPE:",
  cdnType
);

  console.log(
  "HOST IP:",
  hostIp
);

const webServer =
  httpxData?.webserver || null;

  let hostingType =
  "Unknown";

  let operatingSystem =
  "Unknown";

if (
  webServer?.toLowerCase()
    .includes("nginx")
) {
  operatingSystem =
    "Linux";
}

if (
  webServer?.toLowerCase()
    .includes("apache")
) {
  operatingSystem =
    "Linux";
}

console.log(
  "OPERATING SYSTEM:",
  operatingSystem
);

if (
  webServer?.toLowerCase()
    .includes("nginx")
) {
  hostingType =
    "Linux / Nginx";
}

if (
  webServer?.toLowerCase()
    .includes("apache")
) {
  hostingType =
    "Linux / Apache";
}

console.log(
  "HOSTING TYPE:",
  hostingType
);

  const cdn =
  httpxData?.cdn || null;

console.log(
  "CDN DETECTED:",
  cdn
);

const contentLength =
  httpxData?.content_length || null;

const responseTime =
  httpxData?.time || null;

const url =
  httpxData?.url || null;

      io.to(jobId).emit(
  "technologies",
  {
    target,
    technologies:
      uniqueTechnologies,
  }
);
      
      io.to(jobId).emit(
        'scan-progress',
        {
          progress: 70,
        }
      );

// ======================================
// DEEP SCAN DISABLED
// ======================================

const vulnerabilities: any[] = [
  ...headerFindings,
];

io.to(jobId).emit(
  "scan-log",
  {
    message:
      "[+] Deep Scan disabled",
  }
);

io.to(jobId).emit(
  "scan-progress",
  {
    progress: 90,
  }
);

    // ======================================
    // CALCULATE DURATION
    // ======================================

    const finishedAt =
      new Date();

    const scanDuration =
      Math.floor(
        (
          finishedAt.getTime() -
          startedAt.getTime()
        ) / 1000
      );

// ======================================
// CALCULATE RISK SCORE
// ======================================

console.log("OPEN PORTS:", openPorts);

console.log("TECHNOLOGIES:", technologies);

console.log("SSL DATA:", sslData);

console.log(
  "VULNERABILITIES:",
  vulnerabilities.length
);

console.log(
  '[DEBUG] BEFORE RISK SCORE'
);

const riskScore =
  calculateRiskScore(
    openPorts,
    technologies,
    sslData,
    vulnerabilities
  );

  console.log(
    '[DEBUG] AFTER RISK SCORE'
  );

console.log(
  "RISK SCORE:",
  riskScore
);

console.log('[DEBUG] AFTER RISK SCORE');

let emailSecurityScore = 0;

if (spf) {
  emailSecurityScore += 30;
}

if (dmarc) {
  emailSecurityScore += 40;
}

if (dkim) {
  emailSecurityScore += 30;
}

console.log(
  "EMAIL SECURITY SCORE:",
  emailSecurityScore
);

    // ======================================
    // BUILD RESULTS
    // ======================================

    const results = {

      target,

      ipv4,

      ipv6,

      mx,

      txt,

      ns,

      cname,

      spf,

      dmarc,

      dmarcPolicy,

      dkim,

      emailSecurityScore,

      hostingType,

      operatingSystem,

      openPorts,

      cdn,

      headers:
        headersData,

      ssl:
        sslData,

      technologies: uniqueTechnologies,

      statusCode,

      title,

        hostIp,

        cdnName,

        cdnType,

        webServer,

        contentLength,

        responseTime,

        url,

      vulnerabilities,

      riskScore,

      subdomains,

        country:
    geoInfo.country,

  region:
    geoInfo.region,

  city:
    geoInfo.city,

  timezone:
    geoInfo.timezone,

    isp:
  asnInfo.isp,

organization:
  asnInfo.organization,

asn:
  asnInfo.asn,

asnCountry:
  asnInfo.country,

    };

    // ======================================
    // MAP SERVICES
    // ======================================

    const openServices =
      openPorts.map((port) => {

        if (port === 80) {
          return "http";
        }

        if (port === 443) {
          return "https";
        }

        if (port === 22) {
          return "ssh";
        }

        if (port === 21) {
          return "ftp";
        }

        if (port === 3306) {
          return "mysql";
        }

        return `port-${port}`;
      });

    // ======================================
    // SAVE RESULTS
    // ======================================

    console.log('LOOKING FOR JOB:', jobId);

const totalJobs = await ScanJob.countDocuments();

console.log('TOTAL JOBS:', totalJobs);

const scanJob =
  await ScanJob.findOne({
    _id: jobId,
  });

if (!scanJob) {
  throw new Error('ScanJob not found');
}

    await ScanResult.create({

      userId: scanJob.userId,

      target,

      status: "completed",

      ports: openPorts,

      openServices,

      technologies: uniqueTechnologies,

      vulnerabilities,

      riskScore,

      scanDuration, 

      startedAt,

      finishedAt,

      subdomains,

    });

    // ======================================
    // UPDATE JOB
    // ======================================

    await ScanJob.findByIdAndUpdate(
      jobId,
      {
        status: "completed",

        progress: 100,

        results,

        completedAt:
          finishedAt,
      }
    );

    io.to(jobId).emit(
      "scan-log",
      {
        message:
          `[✓] Scan completed for ${target}`,
      }
    );
    
    io.to(jobId).emit(
      'scan-progress',
      {
        progress: 100,
      }
    );
    
    io.to(jobId).emit(
      'scan-stage',
      {
        stage: 'Completed',
      }
    );

    io.to(jobId).emit(
      "scan-completed",
      {
        target,
      }
    );

    console.log(
      `[SCAN COMPLETED] ${target}`
    );

  } catch (error) {

    console.error(error);

    io.to(jobId).emit(
      "scan-log",
      {
        message:
          `[!] Scan failed for ${target}`,
      }
    );

    await ScanJob.findByIdAndUpdate(
      jobId,
      {
        status: "failed",
      }
    );
  }
};