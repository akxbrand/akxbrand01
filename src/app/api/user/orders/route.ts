import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Ensure database connection
    await prisma.$connect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { paymentStatus: 'completed' },
          { status: 'confirmed' },
          { paymentStatus: 'pending', createdAt: { gte: new Date(Date.now() - 72 * 60 * 60 * 1000) } }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }).catch(error => {
      console.error('Database query failed:', error);
      throw new Error('Failed to fetch orders from database');
    });

    if (!orders) {
      return NextResponse.json(
        { error: 'Database is currently unavailable' },
        { status: 503 }
      );
    }

    const formattedOrders = orders.filter(order => order.items.length > 0).map(order => ({
      id: order.id,
      date: order.createdAt.toISOString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMode: order.paymentMode,
      total: order.total,
      items: order.items.map(item => ({
        id: item.id,
        name: item.product.name,
        image: item.product.images[0],
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}