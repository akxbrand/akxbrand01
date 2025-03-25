import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
});

export async function GET() {
  try {
    const videos = await prisma.featureVideo.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching feature videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feature videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, videoUrl, description, thumbnailUrl, duration, isActive } = body;

    if (title === undefined || title === null || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and video URL are required' },
        { status: 400 }
      );
    }

    const video = await prisma.featureVideo.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl,
        description,
        duration,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Error creating feature video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create feature video' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, videoUrl, description, thumbnailUrl, duration, isActive, viewCount } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const video = await prisma.featureVideo.update({
      where: { id },
      data: {
        title,
        videoUrl,
        thumbnailUrl,
        description,
        duration,
        viewCount,
        isActive
      }
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Error updating feature video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feature video' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const video = await prisma.featureVideo.findUnique({
      where: { id }
    });

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.videoUrl.includes('cloudinary')) {
      try {
        const publicId = video.videoUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
      } catch (cloudinaryError) {
        console.error('Error deleting video from Cloudinary:', cloudinaryError);
      }
    }

    if (video.thumbnailUrl?.includes('cloudinary')) {
      try {
        const thumbnailPublicId = video.thumbnailUrl.split('/').pop()?.split('.')[0];
        if (thumbnailPublicId) {
          await cloudinary.uploader.destroy(thumbnailPublicId);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting thumbnail from Cloudinary:', cloudinaryError);
      }
    }

    await prisma.featureVideo.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feature video' },
      { status: 500 }
    );
  }
}