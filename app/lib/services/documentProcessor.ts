import fs from 'fs/promises';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

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

const MIME_TYPES = new Map([
  ['pdf', 'application/pdf'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['xls', 'application/vnd.ms-excel']
]);

const TEXT_EXTRACTORS = new Map([
  [MIME_TYPES.get('pdf')!, async (buffer: Buffer) => {
    const pdf = (await import('pdf-parse-fork')).default;
    const pdfData = await pdf(buffer);
    return pdfData.text;
  }],
  
  [MIME_TYPES.get('docx')!, async (buffer: Buffer) => {
    const mammoth = await import('mammoth');
    const docxResult = await mammoth.extractRawText({ buffer });
    return docxResult.value;
  }],
  
  [MIME_TYPES.get('xlsx')!, async (buffer: Buffer) => {
    const { read, utils } = await import('xlsx');
    const workbook = read(buffer, { type: 'buffer' });
    let excelText = '';
    workbook.SheetNames.forEach((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      excelText += utils.sheet_to_txt(sheet) + '\n';
    });
    return excelText;
  }],
  
  [MIME_TYPES.get('xls')!, async (buffer: Buffer) => {
    const { read, utils } = await import('xlsx');
    const workbook = read(buffer, { type: 'buffer' });
    let excelText = '';
    workbook.SheetNames.forEach((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      excelText += utils.sheet_to_txt(sheet) + '\n';
    });
    return excelText;
  }]
]);

export async function extractTextFromFile(filepath: string, fileType: string): Promise<string> {
  const buffer = await fs.readFile(filepath);
  const extractor = TEXT_EXTRACTORS.get(fileType);
  
  if (!extractor) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
  
  return await extractor(buffer);
}

export async function chunkDocument(
  text: string,
  filename: string,
  originalname: string,
  fileType: string
): Promise<DocumentChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitText(text);

  return chunks.map((chunk, index) => ({
    id: `${filename}_chunk_${index}`,
    content: chunk.trim(),
    metadata: {
      filename,
      originalname,
      fileType,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));
}