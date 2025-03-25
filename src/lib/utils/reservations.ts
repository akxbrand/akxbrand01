import  prisma  from '@/lib/prisma';

export async function validateAndUpdateReservation(
  reservationId: string,
  userId: string
) {
  return await prisma.$transaction(async (tx) => {
    // Get the reservation with product details
    const reservation = await tx.productReservation.findUnique({
      where: { id: reservationId },
      include: { product: true }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new Error('Unauthorized access to reservation');
    }

    if (reservation.status !== 'pending') {
      throw new Error('Reservation is no longer valid');
    }

    if (reservation.expiresAt < new Date()) {
      await tx.productReservation.update({
        where: { id: reservationId },
        data: { status: 'expired' }
      });
      throw new Error('Reservation has expired');
    }

    // Verify current stock availability
    const currentProduct = await tx.product.findUnique({
      where: { id: reservation.productId },
      include: {
        reservations: {
          where: {
            status: 'pending',
            expiresAt: { gt: new Date() },
            id: { not: reservationId }
          }
        }
      }
    });

    if (!currentProduct) {
      throw new Error('Product not found');
    }

    const reservedQuantity = currentProduct.reservations.reduce(
      (sum:number, res:any) => sum + res.quantity,
      0
    );

    if (currentProduct.stock - reservedQuantity < reservation.quantity) {
      throw new Error('Insufficient stock');
    }

    // Update reservation status to completed
    await tx.productReservation.update({
      where: { id: reservationId },
      data: { status: 'completed' }
    });

    // Update product stock
    await tx.product.update({
      where: { id: reservation.productId },
      data: {
        stock: {
          decrement: reservation.quantity
        }
      }
    });

    return reservation;
  });
}

export async function getAvailableStock(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
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

  const reservedQuantity = product.reservations.reduce(
    (sum, res) => sum + res.quantity,
    0
  );

  return product.stock - reservedQuantity;
}