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
      take: 3
    });

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        userName: review.user.name,
        userImage: '/images/user.png',
        rating: review.rating,
        text: review.text,
        media: review.photos.map(url => ({
          id: url,
          url: url,
          type: 'image'
        }))
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