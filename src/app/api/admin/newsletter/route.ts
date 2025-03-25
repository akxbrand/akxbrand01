import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const subscribers = await prisma.newsletter.findMany({
      orderBy: {
        subscribedAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        status: true,
        subscribedAt: true
      }
    });

    return NextResponse.json({ success: true, subscribers });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter subscribers' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedSubscriber = await prisma.newsletter.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      subscriber: updatedSubscriber
    });
  } catch (error) {
    console.error('Error updating newsletter subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscriber status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing subscriber ID' },
        { status: 400 }
      );
    }

    await prisma.newsletter.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}