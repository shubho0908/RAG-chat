import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addFileProcessingJob } from '@/app/lib/queue/fileProcessingQueue';
import { FileProcessingJobData } from '@/app/lib/queue/types';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const batchId = uuidv4();

    const jobData: FileProcessingJobData = {
      batchId,
      files,
    };

    const jobId = await addFileProcessingJob(jobData);

    return NextResponse.json({
      message: `${files.length} file(s) queued for processing`,
      jobId,
      totalFiles: files.length,
    });

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}