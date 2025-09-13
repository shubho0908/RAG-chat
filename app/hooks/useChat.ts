import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

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

export function useChat() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleChatSubmit = async (hasProcessedDocs: boolean, filename?: string, processedDocuments?: string[]) => {
    if (!message.trim()) return;
    if (!hasProcessedDocs) {
      toast.error('Please upload and process documents first!');
      return;
    }

    setIsQuerying(true);
    const userMessage = message;
    const userMessageId = Date.now().toString();

    const userChatMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, userChatMessage]);
    setMessage('');

    try {
      const response = await axios.post('/api/chat', {
        message: userMessage,
        maxResults: 3,
        filename,
        processedDocuments
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        sources: response.data.sources,
      };

      setChatHistory(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsQuerying(false);
    }
  };

  return {
    message,
    setMessage,
    chatHistory,
    isQuerying,
    handleChatSubmit
  };
}