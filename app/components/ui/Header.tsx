'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  hasProcessedDocs: boolean;
}

export function Header({ hasProcessedDocs }: HeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl text-white mb-2 font-serif">RAG CHAT</h1>
      <p className="text-gray-400">Upload documents and chat with AI to get intelligent answers</p>

      {hasProcessedDocs && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">Documents processed successfully</span>
          </div>
        </div>
      )}
    </div>
  );
}