import { Queue } from 'bullmq';
import { getIORedisInstance } from '../redis';
import { FileProcessingJobData, QUEUE_NAMES, JOB_TYPES } from './types';

let queueInstance: Queue | null = null;

function getFileProcessingQueue(): Queue {
  if (!queueInstance) {
    const connection = getIORedisInstance();
    
    queueInstance = new Queue(QUEUE_NAMES.FILE_PROCESSING, {
      connection,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }
  return queueInstance;
}

export async function addFileProcessingJob(data: FileProcessingJobData): Promise<string> {
  const queue = getFileProcessingQueue();
  const job = await queue.add(JOB_TYPES.PROCESS_FILES, data, {
    jobId: data.batchId,
  });
  return job.id!;
}

async function getJob(jobId: string) {
  const queue = getFileProcessingQueue();
  return await queue.getJob(jobId);
}

export async function getJobStatus(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return null;

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: job.progress,
    returnValue: job.returnvalue,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    opts: job.opts,
  };
}

export async function closeQueue(): Promise<void> {
  if (queueInstance) {
    await queueInstance.close();
    queueInstance = null;
  }
}