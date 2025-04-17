import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { visitorId } = await request.json();
    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: 'Visitor ID is required' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if this visitor has already been counted today
    const existingVisit = await prisma.dailyVisit.findFirst({
      where: {
        date: today,
        visitorIds: { has: visitorId }
      }
    });

    if (existingVisit) {
      return NextResponse.json({
        success: true,
        count: existingVisit.count,
        message: 'Visit already counted today'
      });
    }

    // Find or create today's visit record and add the new visitor
    const dailyVisit = await prisma.dailyVisit.upsert({
      where: {
        date: today
      },
      update: {
        count: {
          increment: 1
        },
        visitorIds: {
          push: visitorId
        }
      },
      create: {
        date: today,
        count: 1,
        visitorIds: [visitorId]
      }
    });

    return NextResponse.json({
      success: true,
      count: dailyVisit.count,
      message: 'Visit counted successfully'
    });
  } catch (error) {
    console.error('Error updating visit count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update visit count' },
      { status: 500 }
    );
  }
}