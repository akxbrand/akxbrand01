import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Check for expiring product-level deals
    const expiringProductDeals = await prisma.product.findMany({
      where: {
        isLimitedTimeDeal: true,
        dealEndTime: {
          gt: now,
          lte: twentyFourHoursFromNow
        }
      },
      select: {
        id: true,
        name: true,
        dealEndTime: true
      }
    });

    // Check for expiring size-level deals
    const expiringSizeDeals = await prisma.productSize.findMany({
      where: {
        isLimitedTimeDeal: true,
        dealEndTime: {
          gt: now,
          lte: twentyFourHoursFromNow
        }
      },
      select: {
        id: true,
        size: true,
        dealEndTime: true,
        product: {
          select: {
            name: true
          }
        }
      }
    });

    // Create notifications for expiring deals
    for (const deal of expiringProductDeals) {
      await prisma.notification.create({
        data: {
          type: 'deal_expiring',
          title: 'Deal Expiring Soon',
          message: `Limited time deal for product "${deal.name}" will expire in ${Math.ceil((deal.dealEndTime.getTime() - now.getTime()) / (1000 * 60 * 60))} hours.`,
          isRead: false
        }
      });
    }

    for (const deal of expiringSizeDeals) {
      await prisma.notification.create({
        data: {
          type: 'deal_expiring',
          title: 'Deal Expiring Soon',
          message: `Limited time deal for size ${deal.size} of product "${deal.product.name}" will expire in ${Math.ceil((deal.dealEndTime.getTime() - now.getTime()) / (1000 * 60 * 60))} hours.`,
          isRead: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Expiring deals checked successfully'
    });
  } catch (error) {
    console.error('Error checking expiring deals:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check expiring deals' },
      { status: 500 }
    );
  }
}