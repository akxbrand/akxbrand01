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
        orderStatusCounts
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