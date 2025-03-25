import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const isExpired = (endDate: Date) => {
  return new Date(endDate) < new Date();
};

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invalid announcement ID' },
        { status: 400 }
      );
    }

    // Get current announcement status and dates
    const currentAnnouncement = await prisma.announcement.findUnique({
      where: { id },
      select: { status: true, endDate: true }
    });

    if (!currentAnnouncement) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Toggle the status
    const newStatus = currentAnnouncement.status === 'active' ? 'inactive' : 'active';

    // Check if announcement is expired
    if (isExpired(currentAnnouncement.endDate)) {
      if (currentAnnouncement.status === 'active' || newStatus === 'active') {
        return NextResponse.json(
          { success: false, error: 'Cannot activate expired announcement' },
          { status: 400 }
        );
      }
    }

    // If announcement is expired, force it to inactive
    const finalStatus = isExpired(currentAnnouncement.endDate) ? 'inactive' : newStatus;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { status: finalStatus }
    });

    return NextResponse.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error toggling announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle announcement status' },
      { status: 500 }
    );
  }
}