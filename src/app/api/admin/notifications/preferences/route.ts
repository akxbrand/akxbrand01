import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { notificationId, productId, acknowledged } = await request.json();

    if (!notificationId || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the notification exists
    const notification = await prisma.adminNotification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }
    // Update the notification acknowledgment
    await prisma.adminNotification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        metadata: {
          update: {
            acknowledged: acknowledged,
            acknowledgedAt: new Date()
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}