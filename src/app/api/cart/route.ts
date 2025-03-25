import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.cart?.items || []);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cart - Add/Update cart items
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { items } = data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate stock availability within a transaction
    // Validate stock availability first
    for (const item of items) {
      const product = await prisma.product.findUnique({
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
          `Insufficient stock for product ${product.name}. Available: ${availableStock}`
        );
      }
    }

    // Transform items array to match Prisma's expected format
    const cartItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    // Update or create cart with proper nested items structure
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {
        items: {
          deleteMany: {},
          create: cartItems
        }
      },
      create: {
        userId: user.id,
        items: {
          create: cartItems
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingCart = await prisma.cart.findUnique({
      where: { userId: user.id }
    });

    if (!existingCart) {
      return NextResponse.json({ message: 'Cart is already empty' });
    }

    await prisma.cart.delete({
      where: { userId: user.id }
    });

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}