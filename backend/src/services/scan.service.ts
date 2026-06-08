import net from "net";
import https from "https";
import tls from "tls";

import {
  exec,
  execSync,
} from "child_process";

import { promisify } from "util";

import ScanJob from "../models/ScanJob.model";
import ScanResult from "../models/ScanResult";
import { calculateRiskScore } from "./risk.service";
import { runNuclei } from "./nuclei.service";
import { runHttpx } from "./httpx.service";
import { runWhatWeb } from "./whatweb.service";
import { runDnsLookup } from "./dns.service";

import { io } from "../server";

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

console.log('[DEBUG] AFTER HTTPX');

const httpxData =
  await runHttpx(target);

   // ======================================
// WHATWEB
// ======================================

io.to(jobId).emit(
  'scan-stage',
  {
    stage: 'WhatWeb',
  }
);

io.to(jobId).emit(
  "scan-log",
  {
    message:
      "[+] Running WhatWeb fingerprinting...",
  }
);

console.log('[DEBUG] BEFORE WHATWEB');

console.log('[DEBUG] AFTER WHATWEB');

const {
  whatwebRaw,
  fingerprints,
} =
  await runWhatWeb(
    target
  );

    // ======================================
    // EXTRACT HTTPX
    // ======================================

    const technologies =
      httpxData?.tech || [];

    const statusCode =
      httpxData?.status_code || null;

    const title =
      httpxData?.title || null;

      io.to(jobId).emit(
        "technologies",
        {
          target,
          technologies,
        }
      );
      
      io.to(jobId).emit(
        'scan-progress',
        {
          progress: 70,
        }
      );

// ======================================
// NUCLEI SCAN
// ======================================

let vulnerabilities: any[] = [];

try {

  io.to(jobId).emit(
    'scan-stage',
    {
      stage: 'Nuclei',
    }
  );

  io.to(jobId).emit(
    "scan-log",
    {
      message:
        "[+] Running Nuclei vulnerability scan...",
    }
  );

  console.log('[DEBUG] BEFORE NUCLEI');

  vulnerabilities =
    await runNuclei(target);

    console.log('[DEBUG] AFTER NUCLEI');

  console.log(
    "NUCLEI FINDINGS:",
    vulnerabilities.length
  );

  console.log(
    '[DEBUG] BEFORE FINISHED_AT'
  );

  console.log(
    vulnerabilities.slice(0, 3)
  );

  console.log('[DEBUG] BEFORE FINISHED_AT');

  io.to(jobId).emit(
    "vulnerabilities",
    {
      target,
      vulnerabilities,
    }
  );
  
  io.to(jobId).emit(
    'scan-progress',
    {
      progress: 90,
    }
  );
} catch (error) {

  console.error(
    "NUCLEI ERROR:",
    error
  );
  vulnerabilities = [];
}

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

console.log(
  '[DEBUG] BEFORE RISK SCORE'
);

const riskScore =
  calculateRiskScore(
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

    // ======================================
    // BUILD RESULTS
    // ======================================

    const results = {

      target,

      ipv4,

      ipv6,

      openPorts,

      headers:
        headersData,

      ssl:
        sslData,

      technologies,

      fingerprints,

      whatwebRaw,

      statusCode,

      title,

      vulnerabilities,

      riskScore,
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

      technologies,

      fingerprints,

      vulnerabilities,

      riskScore,

      scanDuration, 

      startedAt,

      finishedAt,
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