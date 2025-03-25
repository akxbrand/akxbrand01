import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { params } = context;
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const orderId = params.orderId;

    if (!status || !orderId) {
      return NextResponse.json(
        { error: !status ? 'Status is required' : 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });


    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}