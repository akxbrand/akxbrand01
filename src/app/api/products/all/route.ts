import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/all
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection is active
    await prisma.$connect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '36');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      status: "active",
    };

    // Build sort conditions
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price_low_high':
        orderBy = { price: 'asc' };
        break;
      case 'price_high_low':
        orderBy = { price: 'desc' };
        break;
    }

    // Fetch all active products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          subCategory: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy
      }).then(products => {
        return products.map(product => ({
          ...product,
          rating: product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
            : 0,
          reviews: undefined
        }));
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch products: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}