import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the productId from query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch all reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId: productId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate review statistics
    const totalReviews = reviews.length;
    const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce((dist: { [key: number]: number }, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {});

    // Calculate percentages for each rating
    const ratingPercentages = Object.entries(ratingDistribution).reduce(
      (acc: { [key: string]: number }, [rating, count]) => {
        acc[rating] = (count / totalReviews) * 100;
        return acc;
      },
      {}
    );

    // Count media files
    const mediaCount = reviews.reduce(
      (count: { photo: number, video: number }, review) => {
        count.photo += review.photos?.length || 0;
        count.video += review.videos?.length || 0;
        return count;
      },
      { photo: 0, video: 0 }
    );

    // Format reviews for response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user.name || 'Anonymous',
      userEmail: review.user.email,
      rating: review.rating,
      text: review.text,
      photos: review.photos || [],
      videos: review.videos || [],
      createdAt: review.createdAt,
      isVerified: review.isVerified,
      isHidden: review.isHidden,
      adminNotes: review.adminNotes,
      reportCount: review.reportCount || 0,
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      stats: {
        totalReviews,
        averageRating,
        ratingDistribution: ratingPercentages,
        mediaCount,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}