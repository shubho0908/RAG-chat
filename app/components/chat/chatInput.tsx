'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Root as TooltipRoot, Trigger as TooltipTrigger, Portal as TooltipPortal, Content as TooltipContent } from '@radix-ui/react-tooltip';
import { Send, RotateCw } from 'lucide-react';

interface ChatInputProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  isUploading: boolean;
  hasFiles: boolean;
  hasProcessedDocs?: boolean;
  isProcessing: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ message, setMessage, onSubmit, isUploading, hasFiles, hasProcessedDocs = false, isProcessing, placeholder = "Ask me anything about your documents...", disabled = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const canSubmitDocs = hasFiles && !hasProcessedDocs;
  const canSubmitChat = hasProcessedDocs;

  const isSubmitDisabled = disabled || isUploading || isProcessing || (!canSubmitDocs && !canSubmitChat) || !message.trim();
  const canSubmit = !disabled && !isProcessing && (canSubmitDocs || canSubmitChat) && message.trim();

  return (
    <div className="flex items-end flex-1">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none max-h-32"
          rows={1}
          style={{ height: 'auto' }}
          disabled={disabled}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      </div>

      <TooltipRoot>
        <TooltipTrigger asChild>
          <button
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className={`ml-3 p-2.5 rounded-xl transition-all ${
              canSubmit
                ? 'text-blue-400 bg-blue-400/10 hover:opacity-80'
                : 'text-gray-500 bg-[#3A3D41]/50 cursor-not-allowed'
            }`}
          >
            {isUploading || isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RotateCw size={18} />
              </motion.div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="bg-black text-white px-2 py-1 rounded text-sm" sideOffset={5}>
            {isUploading ? 'Uploading...' : isProcessing ? 'Processing files...' : 'Send message'}
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </div>
  );
}