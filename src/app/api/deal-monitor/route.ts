import { NextRequest, NextResponse } from 'next/server';
import { startDealMonitoring } from '@/lib/utils/dealMonitor';

let monitoringInterval: NodeJS.Timeout | null = null;

// POST /api/deal-monitor/start
export async function POST(request: NextRequest) {
  try {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }

    monitoringInterval = await startDealMonitoring();

    return NextResponse.json({ message: 'Deal monitoring started successfully' });
  } catch (error) {
    console.error('Error starting deal monitor:', error);
    return NextResponse.json(
      { error: 'Failed to start deal monitoring' },
      { status: 500 }
    );
  }
}

// DELETE /api/deal-monitor/stop
export async function DELETE() {
  try {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }

    return NextResponse.json({ message: 'Deal monitoring stopped successfully' });
  } catch (error) {
    console.error('Error stopping deal monitor:', error);
    return NextResponse.json(
      { error: 'Failed to stop deal monitoring' },
      { status: 500 }
    );
  }
}