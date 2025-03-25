import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, message: 'Email already subscribed' },
        { status: 400 }
      );
    }

    // Create new subscriber
    const subscriber = await prisma.newsletter.create({
      data: {
        email,
        subscribedAt: new Date(),
      },
    });

    // Create notification for admin
    await prisma.adminNotification.create({
      data: {
        type: 'newsletter_subscription',
        title: 'New Newsletter Subscription',
        message: `New subscriber: ${email}`,
        isRead: false,
        metadata: {
          subscriberId: subscriber.id,
          email: email
        }
      }
    });

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to newsletter' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}