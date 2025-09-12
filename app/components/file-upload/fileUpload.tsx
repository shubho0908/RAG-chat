'use client';

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Root as TooltipRoot, Trigger as TooltipTrigger, Portal as TooltipPortal, Content as TooltipContent } from '@radix-ui/react-tooltip';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { ALLOWED_TYPES, MAX_FILES_COUNT } from '@/constants/uploads';
import { FilePreview as FilePreviewType } from '@/app/lib/utils/fileUtils';
import { FilePreview } from './filePreview';

interface FileUploadProps {
  files: FilePreviewType[];
  setFiles: React.Dispatch<React.SetStateAction<FilePreviewType[]>>;
  isUploading: boolean;
}

export function FileUpload({ files, setFiles, isUploading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((fileList: FileList) => {
    const currentFileCount = files.length;
    const newFiles: FilePreviewType[] = [];
    
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
  }, [files.length, setFiles]);


  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute bottom-full left-0 right-0 p-4 pb-0"
          >
            <div className="flex gap-2 flex-wrap bg-[#2A2D31] rounded-t-3xl border border-b-0 border-[#3A3D41] p-4">
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

      {/* File Upload Button */}
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        multiple
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </>
  );
}