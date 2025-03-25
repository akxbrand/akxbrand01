import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function GET() {
  try {
    const tomorrow = addDays(new Date(), 1);
    
    // Find announcements expiring within 24 hours
    const expiringAnnouncements = await prisma.announcement.findMany({
      where: {
        status: 'active',
        endDate: {
          lte: tomorrow,
          gt: new Date()
        }
      }
    });

    // Create notifications for expiring announcements
    for (const announcement of expiringAnnouncements) {
      const hoursUntilExpiry = Math.round(
        (new Date(announcement.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      // Check if a notification already exists for this announcement
      const existingNotification = await prisma.adminNotification.findFirst({
        where: {
          type: 'announcement_expiring',
          metadata: {
            equals: {
              announcementId: announcement.id
            }
          }
        }
      });

      if (!existingNotification) {
        await prisma.adminNotification.create({
          data: {
            type: 'announcement_expiring',
            title: 'Announcement Expiring Soon',
            message: `Announcement "${announcement.message}" will expire in ${hoursUntilExpiry} hours.`,
            isRead: false,
            metadata: {
              announcementId: announcement.id
            }
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Checked ${expiringAnnouncements.length} expiring announcements` 
    });
  } catch (error) {
    console.error('Error checking expiring announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check expiring announcements' },
      { status: 500 }
    );
  }
}