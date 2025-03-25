import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { addHours } from 'date-fns';

export async function GET() {
  try {
    const twoHoursFromNow = addHours(new Date(), 2);
    
    // Find coupons expiring within 2 hours
    const expiringCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        endDate: {
          lte: twoHoursFromNow,
          gt: new Date()
        }
      }
    });

    // Create notifications for expiring coupons
    for (const coupon of expiringCoupons) {
      const hoursUntilExpiry = Math.round(
        (new Date(coupon.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      // Check if a notification already exists for this coupon
      const existingNotification = await prisma.adminNotification.findFirst({
        where: {
          type: 'coupon_expiring',
          metadata: {
            equals: {
              couponId: coupon.id
            }
          }
        }
      });

      if (!existingNotification) {
        await prisma.adminNotification.create({
          data: {
            type: 'coupon_expiring',
            title: 'Coupon Expiring Soon',
            message: `Coupon "${coupon.code}" will expire in ${hoursUntilExpiry} hours.`,
            isRead: false,
            metadata: {
              couponId: coupon.id
            }
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Checked ${expiringCoupons.length} expiring coupons` 
    });
  } catch (error) {
    console.error('Error checking expiring coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check expiring coupons' },
      { status: 500 }
    );
  }
}