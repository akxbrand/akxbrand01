import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';



export async function GET() {
  try {
    // Fetch total orders and calculate revenue
    const orders = await prisma.order.findMany({
      select: {
        total: true,
        status: true,
        createdAt: true
      },
      where: {
        paymentStatus: 'completed'
      }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Get orders from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );

    const recentRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate percentage changes
    const previousThirtyDays = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000) &&
             orderDate < thirtyDaysAgo;
    });

    const previousRevenue = previousThirtyDays.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = previousRevenue === 0 ? 100 :
      ((recentRevenue - previousRevenue) / previousRevenue) * 100;

    // Get active banners count
    const activeBanners = await prisma.banner.count({
      where: { status: 'active' }
    });

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get order status distribution
    const orderStatusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get active announcements count
    const activeAnnouncements = await prisma.announcement.count({
      where: { status: 'active' }
    });

    // Get active products count
    const activeProducts = await prisma.product.count({
      where: { status: 'active' }
    });

    // Get active coupons count
    const activeCoupons = await prisma.coupon.count({
      where: {
        isActive: true,
        endDate: {
          gte: new Date()
        }
      }
    });

    // Get active feature videos count
    const activeFeatureVideos = await prisma.featureVideo.count({
      where: { isActive: true }
    });

    // Get most ordered products with completed payments
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          paymentStatus: 'completed'
        }
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        return {
          name: product?.name || 'Unknown Product',
          orderCount: item._sum.quantity || 0,
          paymentStatus: 'completed'
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        recentRevenue,
        revenueGrowth,
        activeBanners,
        totalUsers,
        recentUsers,
        orderStatusCounts,
        activeAnnouncements,
        activeProducts,
        activeCoupons,
        activeFeatureVideos,
        topProducts: topProductsWithNames
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