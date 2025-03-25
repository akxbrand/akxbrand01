import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Rate limit the check to run only once every 30 minutes
let lastCheckTime = 0;
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function GET() {
  try {
    const currentTime = Date.now();
    if (currentTime - lastCheckTime < CHECK_INTERVAL) {
      return NextResponse.json({ success: true, message: 'Skipped check - too soon' });
    }
    lastCheckTime = currentTime;
    // Find products with low stock (less than 20) or out of stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [
          { stock: { lte: 20, gt: 0 } },
          { stock: 0 }
        ]
      },
      select: {
        id: true,
        name: true,
        stock: true
      }
    });

    // Create notifications for low stock products
    for (const product of lowStockProducts) {
      // Check if a notification already exists for this product
      const existingNotification = await prisma.adminNotification.findFirst({
        where: {
          type: 'low_stock',
          metadata: {
            equals: {
              productId: product.id
            }
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
          }
        }
      });

      if (!existingNotification) {
        const isOutOfStock = product.stock === 0;
        await prisma.adminNotification.create({
          data: {
            type: 'low_stock',
            title: isOutOfStock ? 'Product Out of Stock' : 'Low Stock Alert',
            message: isOutOfStock
              ? `${product.name} is out of stock!`
              : `${product.name} is running low on stock (${product.stock} remaining)`,
            metadata: {
              productId: product.id,
              currentStock: product.stock
            }
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking product stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check product stock' },
      { status: 500 }
    );
  }
}