import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
});

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;
let cachedCategories: any = null;
let lastCacheTime = 0;

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (cachedCategories && (now - lastCacheTime) / 1000 < CACHE_DURATION) {
      return NextResponse.json({ success: true, categories: cachedCategories });
    }

    // Ensure database connection is active
    await prisma.$connect();

    // Optimize query by selecting only needed fields and using a single query
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        status: true,
        _count: {
          select: { products: true }
        },
        subCategories: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            status: true,
            _count: {
              select: { products: true }
            }
          }
        }
      }
    });

    if (!categories || categories.length === 0) {
      console.error('No categories found');
      return NextResponse.json({ success: false, error: 'No categories found' }, { status: 404 });
    }

    // Transform the data efficiently using a single map operation
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      status: category.status,
      count: category._count.products,
      subCategories: category.subCategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        imageUrl: sub.imageUrl,
        status: sub.status,
        count: sub._count.products
      }))
    }));

    // Update cache
    cachedCategories = formattedCategories;
    lastCacheTime = now;

    return NextResponse.json({ success: true, categories: formattedCategories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories. Please try again later.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, description, imageUrl, status, subcategories } = data;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Name and image are required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        imageUrl,
        status: status || 'active',
        subCategories: {
          create: subcategories?.map((sub: any) => ({
            name: sub.name,
            description: sub.description,
            imageUrl: sub.imageUrl,
            status: 'active'
          })) || []
        }
      },
      include: {
        subCategories: true
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, name, description, imageUrl, status } = data;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl,
        status
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}