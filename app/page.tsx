'use client';

import React, { useState } from 'react';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster } from 'sonner';
import { Header } from '@/app/components/ui/Header';
import { UploadSection } from '@/app/components/upload/UploadSection';
import { ChatHistory } from '@/app/components/chat/ChatHistory';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useChat } from '@/app/hooks/useChat';

export default function Home() {
  const [hasProcessedDocs, setHasProcessedDocs] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState<string[]>([]);

  const {
    files,
    setFiles,
    isDragging,
    setIsDragging,
    isUploading,
    isProcessing,
    handleFileDrop,
    handleFileSubmit
  } = useFileUpload();

  const {
    message,
    setMessage,
    chatHistory,
    isQuerying,
    handleChatSubmit
  } = useChat();

  const onSubmit = async () => {
    if (!hasProcessedDocs) {
      const userMessage = message.trim();
      const result = await handleFileSubmit();
      if (result.success) {
        setHasProcessedDocs(true);
        const newProcessedDocs = files.map(f => f.name);
        setProcessedDocuments(newProcessedDocs);
        if (userMessage) {
          handleChatSubmit(true, undefined, newProcessedDocs);
        }
      }
    } else {
      handleChatSubmit(hasProcessedDocs, undefined, processedDocuments);
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <TooltipProvider>
        <div className="min-h-screen bg-[#1F2023] p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <Header hasProcessedDocs={hasProcessedDocs} />

            <div className="flex flex-col space-y-6">
              <UploadSection
                files={files}
                setFiles={setFiles}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                isUploading={isUploading}
                isProcessing={isProcessing}
                onFileDrop={handleFileDrop}
                onSubmit={onSubmit}
                message={message}
                setMessage={setMessage}
                isQuerying={isQuerying}
                hasProcessedDocs={hasProcessedDocs}
              />

              <ChatHistory
                messages={chatHistory}
                isQuerying={isQuerying}
                processedDocuments={processedDocuments}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}