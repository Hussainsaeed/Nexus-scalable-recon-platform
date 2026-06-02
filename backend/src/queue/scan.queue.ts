import { Queue } from 'bullmq';

export const scanQueue = new Queue('scan-queue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});