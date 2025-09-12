import { Worker, Job } from 'bullmq';
import { Redis } from '@upstash/redis';
import { getIORedisInstance } from '../redis';
import { extractTextFromFile, chunkDocument } from '../services/documentProcessor';
import { FileProcessingJobData, FileProcessingResult, QUEUE_NAMES, BatchStatus } from './types';

export function createFileProcessingWorker() {
  const connection = getIORedisInstance();

  return new Worker(
    QUEUE_NAMES.FILE_PROCESSING,
    async (job: Job<FileProcessingJobData>) => {
      const { batchId, files } = job.data;
      
      await updateBatchStatus(batchId, {
        status: 'processing',
        progress: 0,
        processedFiles: 0,
      });

      console.log(`Processing ${files.length} files for chunking`);

      const processedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = Math.round(((i + 1) / files.length) * 100);
        
        console.log(`Processing ${i + 1}/${files.length}: ${file.originalname}`);
        
        try {
          const text = await extractTextFromFile(file.filepath, file.type);
          console.log(`Extracted ${text.length} characters`);
          
          const chunks = await chunkDocument(text, file.filename, file.originalname, file.type);
          console.log(`Created ${chunks.length} chunks`);
          
          processedFiles.push({
            id: file.id,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            type: file.type,
            status: 'success' as const,
            filepath: file.filepath,
            chunks: chunks.length,
          });
          
        } catch (error) {
          console.error(`Failed to process ${file.originalname}:`, error);
          processedFiles.push({
            id: file.id,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            type: file.type,
            status: 'error' as const,
            filepath: file.filepath,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        await job.updateProgress(progress);
        await updateBatchStatus(batchId, {
          progress,
          processedFiles: i + 1,
        });

        if (i < files.length - 1) {
          console.log('Waiting 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      const successCount = processedFiles.filter(f => f.status === 'success').length;
      const errorCount = processedFiles.filter(f => f.status === 'error').length;

      const result: FileProcessingResult = {
        batchId,
        processedFiles,
        totalFiles: files.length,
        successCount,
        errorCount,
      };

      await updateBatchStatus(batchId, {
        status: 'completed',
        progress: 100,
        processedFiles: files.length,
        results: result,
      });

      console.log(`✅ Processed ${successCount}/${files.length} files successfully`);

      return result;
    },
    {
      connection,
      concurrency: 1,
    }
  );
}

function createUpstashRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function updateBatchStatus(batchId: string, updates: Partial<BatchStatus>) {
  const upstashRedis = createUpstashRedis();
  const key = `batch:${batchId}`;
  const existing = await upstashRedis.get<BatchStatus>(key);
  
  const updated: BatchStatus = {
    batchId,
    status: 'pending',
    progress: 0,
    totalFiles: 0,
    processedFiles: 0,
    createdAt: new Date(),
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  await upstashRedis.set(key, updated, { ex: 3600 });
  return updated;
}

export async function getBatchStatus(batchId: string): Promise<BatchStatus | null> {
  const upstashRedis = createUpstashRedis();
  const key = `batch:${batchId}`;
  return await upstashRedis.get<BatchStatus>(key);
}