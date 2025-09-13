'use client';

import React from 'react';
import { User, Bot, FileText } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: {
    id: number;
    filename: string;
    chunkIndex: number;
    pageNumber: number | null;
    content: string;
  }[];
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  isQuerying: boolean;
  processedDocuments?: string[];
}

export function ChatHistory({ messages, isQuerying, processedDocuments = [] }: ChatHistoryProps) {
  if (messages.length === 0 && !isQuerying) {
    return null;
  }

  return (
    <div className="bg-[#2A2D31] rounded-2xl border border-[#3A3D41] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Chat History</h3>
        {processedDocuments.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FileText size={16} />
            <span>{processedDocuments.length} document(s) processed</span>
          </div>
        )}
      </div>

      {processedDocuments.length > 0 && (
        <div className="mb-4 p-3 bg-[#1A1D21] rounded-lg border border-[#3A3D41]/50">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Processed Documents:</h4>
          <div className="flex flex-wrap gap-2">
            {processedDocuments.map((doc, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs"
              >
                <FileText size={12} className="mr-1" />
                {doc}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="flex space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className="flex-1">
              <div className={`rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500/10 text-blue-100'
                  : 'bg-green-500/10 text-gray-300'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <h5 className="text-xs font-medium text-gray-400 mb-2">Sources:</h5>
                    <div className="space-y-1">
                      {message.sources.map((source) => (
                        <div key={source.id} className="text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                          <div className="font-medium">{source.filename}</div>
                          <div className="mt-1">{source.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isQuerying && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
              <Bot size={16} />
            </div>
            <div className="flex-1">
              <div className="rounded-lg p-3 bg-green-500/10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}