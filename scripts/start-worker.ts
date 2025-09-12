import dotenv from 'dotenv';
import { createFileProcessingWorker } from '../app/lib/queue/worker';

dotenv.config();

console.log('Starting file processing worker...');

const worker = createFileProcessingWorker();

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
});

console.log('File processing worker started successfully');