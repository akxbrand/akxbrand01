import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, description, minQuantity, regularPrice, pricePerUnit } = data;

    // Validate required fields
    if (!name || !description || !minQuantity || !regularPrice || !pricePerUnit) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (minQuantity < 1) {
      return NextResponse.json(
        { error: 'Minimum quantity must be at least 1' },
        { status: 400 }
      );
    }

    if (regularPrice <= 0 || pricePerUnit <= 0) {
      return NextResponse.json(
        { error: 'Prices must be greater than 0' },
        { status: 400 }
      );
    }

    if (pricePerUnit >= regularPrice) {
      return NextResponse.json(
        { error: 'Bulk price per unit must be less than regular price' },
        { status: 400 }
      );
    }

    const bulkProduct = await prisma.bulkOrderProduct.create({
      data: {
        name,
        description,
        minQuantity,
        regularPrice,
        pricePerUnit,
      },
    });

    return NextResponse.json(bulkProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating bulk order product:', error);
    return NextResponse.json(
      { error: 'Failed to create bulk order product' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bulkProducts = await prisma.bulkOrderProduct.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bulkProducts);
  } catch (error) {
    console.error('Error fetching bulk order products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bulk order products' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, description, minQuantity, regularPrice, pricePerUnit } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !description || !minQuantity || !regularPrice || !pricePerUnit) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (minQuantity < 1) {
      return NextResponse.json(
        { error: 'Minimum quantity must be at least 1' },
        { status: 400 }
      );
    }

    if (regularPrice <= 0 || pricePerUnit <= 0) {
      return NextResponse.json(
        { error: 'Prices must be greater than 0' },
        { status: 400 }
      );
    }

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
        regularPrice,
        pricePerUnit,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error fetching bulk order products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bulk order products' },
      { status: 500 }
    );
  }
}