import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();
    const { name, description, minQuantity, regularPrice, pricePerUnit } = data;

    if (pricePerUnit >= regularPrice) {
      return NextResponse.json(
        { error: 'Bulk price per unit must be less than regular price' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.bulkOrderProduct.update({
      where: { id },
      data: {
        name,
        description,
        minQuantity,
        pricePerUnit,
        regularPrice,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating bulk order product:', error);
    return NextResponse.json(
      { error: 'Failed to update bulk order product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.bulkOrderProduct.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bulk order product:', error);
    return NextResponse.json(
      { error: 'Failed to delete bulk order product' },
      { status: 500 }
    );
  }
}