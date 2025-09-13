import { Worker, Job } from 'bullmq';
import { getIORedisInstance } from '../redis';
import { extractTextFromFile, chunkDocument } from '../services/documentProcessor';
import { createEmbeddingsAndStore } from '../services/vectorStore';
import { FileProcessingJobData, QUEUE_NAMES } from './types';

export function createFileProcessingWorker() {
  const connection = getIORedisInstance();

  return new Worker(
    QUEUE_NAMES.FILE_PROCESSING,
    async (job: Job<FileProcessingJobData>) => {
      const { files } = job.data;

      let successCount = 0;
      let errorCount = 0;
      const allChunks = [];

      for (const file of files) {
        try {
          const text = await extractTextFromFile(file.filepath, file.type);
          const chunks = await chunkDocument(text, file.filename, file.originalname, file.type);
          allChunks.push(...chunks);
          successCount++;
        } catch (error) {
          console.error(`Failed to process ${file.originalname}:`, error);
          errorCount++;
        }
      }

      if (allChunks.length > 0) {
        try {
          await createEmbeddingsAndStore(allChunks);
        } catch (error) {
          console.error(`Failed to store chunks:`, error);
          throw error;
        }
      }

      return {
        totalFiles: files.length,
        successCount,
        errorCount,
      };
    },
    {
      connection,
      concurrency: 1,
    }
  );
}

