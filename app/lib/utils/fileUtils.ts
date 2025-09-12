import { FileIcon, FileTextIcon, Sheet } from 'lucide-react';

export interface FilePreview {
  file: File;
  name: string;
  type: string;
  size: number;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string) => {
  if (type === 'application/pdf') return FileIcon;
  if (type.includes('word')) return FileTextIcon;
  if (type.includes('sheet') || type.includes('excel')) return Sheet;
  return FileIcon;
};