import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Update all addresses to non-default
    await prisma.address.updateMany({
      where: {
        userId: user.id,
        id: { not: params.id }
      },
      data: { isDefault: false }
    });

    // Set the selected address as default
    const address = await prisma.address.update({
      where: { id: params.id },
      data: { isDefault: true }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Error updating default address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}