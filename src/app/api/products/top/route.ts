import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();

    const products = await prisma.product.findMany({
      where: {
        isTop10: true,
        status: 'active'
      },
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
      orderBy: {
        weeklySales: 'desc'
      },
      take: 10
    });

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
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
    });

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.error('Error fetching top products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch top products: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}