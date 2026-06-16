import express, {
  Request,
  Response,
} from "express";

import ScanJob from "../models/ScanJob.model";
import AuditLog from "../models/AuditLog.model";
import path from 'path';

import {
  runScanJob,
} from "../services/scan.service";

import PDFDocument from "pdfkit";

import { scanQueue } from '../queue/scan.queue';

import { authMiddleware } from '../auth/auth.middleware';
import { allowRoles }
  from '../middleware/roleMiddleware';

  import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';

const router = express.Router();

// ======================================
// CREATE SCAN JOB
// ======================================

router.post(
  "/",
  authMiddleware,

  allowRoles(
    'owner',
    'admin',
    'analyst'
  ),

  async (
    req: Request,
    res: Response
  ) => {
    try {

      const { url } = req.body;

      // VALIDATION

      if (!url) {
        return res.status(400).json({
          success: false,
          error: "URL is required",
        });
      }

      console.log(
        `[JOB CREATED] ${url}`
      );

      // CREATE JOB

      console.log('REQ USER:', (req as any).user);
console.log('USER ID:', (req as any).user?.id);

      const scanJob =
  await ScanJob.create({
    target: url,

    userId: (req as any).user.id,

    status: "queued",

    progress: 0,
  });

  await AuditLog.create({
    userId: (req as any).user.id,
  
    action:
      'SCAN_CREATED',
  
    details:
      `Target: ${url}`,
  });

      console.log(
        "JOB ID:",
        scanJob._id.toString()
      );

      // RUN SCAN

      await scanQueue.add(
        'scan',
        {
          jobId:
            scanJob._id.toString(),
      
          target: url,
        }
      );

      // RESPONSE

      return res.status(201).json({
        success: true,
        message:
          "Scan job created successfully",
        jobId: scanJob._id,
        status:
          scanJob.status,
        target: url,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          "Failed to create scan job",
      });
    }
  }
);

// ======================================
// GET SCAN HISTORY
// ======================================

router.get(
  "/history",
  authMiddleware,

  async (
    req: Request,
    res: Response
  ) => {
    try {

      const jobs =
  await ScanJob.find({
    userId:
  (req as any).user.id,
  })
          .sort({
            createdAt: -1,
          })
          .limit(20);

      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        error:
          "Failed to fetch scan history",
      });
    }
  }
);

// ======================================
// CLEAR HISTORY
// ======================================

router.delete(
  "/history",

  authMiddleware,

  allowRoles(
    'owner',
    'admin'
  ),

  async (
    req: Request,
    res: Response
  ) => {
    try {

      await ScanJob.deleteMany({
        userId:
  (req as any).user.id,
      });

      return res.status(200).json({
        success: true,
        message:
          "History cleared successfully",
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        error:
          "Failed to clear history",
      });
    }
  }
);

// ======================================
// GET STATS
// ======================================

router.get(
  "/stats",
  authMiddleware,

  async (
    req: Request,
    res: Response
  ) => {
    try {

      const totalScans =
  await ScanJob.countDocuments({
    userId:
  (req as any).user.id,
  });

  const completed =
  await ScanJob.countDocuments({
    userId:
  (req as any).user.id,

    status: "completed",
  });

  const failed =
  await ScanJob.countDocuments({
    userId:
  (req as any).user.id,

    status: "failed",
  });

      return res.status(200).json({
        success: true,
        stats: {
          totalScans,
          completed,
          failed,
        },
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        error:
          "Failed to fetch statistics",
      });
    }
  }
);

// ======================================
// PDF REPORT
// ======================================

