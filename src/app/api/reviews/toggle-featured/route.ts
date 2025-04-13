import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { isFeatured: !review.isFeatured },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        name: updatedReview.user.name,
        image: '/images/user.png',
        rating: updatedReview.rating,
        comment: updatedReview.text,
        date: updatedReview.createdAt.toLocaleDateString(),
        media: updatedReview.photos.map(url => ({
          id: url,
          url: url,
          type: 'image'
        })),
        isFeatured: updatedReview.isFeatured
      }
    });
  } catch (error) {
    console.error('Error toggling review featured status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle review featured status' },
      { status: 500 }
    );
  }
}