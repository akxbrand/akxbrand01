import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.$connect();
    const data = await request.json();
    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        message: data.message,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        priority: data.priority,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });
    await prisma.$disconnect();
    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { success: false, error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!params?.id) {
    return NextResponse.json(
      { success: false, error: 'Announcement ID is required' },
      { status: 400 }
    );
  }

  try {
    await prisma.$connect();
    await prisma.announcement.delete({
      where: { id: params.id },
    });
    await prisma.$disconnect();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { success: false, error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}