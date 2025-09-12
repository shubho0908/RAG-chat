'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { FilePreview as FilePreviewType, formatFileSize, getFileIcon } from '@/app/lib/utils/fileUtils';

interface FilePreviewProps {
  filePreview: FilePreviewType;
  index: number;
  onRemove: (index: number) => void;
}

export function FilePreview({ filePreview, index, onRemove }: FilePreviewProps) {
  const IconComponent = getFileIcon(filePreview.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group bg-[#3A3D41] rounded-xl p-3 max-w-sm"
    >
      <div className="flex items-center gap-2">
        <IconComponent size={24} className="text-gray-300" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 truncate">{filePreview.name}</p>
          <p className="text-xs text-gray-400">{formatFileSize(filePreview.size)}</p>
        </div>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}