import { Request, Response } from "express";

import ScanResult from "../models/ScanResult";

import { ReconService } from "../services/recon.service";

const reconService = new ReconService();

export const startScan = async (
  req: Request,
  res: Response
) => {

  try {

    const { target } = req.body;

    const result = await reconService.run(target);

    const scan = await ScanResult.create({
      target,

      status: "completed",

      ...result,

      startedAt: new Date(),

      finishedAt: new Date(),
    });

    res.status(200).json(scan);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Scan failed",
    });
  }
};