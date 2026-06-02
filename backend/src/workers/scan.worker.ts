import { Worker } from 'bullmq';

import { runScanJob } from '../services/scan.service';

const worker = new Worker(
  'scan-queue',

  async (job) => {

    const {
      jobId,
      target,
    } = job.data;

    console.log(
      `[WORKER] Processing ${target}`
    );

    await runScanJob(
      jobId,
      target
    );
  },

  {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }
);

worker.on(
  'completed',
  (job) => {
    console.log(
      `[WORKER] Completed ${job.id}`
    );
  }
);

worker.on(
  'failed',
  (job, err) => {
    console.error(
      `[WORKER] Failed ${job?.id}`,
      err
    );
  }
);