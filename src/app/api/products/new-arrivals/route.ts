import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const newArrivals = await prisma.product.findMany({
      where: {
        isNewArrival: true,
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
        createdAt: 'desc'
      },
      take: 10
    }).catch(error => {
      console.error('Database query failed:', error);
      return null;
    });

    if (!newArrivals) {
      return NextResponse.json(
        { error: 'Database is currently unavailable' },
        { status: 503 }
      );
    }

    if (!newArrivals.length) {
      return NextResponse.json({ products: [] });
    }

    const productsWithRating = newArrivals.map(product => {
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

    return NextResponse.json({ products: productsWithRating });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new arrivals' },
      { status: 500 }
    );
  }
}