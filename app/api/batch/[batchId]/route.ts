import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/app/lib/queue/fileProcessingQueue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    
    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const jobStatus = await getJobStatus(batchId);

    if (!jobStatus) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json({
      batch: {
        id: batchId,
        status: jobStatus.finishedOn ? 'completed' : 'processing'
      },
      job: {
        id: jobStatus.id,
        progress: jobStatus.progress,
        processedOn: jobStatus.processedOn,
        finishedOn: jobStatus.finishedOn,
        failedReason: jobStatus.failedReason,
        returnValue: jobStatus.returnValue,
      },
    });

  } catch (error) {
    console.error('Error fetching batch status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}