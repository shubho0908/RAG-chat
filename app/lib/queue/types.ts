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

export interface FileProcessingResult {
  batchId: string;
  processedFiles: {
    id: string;
    filename: string;
    originalname: string;
    size: number;
    type: string;
    status: 'success' | 'error';
    filepath?: string;
    error?: string;
  }[];
  totalFiles: number;
  successCount: number;
  errorCount: number;
}

export interface BatchStatus {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalFiles: number;
  processedFiles: number;
  results?: FileProcessingResult;
  createdAt: Date;
  updatedAt: Date;
}

export const QUEUE_NAMES = {
  FILE_PROCESSING: 'file-processing',
} as const;

export const JOB_TYPES = {
  PROCESS_FILES: 'process-files',
} as const;
