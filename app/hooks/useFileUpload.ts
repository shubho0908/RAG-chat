import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { FilePreview } from '@/app/lib/utils/fileUtils';
import { ALLOWED_TYPES, MAX_FILES_COUNT } from '@/constants/uploads';

export function useFileUpload() {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileDrop = (fileList: FileList) => {
    const currentFileCount = files.length;
    const newFiles: FilePreview[] = [];

    Array.from(fileList).forEach(file => {
      if (currentFileCount + newFiles.length >= MAX_FILES_COUNT) {
        toast.error(`Maximum ${MAX_FILES_COUNT} files allowed`);
        return;
      }

      if (ALLOWED_TYPES.includes(file.type)) {
        newFiles.push({
          file,
          name: file.name,
          type: file.type,
          size: file.size
        });
      } else {
        toast.error('Invalid file type. Only PDF, DOCX, and Excel files are allowed.');
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const processFiles = async (uploadedFiles: {
    id: string;
    filename: string;
    originalname: string;
    size: number;
    type: string;
    filepath: string;
  }[]) => {
    setIsProcessing(true);

    try {
      const response = await axios.post('/api/process', {
        files: uploadedFiles
      });

      console.log('Processing job created:', response.data);
      const { jobId } = response.data;

      const pollInterval = 2000; // 2 seconds
      const maxAttempts = 30; // 1 minute total

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        try {
          const statusResponse = await axios.get(`/api/batch/${jobId}`);
          const { batch, job } = statusResponse.data;

          if (batch.status === 'completed') {
            console.log('Processing completed:', job.returnValue);
            return { success: true, jobId };
          }

          if (job.failedReason) {
            throw new Error(job.failedReason);
          }
        } catch {
          if (attempt === maxAttempts - 1) {
            throw new Error('Timeout waiting for processing to complete');
          }
        }
      }

      throw new Error('Timeout waiting for processing to complete');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process files');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSubmit = async (): Promise<{ success: boolean }> => {
    if (files.length === 0) return { success: false };

    setIsUploading(true);

    const formData = new FormData();
    files.forEach(filePreview => {
      formData.append('file', filePreview.file);
    });

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const processResult = await processFiles(response.data.files);
      if (processResult.success) {
        setFiles([]);
        return { success: true };
      }
      return { success: false };

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    files,
    setFiles,
    isDragging,
    setIsDragging,
    isUploading,
    isProcessing,
    handleFileDrop,
    handleFileSubmit
  };
}