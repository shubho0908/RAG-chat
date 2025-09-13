'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Root as TooltipRoot, Trigger as TooltipTrigger, Portal as TooltipPortal, Content as TooltipContent } from '@radix-ui/react-tooltip';
import { FileText } from 'lucide-react';
import { FilePreview as FilePreviewType } from '@/app/lib/utils/fileUtils';
import { FilePreview } from './filePreview';

interface FileUploadProps {
  files: FilePreviewType[];
  setFiles: React.Dispatch<React.SetStateAction<FilePreviewType[]>>;
  isUploading: boolean;
  onFileDrop: (fileList: FileList) => void;
}

export function FileUpload({ files, setFiles, isUploading, onFileDrop }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);


  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1">
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex gap-2 flex-wrap bg-[#1A1D21] rounded-2xl p-3 border border-[#3A3D41]/50">
              {files.map((filePreview, index) => (
                <FilePreview
                  key={index}
                  filePreview={filePreview}
                  index={index}
                  onRemove={removeFile}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center">
        <TooltipRoot>
          <TooltipTrigger asChild>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#3A3D41] rounded-xl transition-colors mr-3"
              disabled={isUploading}
            >
              <FileText size={20} />
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="bg-black text-white px-2 py-1 rounded text-sm" sideOffset={5}>
              Upload document (PDF, DOCX, Excel)
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          multiple
          onChange={(e) => e.target.files && onFileDrop(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
}