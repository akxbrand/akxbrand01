import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
import { getAvailableStock } from '@/lib/utils/reservations';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart?.items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Process cart items within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Verify stock availability for all items
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            reservations: {
              where: {
                status: 'pending',
                expiresAt: { gt: new Date() }
              }
            }
          }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const reservedQuantity = product.reservations.reduce(
          (sum, res) => sum + res.quantity,
          0
        );

        const availableStock = product.stock - reservedQuantity;
        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.product.name}. Available: ${availableStock}`
          );
        }
      }

      // Create reservations for all cart items
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const reservations = await Promise.all(
        cart.items.map((item) =>
          tx.productReservation.create({
            data: {
              userId: session.user.id,
              productId: item.productId,
              quantity: item.quantity,
              status: 'pending',
              expiresAt
            }
          })
        )
      );

      return { reservations, expiresAt };
    });

    const { reservations, expiresAt } = result;

    return NextResponse.json({
      reservationIds: reservations.map(r => r.id),
      expiresAt: reservations[0].expiresAt
    });
  } catch (error: any) {
    console.error('Error creating checkout reservation:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}