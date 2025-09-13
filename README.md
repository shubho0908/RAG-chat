# RAG Chat Application

<img width="890" height="711" alt="image" src="https://github.com/user-attachments/assets/d0388814-db12-432e-94d4-5632185a42a3" />

A modern Retrieval-Augmented Generation (RAG) chat application built with Next.js that allows users to upload documents and ask questions based on their content.

## Features

- **Multi-format Document Support**: Upload and process PDF, DOCX, XLSX, and XLS files
- **Smart Document Processing**: Text extraction with chunking for optimal retrieval
- **Vector Search**: Semantic search using OpenAI embeddings and Qdrant vector database
- **Real-time Chat**: Interactive chat interface with document-based responses
- **Background Processing**: Async file processing using BullMQ with Redis
- **Modern UI**: Clean, responsive interface with drag-and-drop file upload
- **Source Attribution**: Chat responses include document sources and references

## Tech Stack

- **Frontend**: Next.js 15.5, React 19, TypeScript, Tailwind CSS
- **AI/ML**: OpenAI GPT-5 Nano, OpenAI Embeddings (text-embedding-3-small)
- **Vector Database**: Qdrant for similarity search
- **Queue System**: BullMQ with Redis for background processing
- **Document Processing**: LangChain for text splitting, specialized extractors for each file type
- **UI Components**: Radix UI, Framer Motion, Lucide React icons

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shubho0908/RAG-chat.git
   cd rag-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with the following variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=your_qdrant_api_key (optional for local)
   QDRANT_COLLECTION_NAME=documents
   REDIS_URL=redis://localhost:6379
   ```

4. **Start Required Services**
   ```bash
   # Start Qdrant (using Docker)
   docker run -p 6333:6333 qdrant/qdrant

   # Start Redis (using Docker)
   docker run -p 6379:6379 redis:alpine
   ```

5. **Start the Application**
   ```bash
   # Start the web application
   npm run dev

   # Start the background worker (in a separate terminal)
   npm run worker
   ```

## Usage

1. **Upload Documents**: Drag and drop or select PDF, DOCX, XLSX, or XLS files
2. **Processing**: Files are processed in the background, extracted into chunks, and stored as embeddings
3. **Chat**: Ask questions about your documents and receive AI-generated responses with source citations
4. **Sources**: View which document chunks were used to generate each response

## Architecture

### Document Processing Pipeline
1. **Upload**: Files are uploaded via `/api/upload` endpoint
2. **Queue**: Processing jobs are added to BullMQ queue
3. **Extraction**: Text is extracted using format-specific libraries
4. **Chunking**: Documents are split into 1000-character chunks with 200-character overlap
5. **Embedding**: Chunks are converted to embeddings using OpenAI's text-embedding-3-small
6. **Storage**: Embeddings are stored in Qdrant vector database

### Query Processing
1. **Question**: User submits a question via chat interface
2. **Search**: Question is embedded and searched against document vectors
3. **Context**: Top 3 relevant chunks are retrieved
4. **Generation**: OpenAI GPT-5 Nano generates response based on context
5. **Response**: Answer is returned with source citations

## API Endpoints

- `POST /api/upload` - Upload and queue files for processing
- `POST /api/process` - Process uploaded files (used by queue worker)
- `POST /api/chat` - Submit questions and get AI responses
- `GET /api/batch/[batchId]` - Check processing status

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run worker` - Start background processing worker
- `npm run lint` - Run ESLint

## Supported File Types

- **PDF**: Extracted using pdf-parse-fork
- **DOCX**: Extracted using mammoth
- **XLSX/XLS**: Extracted using xlsx library
