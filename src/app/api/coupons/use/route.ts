import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { couponCode, orderId } = await request.json();

    if (!couponCode || !orderId) {
      return NextResponse.json(
        { error: 'Coupon code and order ID are required' },
        { status: 400 }
      );
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Create coupon usage record
    await prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        userId: session.user.id,
        orderId: orderId
      }
    });

    // Update coupon usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon usage recorded successfully'
    });

  } catch (error) {
    console.error('Error recording coupon usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}