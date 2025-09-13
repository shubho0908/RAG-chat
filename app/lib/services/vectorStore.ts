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

function createEmbeddings(): OpenAIEmbeddings {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-3-small',
  });
}

export async function createEmbeddingsAndStore(chunks: DocumentChunk[]): Promise<void> {
  if (chunks.length === 0) {
    console.log('No chunks to process');
    return;
  }

  console.log(`Creating embeddings for ${chunks.length} chunks`);

  const documents = chunks.map(chunk => {
    console.log('Storing document with metadata:', chunk.metadata);
    return new Document({
      pageContent: chunk.content,
      metadata: {
        ...chunk.metadata,
        chunkId: chunk.id,
      }
    });
  });

  const embeddings = createEmbeddings();
  const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
  const qdrantApiKey = process.env.QDRANT_API_KEY;
  const collectionName = process.env.QDRANT_COLLECTION_NAME || 'documents';

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

  let vectorStore;
  try {
    vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, config);
  } catch {
    console.log(`Collection ${collectionName} doesn't exist, creating it with documents...`);
    vectorStore = await QdrantVectorStore.fromDocuments(documents, embeddings, config);
    console.log(`✅ Created collection and stored ${chunks.length} chunks`);
    return;
  }

  await vectorStore.addDocuments(documents);
  console.log(`✅ Added ${chunks.length} chunks to existing collection`);
}