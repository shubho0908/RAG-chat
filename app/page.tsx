'use client';

import React, { useState } from 'react';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster, toast } from 'sonner';
import axios from 'axios';
import { FilePreview } from '@/app/lib/utils/fileUtils';
import { ALLOWED_TYPES, MAX_FILES_COUNT } from '@/constants/uploads';
import { FileUpload } from '@/app/components/file-upload/fileUpload';
import { ChatInput } from '@/app/components/chat/chatInput';

export default function Home() {
  const [message, setMessage] = useState('');
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

      toast.success(`${uploadedFiles.length} file(s) queued for processing`);
      console.log('Processing job created:', response.data);
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to start processing');
    }

    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    if (message.trim() || files.length > 0) {
      setIsUploading(true);

      if (files.length > 0) {
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

          toast.success(`${files.length} file(s) uploaded successfully`);

          await processFiles(response.data.files);

        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload files');
        }
      }

      setMessage('');
      setFiles([]);
      setIsUploading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <TooltipProvider>
        <div className="min-h-screen bg-[#1F2023] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl relative">
            <div
              className={`flex items-end p-4 bg-[#2A2D31] rounded-3xl border transition-colors ${isDragging ? 'border-blue-400 border-2' : 'border-[#3A3D41]'
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsDragging(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files.length > 0) {
                  handleFileDrop(e.dataTransfer.files);
                }
              }}
            >
              <FileUpload
                files={files}
                setFiles={setFiles}
                isUploading={isUploading}
              />

              <ChatInput
                message={message}
                setMessage={setMessage}
                onSubmit={handleSubmit}
                isUploading={isUploading}
                hasFiles={files.length > 0}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
