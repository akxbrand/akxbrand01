import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    const announcements = await prisma.announcement.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    await prisma.$disconnect();
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await prisma.$connect();
    const data = await request.json();
    const announcement = await prisma.announcement.create({
      data: {
        message: data.message,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        priority: data.priority,
      },
    });
    await prisma.$disconnect();
    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { success: false, error: 'Failed to create announcement. Please try again later.' },
      { status: 500 }
    );
  }
}