import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Find expired announcements that are still active
    const expiredAnnouncements = await prisma.announcement.findMany({
      where: {
        AND: [
          { status: 'active' },
          { endDate: { lt: new Date() } }
        ]
      }
    });

    // Update expired announcements to inactive
    for (const announcement of expiredAnnouncements) {
      await prisma.announcement.update({
        where: { id: announcement.id },
        data: { status: 'inactive' }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${expiredAnnouncements.length} expired announcements to inactive`
    });
  } catch (error) {
    console.error('Error updating announcement statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update announcement statuses' },
      { status: 500 }
    );
  }
}