import express, {
  Request,
  Response,
} from "express";

import ScanJob from "../models/ScanJob.model";

import {
  runScanJob,
} from "../services/scan.service";

import PDFDocument from "pdfkit";

import { scanQueue } from '../queue/scan.queue';

import { authMiddleware } from '../auth/auth.middleware';

const router = express.Router();

// ======================================
// CREATE SCAN JOB
// ======================================

router.post(
  "/",
  authMiddleware,

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

      const scanJob =
  await ScanJob.create({
    target: url,

    userId:
      (req as any).user.userId,

    status: "queued",

    progress: 0,
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
      (req as any).user.userId,
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

  async (
    req: Request,
    res: Response
  ) => {
    try {

      await ScanJob.deleteMany({
        userId:
          (req as any).user.userId,
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
      (req as any).user.userId,
  });

  const completed =
  await ScanJob.countDocuments({
    userId:
      (req as any).user.userId,

    status: "completed",
  });

  const failed =
  await ScanJob.countDocuments({
    userId:
      (req as any).user.userId,

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
      (req as any).user.userId,
  });

      if (!job) {

        return res.status(404).json({
          success: false,
          error: "Job not found",
        });
      }

      const doc =
        new PDFDocument();

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=recon-report-${job._id}.pdf`
      );

      doc.pipe(res);

      doc
        .fontSize(22)
        .text("Nexus Recon Report");

      doc.moveDown();

      doc.text(
        `Target: ${job.target}`
      );

      doc.text(
        `Status: ${job.status}`
      );

      doc.text(
        `Generated: ${new Date().toLocaleString()}`
      );

      doc.moveDown();

      doc
        .fontSize(18)
        .text("Scan Summary");

      doc.moveDown();

      const results: any =
        job.results || {};

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
        .text("Technologies");

      doc.moveDown();

      (
        results.technologies || []
      ).forEach(
        (tech: string) => {
          doc.text(`• ${tech}`);
        }
      );

      doc.moveDown();

      doc
        .fontSize(18)
        .text("Vulnerabilities");

      doc.moveDown();

      (
        results.vulnerabilities || []
      ).forEach(
        (vuln: any) => {

          doc.text(
            `${vuln.name} (${vuln.severity})`
          );

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
      (req as any).user.userId,
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