export interface FileProcessingJobData {
  batchId: string;
  files: {
    id: string;
    filename: string;
    originalname: string;
    size: number;
    type: string;
    filepath: string;
  }[];
  userId?: string;
  metadata?: Record<string, unknown>;
}


export const QUEUE_NAMES = {
  FILE_PROCESSING: 'file-processing',
} as const;
