import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/coupons/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = React.use(params);
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ coupon });

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupons/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = params;

    // Update coupon
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountAmount: data.discountAmount,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        usageLimit: data.usageLimit,
        categoryIds: data.categoryIds,
        productIds: data.productIds,
        isActive: data.isActive
      }
    });

    return NextResponse.json({ coupon, message: "Coupon updated successfully" });

  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupons/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.coupon.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}