router.get(
  "/report/:id",
  authMiddleware,

  async (
    req: Request,
    res: Response
  ) => {

    try {

      const job =
  await ScanJob.findOne({
    _id: req.params.id,

    userId:
  (req as any).user.id,
  });

      if (!job) {

        return res.status(404).json({
          success: false,
          error: "Job not found",
        });
      }

      const results: any =
        job.results || {};

  const highCount =
  (results.vulnerabilities || []).filter(
    (v: any) => v.severity === 'high'
  ).length;

const mediumCount =
  (results.vulnerabilities || []).filter(
    (v: any) => v.severity === 'medium'
  ).length;

const lowCount =
  (results.vulnerabilities || []).filter(
    (v: any) => v.severity === 'low'
  ).length;

  const riskScore =
  results.riskScore || 0;

const chartCanvas =
  new ChartJSNodeCanvas({
    width: 500,
    height: 300,
  });

  const riskCanvas =
  new ChartJSNodeCanvas({
    width: 400,
    height: 250,
  });

  const chartBuffer =
  await chartCanvas.renderToBuffer({

    type: 'pie',

    data: {
      labels: [
        'High',
        'Medium',
        'Low',
      ],

      datasets: [
        {
          data: [
            highCount,
            mediumCount,
            lowCount,
          ],

          backgroundColor: [
            '#DC2626',
            '#F59E0B',
            '#22C55E',
          ],
        },
      ],
    },
  });

  const gaugeBuffer =
  await riskCanvas.renderToBuffer({
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [
            riskScore,
            100 - riskScore,
          ],
          backgroundColor: [
            riskScore >= 70
              ? '#DC2626'
              : riskScore >= 40
              ? '#F59E0B'
              : '#22C55E',
            '#E5E7EB',
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

      const doc = new PDFDocument({
  size: 'A4',
  margin: 50,
});

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=recon-report-${job._id}.pdf`
      );

      doc.pipe(res);

     // ======================================
     // COVER PAGE
     // ======================================
      
    doc.save();

doc.rect(
  0,
  0,
  doc.page.width,
  doc.page.height
)
.fill('#0A0F14');

doc.restore();

const logoPath = path.join(
  process.cwd(),
  'assets',
  'nexus-logo.png'
);

doc.image(
  logoPath,
  210,
  20,
  {
    width: 170,
  }
);

doc.moveDown(7);

doc.fontSize(34)
    .fillColor('#10B981')
    .text(
      'NEXUS RECON',
      {
        align: 'center',
      }
    );

doc.moveDown();

doc.fontSize(18)
    .fillColor('white')
    .text(
      'Scalable Recon Platform',
      {
        align: 'center',
      }
    );

doc.moveDown(3);

doc.fontSize(20)
    .text(
      `Target: ${job.target}`,
      {
        align: 'center',
      }
    );

doc.moveDown();

doc.fontSize(16)
    .text(
      `Generated: ${new Date().toLocaleString()}`,
      {
        align: 'center',
      }
    );

    doc.moveDown(2);



doc.fontSize(16)
  .text(
    'CONTACT INFORMATION',
    {
      align: 'center',
    }
  );



doc.moveDown(0.5);

doc.fontSize(12)
  .fillColor('white')
  .text(
    'For inquiries regarding this report:',
    {
      align: 'center',
    }
  );

doc.moveDown();

doc.fontSize(13)
  .text(
    'Hussain Mohammad Saeed',
    {
      align: 'center',
    }
  );

doc.fontSize(11)
  .fillColor('#D1D5DB')
  .text(
    'engineerhussainmohammadsaeed@gmail.com',
    {
      align: 'center',
    }
  );

doc.moveDown();

doc.fontSize(13)
  .fillColor('white')
  .text(
    'Mohamad Saeed Alkawas',
    {
      align: 'center',
    }
  );

doc.fontSize(11)
  .fillColor('#D1D5DB')
  .text(
    'saeedkawas3@gmail.com',
    {
      align: 'center',
    }
  );

doc.moveDown();

doc.fontSize(12)
  .fillColor('#10B981')
  .text(
    'NEXUS Recon Team',
    {
      align: 'center',
    }
  );

doc.moveDown(2);

doc.moveDown(2);

doc.fontSize(22)
    .text(
      `Risk Score: ${results.riskScore || 0}/100`,
      {
        align: 'center',
      }
    );

doc.moveDown();

doc.fontSize(20)
    .fillColor(
      (results.riskScore || 0) >= 70
        ? '#EF4444'
        : (results.riskScore || 0) >= 40
        ? '#F59E0B'
        : '#22C55E'
    )
    .text(
      (results.riskScore || 0) >= 70
        ? 'HIGH RISK'
        : (results.riskScore || 0) >= 40
        ? 'MEDIUM RISK'
        : 'LOW RISK',
      {
        align: 'center',
      }
    );
    doc.fillColor('white');

doc.addPage();

doc.fontSize(24)
    .fillColor('#10B981')
    .text('Executive Summary');

doc.moveDown(2);

doc.fontSize(14)
    .fillColor('black')
    .text(`Target: ${job.target}`);

doc.moveDown();

doc.text(
  `Overall Risk Score: ${results.riskScore || 0}/100`
);

doc.moveDown(0.5);

doc.image(
  gaugeBuffer,
  {
    fit: [220, 140],
    align: 'center',
  }
);

doc.moveDown();

doc.moveDown();

doc.text(
  `Risk Level: ${
    (results.riskScore || 0) >= 70
      ? 'HIGH'
      : (results.riskScore || 0) >= 40
      ? 'MEDIUM'
      : 'LOW'
  }`
);

doc.moveDown();

doc.text(
  `Open Ports Found: ${
    results.openPorts?.length || 0
  }`
);

if (results.openPorts?.length) {

  doc.text(
    `(${results.openPorts.join(', ')})`
  );

}

doc.moveDown(0.5);

doc.text(
  `Subdomains Found: ${
    results.subdomains?.length || 0
  }`
);

if (results.subdomains?.length) {

  results.subdomains
    .slice(0, 3)
    .forEach((sub: string) => {

      doc.text(`• ${sub}`);

    });

}

doc.moveDown(0.5);

doc.text(
  `Vulnerabilities Found: ${
    results.vulnerabilities?.length || 0
  }`
);

doc.moveDown();

doc.fontSize(16)
    .fillColor('#DC2626')
    .text('Key Findings');

doc.moveDown(0.5);

(results.vulnerabilities || [])
  .slice(0, 5)
  .forEach((vuln: any) => {

    const title =
      vuln.title ||
      vuln.name ||
      'Unknown Finding';

    doc.fontSize(12)
        .fillColor('black')
        .text(`• ${title}`);

  });

  (results.vulnerabilities || [])
    .filter(
      (v: any) =>
        v.severity === 'high'
    ).length;

  (results.vulnerabilities || [])
    .filter(
      (v: any) =>
        v.severity === 'medium'
    ).length;

  (results.vulnerabilities || [])
    .filter(
      (v: any) =>
        v.severity === 'low'
    ).length;

doc.moveDown();

doc.fontSize(16)
    .fillColor('#2563EB')
    .text('Risk Distribution');

doc.moveDown(0.5);

doc.fillColor('#DC2626')
    .text(`High Findings: ${highCount}`);

doc.fillColor('#F59E0B')
    .text(`Medium Findings: ${mediumCount}`);

doc.fillColor('#22C55E')
    .text(`Low Findings: ${lowCount}`);

doc.fillColor('black');

const chartPath = path.join(
  process.cwd(),
  'risk-distribution.png'
);

fs.writeFileSync(
  chartPath,
  chartBuffer
);

doc.moveDown();

doc.image(
  chartPath,
  {
    fit: [220, 160],
    align: 'center',
  }
);

doc.moveDown(2);

doc.text(
  'This report summarizes the reconnaissance and security findings discovered during the automated assessment.'
);

doc.addPage();

doc.moveDown();

doc
  .fontSize(18)
  .text("Scan Summary");

      doc.moveDown();

      doc.text(
        `Risk Score: ${
          results.riskScore || 0
        }`
      );

      doc.text(
        `Open Ports: ${
          results.openPorts?.join(", ") ||
          "None"
        }`
      );

      doc.moveDown();

      doc
  .fontSize(18)
  .text("HTTPX Information");

doc.moveDown();

doc.text(
  `URL: ${results.url || 'Unknown'}`
);

doc.text(
  `Host IP: ${results.hostIp || 'Unknown'}`
);

doc.text(
  `CDN Name: ${results.cdnName || 'Unknown'}`
);

doc.text(
  `CDN Type: ${results.cdnType || 'Unknown'}`
);

doc.text(
  `Web Server: ${results.webServer || 'Unknown'}`
);

doc.text(
  `Status Code: ${results.statusCode || 'Unknown'}`
);

doc.text(
  `Response Time: ${results.responseTime || 'Unknown'}`
);

doc.text(
  `Content Length: ${results.contentLength || 'Unknown'}`
);

doc.text(
  `Hosting Type: ${results.hostingType || 'Unknown'}`
);

doc.text(
  `Operating System: ${results.operatingSystem || 'Unknown'}`
);

doc.moveDown();

doc.moveDown();

doc
  .fontSize(18)
  .text("Subdomains");

doc.moveDown();

(
  results.subdomains || []
).forEach(
  (sub: string) => {

    doc.text(
      `• ${sub}`
    );

  }
);

doc.moveDown();

doc.addPage();

doc
  .fontSize(18)
  .text("DNS Recon");

doc.moveDown();

doc.text("A Records");

(results.ipv4 || []).forEach(
  (record: string) => {
    doc.text(`• ${record}`);
  }
);

doc.moveDown();

doc.text("AAAA Records");

(results.ipv6 || []).forEach(
  (record: string) => {
    doc.text(`• ${record}`);
  }
);

doc.moveDown();

doc.text("MX Records");

(results.mx || []).forEach(
  (record: any) => {
    doc.text(
      `• ${record.exchange} (Priority: ${record.priority})`
    );
  }
);

doc.moveDown();

doc.text("NS Records");

(results.ns || []).forEach(
  (record: string) => {
    doc.text(`• ${record}`);
  }
);

doc.addPage();

doc.text("TXT Records");

(results.txt || []).forEach(
  (record: any) => {

    doc.text(
      `• ${
        Array.isArray(record)
          ? record.join(' ')
          : String(record)
      }`
    );

  }
);

doc.moveDown();

doc.text("CNAME Records");

(results.cname || []).forEach(
  (record: string) => {
    doc.text(`• ${record}`);
  }
);

doc.moveDown();

doc
  .fontSize(18)
  .text("Email Security");

doc.moveDown();

doc.text(
  `SPF: ${
    results.spf
      ? "Enabled"
      : "Missing"
  }`
);

doc.text(
  `DMARC: ${
    results.dmarc
      ? "Enabled"
      : "Missing"
  }`
);

doc.text(
  `DKIM: ${
    results.dkim
      ? "Enabled"
      : "Missing"
  }`
);

if (results.dmarcPolicy) {

  doc.text(
    `DMARC Policy: ${results.dmarcPolicy}`
  );

}

doc.moveDown();

doc.text(
  `Email Security Score: ${
    results.emailSecurityScore || 0
  }/100`
);

doc.moveDown();

doc.moveDown();

doc.fontSize(18)
    .text('GeoIP Intelligence');

doc.moveDown(0.5);

doc.fontSize(12)
    .text(`Country: ${results.country || 'Unknown'}`);

doc.text(
  `Region: ${results.region || 'Unknown'}`
);

doc.text(
  `City: ${results.city || 'Unknown'}`
);

doc.text(
  `Timezone: ${results.timezone || 'Unknown'}`
);

doc.moveDown();

doc
  .fontSize(18)
  .text("ASN Intelligence");

doc.moveDown();

doc.text(
  `ISP: ${
    results.isp || "Unknown"
  }`
);

doc.text(
  `Organization: ${
    results.organization || "Unknown"
  }`
);

doc.text(
  `ASN: ${
    results.asn || "Unknown"
  }`
);

doc.text(
  `Country: ${
    results.asnCountry || "Unknown"
  }`
);

doc.moveDown();

doc.moveDown();

doc.addPage();

      doc
        .fontSize(18)
        .text("Technologies");

      doc.moveDown();

      (
  results.technologies || []
).forEach(
  (tech: any) => {

    doc.text(
      `• ${tech.name}`
    );

    doc.text(
      `   Category: ${tech.category}`
    );

    doc.text(
      `   Confidence: ${tech.confidence}`
    );

    doc.moveDown(0.5);
  }
);

      doc.moveDown();

      doc.addPage();

      doc
        .fontSize(18)
        .text("Vulnerabilities");

      doc.moveDown();

      (
        results.vulnerabilities || []
      ).forEach(
        (vuln: any) => {

          const vulnTitle =
  vuln.title ||
  vuln.name ||
  "Unknown Finding";

  let impact = 'Security weakness detected.';
let recommendation = 'Review and remediate.';

if (vulnTitle.includes('Content Security Policy')) {
  impact =
    'May allow Cross-Site Scripting (XSS) attacks.';
  recommendation =
    'Implement a strict Content-Security-Policy header.';
}

let cvss = 3.1;

if (vulnTitle.includes('Content Security Policy')) {
  cvss = 5.3;
}

if (vulnTitle.includes('HSTS')) {
  cvss = 3.1;
}

if (vulnTitle.includes('X-Frame-Options')) {
  cvss = 5.0;
}

if (vulnTitle.includes('X-Content-Type-Options')) {
  cvss = 3.7;
}

if (vulnTitle.includes('Referrer-Policy')) {
  cvss = 2.6;
}

if (vulnTitle.includes('Permissions-Policy')) {
  cvss = 2.6;
}

if (vulnTitle.includes('Cross-Origin-Opener-Policy')) {
  cvss = 3.7;
}

if (vulnTitle.includes('Cross-Origin-Resource-Policy')) {
  cvss = 3.7;
}

if (vulnTitle.includes('Cross-Origin-Embedder-Policy')) {
  cvss = 3.7;
}

if (vulnTitle.includes('HSTS')) {
  impact =
    'Connections may be downgraded to HTTP.';
  recommendation =
    'Enable Strict-Transport-Security header.';
}

if (vulnTitle.includes('X-Frame-Options')) {
  impact =
    'Application may be vulnerable to clickjacking.';
  recommendation =
    'Set X-Frame-Options to DENY or SAMEORIGIN.';
}

if (vulnTitle.includes('X-Content-Type-Options')) {
  impact =
    'Browsers may incorrectly interpret content types.';
  recommendation =
    'Set X-Content-Type-Options header to nosniff.';
}

if (vulnTitle.includes('Referrer-Policy')) {
  impact =
    'Sensitive URL information may be leaked.';
  recommendation =
    'Configure a strict Referrer-Policy header.';
}

if (vulnTitle.includes('Permissions-Policy')) {
  impact =
    'Browser features may be unnecessarily exposed.';
  recommendation =
    'Define a restrictive Permissions-Policy header.';
}

if (vulnTitle.includes('Cross-Origin-Opener-Policy')) {
  impact =
    'Cross-origin isolation protections are missing.';
  recommendation =
    'Enable Cross-Origin-Opener-Policy header.';
}

if (vulnTitle.includes('Cross-Origin-Resource-Policy')) {
  impact =
    'Resources may be shared across origins unexpectedly.';
  recommendation =
    'Configure Cross-Origin-Resource-Policy header.';
}

if (vulnTitle.includes('Cross-Origin-Embedder-Policy')) {
  impact =
    'Cross-origin embedded resources are not restricted.';
  recommendation =
    'Enable Cross-Origin-Embedder-Policy header.';
}

const severity =
  (vuln.severity || '')
    .toLowerCase();

if (severity === 'high') {

  doc.fillColor('#DC2626');

} else if (
  severity === 'medium'
) {

  doc.fillColor('#F59E0B');

} else {

  doc.fillColor('#22C55E');

}

doc.fontSize(10);

doc.fillColor(
  severity === 'high'
    ? '#DC2626'
    : severity === 'medium'
    ? '#F59E0B'
    : '#22C55E'
);

doc.text(
  ` ${severity.toUpperCase()} `,
  {
    continued: true,
  }
);

doc.fillColor('black')
    .fontSize(12)
    .text(
      ` ${vulnTitle}`
    );
    doc.fontSize(10)
    .fillColor('#6B7280')
    .text(`Impact: ${impact}`);

doc.text(
    `Recommendation: ${recommendation}`
);

if (cvss >= 7) {
  doc.fillColor('#DC2626');
} else if (cvss >= 4) {
  doc.fillColor('#F59E0B');
} else {
  doc.fillColor('#22C55E');
}

doc.text(
  `CVSS Score: ${cvss}`
);

doc.fillColor('#6B7280');

doc.moveDown(0.5);
        }
      );

      // ==========================
// NEXUS RECON SIGNATURE
// ==========================

doc.moveDown(3);

doc.moveDown();

doc.fontSize(14)
    .fillColor('#10B981')
    .text(
      'NEXUS RECON',
      {
        align: 'center',
      }
    );

doc.fontSize(10)
    .fillColor('#6B7280')
    .text(
      'Scalable Recon Platform',
      {
        align: 'center',
      }
    );

doc.moveDown(0.5);

doc.fontSize(8)
    .fillColor('#9CA3AF')
    .text(
      new Date().toLocaleString(),
      {
        align: 'center',
      }
    );

doc.end();

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          "Failed to generate report",
      });
    }
  }
);

router.get(
  "/audit-logs",
  authMiddleware,

  async (
    req: Request,
    res: Response
  ) => {
    try {

      const logs =
        await AuditLog.find({
          userId:
  (req as any).user.id,
        })
          .sort({
            createdAt: -1,
          })
          .limit(50);

      return res.status(200).json({
        success: true,
        count: logs.length,
        logs,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        error:
          "Failed to fetch audit logs",
      });

    }
  }
);

// ======================================
// GET SINGLE JOB
// ======================================

router.get(
  "/:id",
  authMiddleware,

  async (
    req: Request,
    res: Response
  ) => {
    try {

      const job =
  await ScanJob.findOne({
    _id: req.params.id,

    userId:
  (req as any).user.id,
  });

      if (!job) {
        return res.status(404).json({
          success: false,
          error:
            "Job not found",
        });
      }

      return res.status(200).json({
        success: true,
        job,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        error:
          "Failed to fetch job",
      });
    }
  }
);

export default router;