import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection is active
    await prisma.$connect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '100000');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      name: { contains: search, mode: 'insensitive' },
      price: {
        gte: minPrice,
        lte: maxPrice
      },
      status: "active",
      ...(categories && {
        categoryId: {
          in: categories.split(','),
        },
      })
    };

    // Build sort conditions
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        // For rating sort, we'll calculate average rating after fetching the products
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch products with pagination and filters
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          subCategory: true,
          sizes: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy
      }).then(products => {
        return products.map(product => {
          const baseProduct = {
            ...product,
            rating: product.reviews.length > 0
              ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
              : 0,
            reviews: undefined
          };

          // If product has sizes, find the lowest and highest prices
          if (product.sizes && product.sizes.length > 0) {
            const prices = product.sizes.map(s => s.price).filter(p => p > 0);
            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              baseProduct.price = minPrice;
              if (maxPrice > minPrice) {
                baseProduct.oldPrice = maxPrice;
              }
            }
          }

          return baseProduct;
        })
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
    console.error('Error fetching products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch products: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}