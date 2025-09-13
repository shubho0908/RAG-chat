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

      console.log(`Processing ${files.length} files for chunking`);

      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        console.log(`Processing: ${file.originalname}`);

        try {
          const text = await extractTextFromFile(file.filepath, file.type);
          console.log(`Extracted ${text.length} characters from ${file.originalname}`);

          const chunks = await chunkDocument(text, file.filename, file.originalname, file.type);
          console.log(`Created ${chunks.length} chunks for ${file.originalname}`);

          await createEmbeddingsAndStore(chunks);
          console.log(`✅ Processed ${file.originalname} - stored ${chunks.length} chunks`);

          successCount++;
        } catch (error) {
          console.error(`❌ Failed to process ${file.originalname}:`, error);
          errorCount++;
        }
      }

      console.log(`Processing complete: ${successCount} successful, ${errorCount} failed`);

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

