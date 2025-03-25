import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to create a review notification
async function createReviewNotification(review: any) {
  return prisma.adminNotification.create({
    data: {
      type: 'review',
      title: 'New Product Review',
      message: `A new review has been submitted for ${review.product.name}`,
      isRead: false,
      metadata: {
        reviewId: review.id,
        productId: review.productId,
        rating: review.rating,
        customerName: review.user.name,
        productName: review.product.name
      }
    }
  });
}

// POST endpoint to create review notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { review } = await request.json();
    if (!review || !review.id || !review.productId) {
      return NextResponse.json(
        { success: false, error: 'Invalid review data' },
        { status: 400 }
      );
    }

    const notification = await createReviewNotification(review);
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error creating review notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to latest 50 notifications
    });

    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false }
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAs } = body;

    if (!Array.isArray(notificationIds) || !notificationIds.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    await prisma.adminNotification.updateMany({
      where: { id: { in: notificationIds } },
      data: {
        isRead: markAs === 'read',
        readAt: markAs === 'read' ? new Date() : null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds) || !notificationIds.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    await prisma.adminNotification.deleteMany({
      where: { id: { in: notificationIds } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}