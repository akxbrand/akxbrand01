import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      dbOrderId
    } = await req.json();

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      await prisma.order.update({
        where: { id: dbOrderId },
        data: {
          status: 'failed',
          paymentStatus: 'failed'
        }
      });

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get the order details to check for coupon usage
    const existingOrder = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status, reduce product stock, clear cart, and create notification in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: dbOrderId },
        data: {
          status: 'confirmed',
          paymentStatus: 'completed',
          paymentId: razorpay_payment_id,
          paymentMode: 'razorpay',
          paymentTimestamp: new Date(),
          transactionDetails: {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
          }
        }
      });

      // Update product stock and size stock for each item
      for (const item of existingOrder.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { sizes: true }
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // If the item has a size, update the specific size's stock
        if (item.size) {
          const productSize = product.sizes.find(size => size.size === item.size);
          if (!productSize || productSize.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId} size ${item.size}`);
          }

          await tx.productSize.update({
            where: { id: productSize.id },
            data: {
              stock: { decrement: item.quantity }
            }
          });
        } else {
          // If no size specified, update the main product stock
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity }
            }
          });
        }
      }

      // Clear the user's cart within the transaction
      const userCart = await tx.cart.findUnique({
        where: { userId: session.user.id }
      });

      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
      }

      // Create notification for admin about the new order
      await tx.adminNotification.create({
        data: {
          type: 'order',
          title: 'New Order Placed',
          message: `Order #${updatedOrder.id} has been placed and payment confirmed.`,
          isRead: false
        }
      });

      // Get user details for email
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true }
      });

      if (!user?.email) {
        throw new Error('User email not found');
      }

      return { updatedOrder, userDetails: user };
    });

    // Send order confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import('@/lib/email');
      await sendOrderConfirmationEmail({
        orderNumber: order.updatedOrder.id,
        customerName: order.userDetails.name || 'Valued Customer',
        customerEmail: order.userDetails.email,
        items: existingOrder.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        total: existingOrder.total,
        shippingAddress: existingOrder.shippingAddress,
        paymentMode: 'Razorpay'
      });
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Continue with the order process even if email fails
    }

    // Return order details needed for success modal
    return NextResponse.json({
      message: 'Payment verified successfully',
      order: {
        updatedOrder: {
          id: order.updatedOrder.id,
          total: existingOrder.total,
          items: existingOrder.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}