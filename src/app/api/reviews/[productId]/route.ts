import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
});


export async function GET(
  request: Request,
  context: { params: { productId: string } }
) {
  try {
    await prisma.$connect();
    const { productId } = context.params;

    // Validate productId
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch all reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId: productId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate review statistics
    const totalReviews = reviews.length;
    const ratingSum = reviews.reduce((sum: number, review) => sum + review.rating, 0);
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
      (count, review) => {
        count.photo += review.photos.length;
        return count;
      },
      { photo: 0 }
    );

    // Format reviews for response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user.name || 'Anonymous',
      rating: review.rating,
      text: review.text,
      adminNotes: review.adminNotes,
      media: review.photos.map((photo) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: 'photo' as const,
        url: photo,
      })),
      createdAt: review.createdAt.toISOString(),
      isVerified: true,
      isHidden: false,
      reportCount: 0,
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
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: Request,
  context: { params: { productId: string } }
) {
  try {
    await prisma.$connect();
    const { productId } = await context.params;

    // Validate productId
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const rating = parseInt(formData.get('rating') as string);
    const text = formData.get('text') as string;
    const photos = formData.getAll('photos') as File[];
    
    // Upload photos to Cloudinary
    const uploadPromises = photos.map(async (photo) => {
      if (!(photo instanceof File)) return null;
      
      const buffer = await photo.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      const dataURI = `data:${photo.type};base64,${base64Data}`;
      
      try {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'reviews',
          resource_type: 'auto'
        });
        return result.secure_url;
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
      }
    });
    
    const uploadedPhotos = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];
    
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

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId,
        productId: productId,
        rating,
        text,
        photos: uploadedPhotos || []
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        product: {
          select: {
            name: true
          }
        }
      }
    });

    // Create notification for admin
    await prisma.adminNotification.create({
      data: {
        type: 'review',
        title: 'New Product Review',
        message: `A new review has been submitted for ${review.product.name}`,
        isRead: false,
        metadata: {
          reviewId: review.id,
          productId: review.productId,
          rating: review.rating,
          customerName: review.user.name || 'Anonymous',
          productName: review.product.name
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
  } finally {
    await prisma.$disconnect();
  }
}