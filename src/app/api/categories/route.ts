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
    // Ensure database connection is active
    await prisma.$connect();

    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!categories) {
      console.error('No categories found');
      return NextResponse.json({ success: false, error: 'No categories found' }, { status: 404 });
    }

    // Transform the data to include product counts for both categories and subcategories
    const formattedCategories = categories.map(category => ({
      ...category,
      count: category._count.products,
      subCategories: category.subCategories.map(sub => ({
        ...sub,
        count: sub._count.products
      }))
    }));

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