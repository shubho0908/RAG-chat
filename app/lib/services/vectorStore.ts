import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Document } from '@langchain/core/documents';

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    filename: string;
    originalname: string;
    fileType: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

let vectorStoreInstance: QdrantVectorStore | null = null;

function createEmbeddings(): OpenAIEmbeddings {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-3-small',
  });
}

async function getVectorStore(): Promise<QdrantVectorStore> {
  if (vectorStoreInstance) {
    return vectorStoreInstance;
  }

  const embeddings = createEmbeddings();
  const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
  const qdrantApiKey = process.env.QDRANT_API_KEY;
  const collectionName = process.env.QDRANT_COLLECTION_NAME || 'documents';

  if (!qdrantUrl) {
    throw new Error('QDRANT_URL environment variable is required');
  }

  if (qdrantUrl.includes('cloud.qdrant.io') && !qdrantApiKey) {
    throw new Error('QDRANT_API_KEY environment variable is required for Qdrant Cloud');
  }

  const config: {
    url: string;
    collectionName: string;
    apiKey?: string;
  } = {
    url: qdrantUrl,
    collectionName,
  };

  if (qdrantApiKey) {
    config.apiKey = qdrantApiKey;
  }

  vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    config
  );

  return vectorStoreInstance;
}

export async function createEmbeddingsAndStore(chunks: DocumentChunk[]): Promise<void> {
  if (chunks.length === 0) {
    console.log('No chunks to process');
    return;
  }

  console.log(`Creating embeddings for ${chunks.length} chunks`);

  const documents = chunks.map(chunk => new Document({
    pageContent: chunk.content,
    metadata: {
      ...chunk.metadata,
      chunkId: chunk.id,
    }
  }));

  const vectorStore = await getVectorStore();
  
  await vectorStore.addDocuments(documents);
  console.log(`✅ Stored ${chunks.length} chunks in Qdrant`);
}

export async function searchSimilarDocuments(query: string, k: number = 5) {
  const vectorStore = await getVectorStore();
  return await vectorStore.similaritySearch(query, k);
}