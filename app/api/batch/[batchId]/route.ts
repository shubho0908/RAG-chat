import { NextRequest, NextResponse } from 'next/server';
import { getBatchStatus } from '@/app/lib/queue/worker';
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

    const batchStatus = await getBatchStatus(batchId);
    
    if (!batchStatus) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const jobStatus = await getJobStatus(batchId);

    return NextResponse.json({
      batch: batchStatus,
      job: jobStatus ? {
        id: jobStatus.id,
        progress: jobStatus.progress,
        processedOn: jobStatus.processedOn,
        finishedOn: jobStatus.finishedOn,
        failedReason: jobStatus.failedReason,
      } : null,
    });

  } catch (error) {
    console.error('Error fetching batch status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}