import { NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Function to clean up expired reservations
async function cleanupExpiredReservations() {
  try {
    const expiredReservations = await prisma.productReservation.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          lt: new Date()
        }
      },
      include: {
        product: true
      }
    });

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        // Update reservation status
        await tx.productReservation.update({
          where: { id: reservation.id },
          data: { status: 'expired' }
        });
      });
    }
  } catch (error) {
    console.error('Error cleaning up reservations:', error);
  }
}

// POST /api/reservations - Create a new reservation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Clean up expired reservations first
    await cleanupExpiredReservations();

    // Start a transaction to handle the reservation
    const result = await prisma.$transaction(async (tx) => {
      // Get product with current reservations
      const product = await tx.product.findUnique({
        where: { id: productId },
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
        throw new Error('Product not found');
      }

      // Calculate available stock
      const reservedQuantity = product.reservations.reduce((sum:number, res:any) => sum + res.quantity, 0);
      const availableStock = product.stock - reservedQuantity;

      if (availableStock < quantity) {
        throw new Error('Insufficient stock');
      }

      // Create reservation with 10-minute expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const reservation = await tx.productReservation.create({
        data: {
          productId,
          userId: session.user.id,
          quantity,
          expiresAt,
          status: 'pending'
        }
      });

      return reservation;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create reservation' },
      { status: 400 }
    );
  }
}

// DELETE /api/reservations/:id - Cancel a reservation
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const reservationId = url.pathname.split('/').pop();

    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    const reservation = await prisma.productReservation.findUnique({
      where: { id: reservationId }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.productReservation.update({
      where: { id: reservationId },
      data: { status: 'expired' }
    });

    return NextResponse.json({ message: 'Reservation cancelled successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to cancel reservation' },
      { status: 400 }
    );
  }
}