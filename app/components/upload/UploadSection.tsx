'use client';

import React from 'react';
import { FilePreview } from '@/app/lib/utils/fileUtils';
import { FileUpload } from '@/app/components/file-upload/fileUpload';
import { ChatInput } from '@/app/components/chat/chatInput';

interface UploadSectionProps {
  files: FilePreview[];
  setFiles: React.Dispatch<React.SetStateAction<FilePreview[]>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isUploading: boolean;
  isProcessing: boolean;
  onFileDrop: (fileList: FileList) => void;
  onSubmit: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isQuerying: boolean;
  hasProcessedDocs: boolean;
}

export function UploadSection({
  files,
  setFiles,
  isDragging,
  setIsDragging,
  isUploading,
  isProcessing,
  onFileDrop,
  onSubmit,
  message,
  setMessage,
  isQuerying,
  hasProcessedDocs
}: UploadSectionProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div
          className={`relative flex flex-col p-4 bg-[#2A2D31] rounded-3xl border transition-colors ${
            isDragging ? 'border-blue-400 border-2' : 'border-[#3A3D41]'
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
              onFileDrop(e.dataTransfer.files);
            }
          }}
        >
          <FileUpload
            files={files}
            setFiles={setFiles}
            isUploading={isUploading}
            onFileDrop={onFileDrop}
          />

          <div className="flex items-end">
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSubmit={onSubmit}
              isUploading={isUploading || isQuerying}
              hasFiles={files.length > 0}
              hasProcessedDocs={hasProcessedDocs}
              isProcessing={isProcessing}
              placeholder={hasProcessedDocs ? "Ask me anything about your documents..." : "Upload documents and enter your question..."}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}