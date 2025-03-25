import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get current date and date 30 days ago for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch current period metrics
    const [totalOrders, totalProducts, activeBanners, totalRevenue, recentProducts] = await Promise.all([
      // Total Orders with comparison
      Promise.all([
        prisma.order.count({
          where: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }),
        prisma.order.count({
          where: {
            createdAt: {
              gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
              lt: thirtyDaysAgo
            }
          }
        })
      ]),

      // Total Products with comparison
      Promise.all([
        prisma.product.count({
          where: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }),
        prisma.product.count({
          where: {
            createdAt: {
              gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
              lt: thirtyDaysAgo
            }
          }
        })
      ]),

      // Active Banners
      prisma.banner.count({
        where: {
          status: 'active'
        }
      }),

      // Total Revenue with comparison
      Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            status: 'completed'
          },
          _sum: {
            total: true
          }
        }),
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
              lt: thirtyDaysAgo
            },
            status: 'completed'
          },
          _sum: {
            total: true
          }
        })
      ]),

      // Recent Products
      prisma.product.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          category: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    // Calculate percentage changes
    const orderChange = calculatePercentageChange(totalOrders[1], totalOrders[0]);
    const productChange = calculatePercentageChange(totalProducts[1], totalProducts[0]);
    const revenueChange = calculatePercentageChange(
      totalRevenue[1]._sum.total || 0,
      totalRevenue[0]._sum.total || 0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: totalOrders[0],
        orderChange,
        totalProducts: totalProducts[0],
        productChange,
        activeBanners,
        totalRevenue: totalRevenue[0]._sum.total || 0,
        revenueChange,
        recentProducts
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}