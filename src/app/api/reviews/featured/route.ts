import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isFeatured: true },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        name: review.user.name,
        image: '/images/user.png',
        rating: review.rating,
        comment: review.text,
        date: review.createdAt.toLocaleDateString(),
        isFeatured: true
      }))
    });
  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured reviews' },
      { status: 500 }
    );
  }
}