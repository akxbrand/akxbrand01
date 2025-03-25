import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Ensure database connection
    await prisma.$connect();

    const formData = await request.formData();
    const rating = parseInt(formData.get('rating') as string);
    const text = formData.get('text') as string;
    const productId = formData.get('productId') as string;
    const photoFiles = formData.getAll('photos');
    const photos: string[] = [];
    
    // Process photo files
    for (const file of photoFiles) {
      if (file instanceof File) {
        // Here you would typically upload the file to a storage service
        // For now, we'll store the file name as a placeholder
        photos.push(`/uploads/${file.name}`);
      }
    }
    
    // Get the session to verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Validate required fields
    if (!userId || !productId || !rating || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get product details for notification
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        text,
        photos
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Create admin notification for the new review
    await prisma.adminNotification.create({
      data: {
        type: 'review',
        title: 'New Product Review',
        message: `${review.user.name || 'A user'} reviewed ${product.name} with ${rating} stars`,
        isRead: false,
        metadata: {
          reviewId: review.id,
          productId: review.productId,
          rating: review.rating,
          customerName: review.user.name || 'Anonymous',
          productName: product.name
        }
      }
    });

    // Format the review response
    const formattedReview = {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user.name || 'Anonymous',
      rating: review.rating,
      text: review.text,
      media: review.photos.map((photo) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: 'photo' as const,
        url: photo,
      })),
      createdAt: review.createdAt.toISOString(),
      isVerified: true,
      isHidden: false,
      reportCount: 0
    };

    return NextResponse.json({
      success: true,
      review: formattedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}