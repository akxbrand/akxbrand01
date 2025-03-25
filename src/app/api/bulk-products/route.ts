import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const bulkProducts = await prisma.bulkOrderProduct.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!bulkProducts || bulkProducts.length === 0) {
      return NextResponse.json([]);
    }

    const formattedProducts = bulkProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      minBulkQuantity: product.minQuantity,
      bulkPrice: product.pricePerUnit,
      price: product.regularPrice
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching bulk products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bulk products' },
      { status: 500 }
    );
  }
}