import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });


    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const formattedOrder = {
      id: order.id,
      date: order.createdAt.toISOString(),
      status: order.status,
      paymentMethod: order.paymentMode,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      total: order.total,
      shippingAddress: order.shippingAddress,
      customerInfo: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phoneNumber
      },
      items: order.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.images[0],
        price: item.price,
        quantity: item.quantity,
        size: item.size
      }))
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}