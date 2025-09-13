import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { ALLOWED_TYPES, MAX_FILE_SIZE, MAX_FILES_COUNT } from '@/constants/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES_COUNT) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_COUNT} files allowed` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only PDF, DOCX, and Excel files are allowed.' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }
    }

    const uploadDir = join(process.cwd(), 'user-uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const savedFiles = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${uuidv4()}-${file.name}`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);

      savedFiles.push({
        id: uuidv4(),
        filename,
        originalname: file.name,
        size: file.size,
        type: file.type,
        filepath,
      });
    }

    return NextResponse.json({
      message: `${files.length} file(s) uploaded successfully`,
      files: savedFiles,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}