import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/coupons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      code: { contains: search, mode: 'insensitive' },
      ...(isActive !== null && { isActive: isActive === 'true' })
    };

    // Fetch coupons with pagination and filters
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.count({ where })
    ]);

    return NextResponse.json({
      coupons,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields with specific error messages
    const requiredFields = {
      code: 'Coupon code is required',
      discountAmount: 'Discount amount is required',
      startDate: 'Start date is required',
      endDate: 'End date is required'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!data[field]) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    // Validate discount amount
    if (typeof data.discountAmount !== 'number' || data.discountAmount <= 0) {
      return NextResponse.json({ error: 'Invalid discount amount' }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start date format' }, { status: 400 });
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid end date format' }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Create new coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType || 'percentage',
        discountAmount: data.discountAmount,
        minPurchase: data.minPurchase || 0,
        maxDiscount: data.maxDiscount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit,
        categoryIds: data.categoryIds || [],
        productIds: data.productIds || [],
        isActive: data.isActive ?? true
      }
    });

    return NextResponse.json({ coupon, message: "Coupon created successfully" }, { status: 201 });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupons/:id
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const couponId = pathSegments[pathSegments.length - 1];

    if (!couponId) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Update coupon
    const coupon = await prisma.coupon.update({
      where: { id: couponId },
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
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const couponId = request.url.split('/').pop();

    if (!couponId) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Delete coupon
    await prisma.coupon.delete({
      where: { id: couponId }
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