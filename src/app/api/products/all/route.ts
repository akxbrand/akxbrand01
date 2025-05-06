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

    // Fetch all active products with pagination
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

          // Handle product pricing based on sizes
          if (product.sizes && product.sizes.length > 0) {
            if (product.sizes.length === 1) {
              // For single size products, directly use the size's price and oldPrice
              const size = product.sizes[0];
              if (size.price > 0) {
                baseProduct.price = size.price;
                if (size.oldPrice && size.oldPrice > size.price) {
                  baseProduct.oldPrice = size.oldPrice;
                }
              }
            } else {
              // For multiple sizes, find the lowest and highest prices
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
          }

          return baseProduct;
        });
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