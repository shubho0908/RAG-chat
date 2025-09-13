import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';

interface ChatRequest {
  message: string;
  maxResults?: number;
}

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-5-nano-2025-08-07'
});

export async function POST(request: NextRequest) {
  try {
    const { message, maxResults = 3 }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    });

    const config = {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: process.env.QDRANT_COLLECTION_NAME || 'documents',
      ...(process.env.QDRANT_API_KEY && { apiKey: process.env.QDRANT_API_KEY }),
    };

    let vectorStore;
    try {
      vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, config);
    } catch {
      return NextResponse.json({
        response: "Please upload and process documents first before asking questions.",
        sources: [],
        documentsFound: 0
      });
    }

    const relevantDocs = await vectorStore.similaritySearch(message, maxResults);

    if (relevantDocs.length === 0) {
      return NextResponse.json({
        response: "I couldn't find any relevant information in the uploaded documents to answer your question.",
        sources: [],
        documentsFound: 0
      });
    }

    const context = relevantDocs
      .map((doc, index) => `Document ${index + 1}: ${doc.pageContent}`)
      .join('\n\n');

    const prompt = `You are a document assistant that answers questions based on the provided context from uploaded documents.

Context from uploaded documents:
${context}

User Question: ${message}

Answer based on the provided context:`;

    const response = await llm.invoke(prompt);

    const sources = relevantDocs.slice(0, 3).map((doc, index) => ({
      id: index + 1,
      filename: doc.metadata.originalname || doc.metadata.filename || 'Unknown',
      chunkIndex: doc.metadata.chunkIndex || 0,
      pageNumber: doc.metadata.pageNumber || null,
      content: doc.pageContent.substring(0, 150) + '...',
    }));

    return NextResponse.json({
      response: response.content,
      sources,
      documentsFound: relevantDocs.length,
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}