import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/products/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = React.use(params);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        sizes: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = params;
    const productId = id;

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        nickname: data.nickname,
        images: data.images,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        oldPrice: data.oldPrice,
        price: data.price,
        stock: data.stock,
        status: data.status,
        isLimitedTimeDeal: data.isLimitedTimeDeal,
        dealStartTime: data.dealStartTime,
        dealEndTime: data.dealEndTime,
        dealQuantityLimit: data.dealQuantityLimit,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        isTop10: data.isTop10,
        isLimitted: data.isLimitted,
        weeklySales: data.weeklySales,
        sizes: {
          deleteMany: {},
          create: data.sizes?.map((size: any) => ({
            size: size.size,
            description: size.description,
            uniqueFeatures: size.uniqueFeatures,
              productDetails: size.productDetails,
              careInstructions: size.careInstructions,
              deliveryReturns: size.deliveryReturns,
            oldPrice: size.oldPrice,
            price: size.price,
            stock: size.stock,
            isLimitedTimeDeal: size.isLimitedTimeDeal,
            dealStartTime: size.dealStartTime,
            dealEndTime: size.dealEndTime,
            dealQuantityLimit: size.dealQuantityLimit
          })) || []
        }
      },
      include: {
        category: true,
        subCategory: true,
        sizes: true
      }
    });

    return NextResponse.json({ product, message: "Product updated successfully" });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}