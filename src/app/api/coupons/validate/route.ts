import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    if (!cartTotal || cartTotal <= 0) {
      return NextResponse.json({ error: 'Invalid cart total' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code,
        isActive: true,
        startDate: {
          lte: new Date()
        },
        endDate: {
          gte: new Date()
        }
      }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }
    // Check if user has already used this coupon

    const existingUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: session.user.id
      }
    });

    if (existingUsage) {
      return NextResponse.json(
        { error: 'You have already used this coupon' },
        { status: 400 }
      );
    }

    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return NextResponse.json(
        { error: `Minimum purchase amount of ₹${coupon.minPurchase} required` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountAmount) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountAmount;
    }

    return NextResponse.json({
      success: true,
      discount: Math.round(discount),
      couponDetails: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        maxDiscount: coupon.maxDiscount
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}