import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingAddress, paymentDetails } = await req.json();

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size
          }))
        },
        total: items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
        shippingAddress,
        paymentId: paymentDetails.paymentId,
        paymentStatus: 'completed',
        paymentMode: paymentDetails.paymentMode,
        paymentTimestamp: new Date(),
        transactionDetails: paymentDetails
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Update product stock
    await Promise.all(
      order.items.map(async (item) => {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      })
    );

    // Clear user's cart
    await prisma.cart.delete({
      where: { userId: session.user.id }
    });

    // Send order confirmation email
    await sendOrderConfirmationEmail({
      orderNumber: order.id,
      customerName: order.user.name || 'Valued Customer',
      customerEmail: order.user.email || '',
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size
      })),
      total: order.total,
      shippingAddress: order.shippingAddress as any,
      paymentMode: order.paymentMode || undefined
    });

    return NextResponse.json({
      success: true,
      orderId: order.id
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}