import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Find and delete orders that are older than 24 hours and have pending or failed payment status
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredOrders = await prisma.order.deleteMany({
      where: {
        createdAt: {
          lt: cutoffTime
        },
        OR: [
          { paymentStatus: 'pending' },
          { paymentStatus: 'failed' }
        ]
      }
    });

    console.log(`Cleaned up ${expiredOrders.count} expired orders`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${expiredOrders.count} expired orders`,
      deletedCount: expiredOrders.count
    });
  } catch (error) {
    console.error('Error cleaning up expired orders:', error);
    return NextResponse.json(
      { error: 'Failed to clean up expired orders' },
      { status: 500 }
    );
  }
}