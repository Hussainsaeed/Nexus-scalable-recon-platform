import { Queue } from 'bullmq';

export const scanQueue = new Queue(
  'scan-queue',
  {
    connection: {
      url: process.env.REDIS_URL,
    } as any,
  }
);