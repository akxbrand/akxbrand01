import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId ? { categoryId } : {};

    const subCategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: true
      }
    });

    return NextResponse.json({ success: true, subCategories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    await prisma.$connect();
    const data = await req.json();
    const { name, description, categoryId, status, imageUrl } = data;

    if (!name || !categoryId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Name, category ID, and image URL are required' },
        { status: 400 }
      );
    }

    const parentCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!parentCategory) {
      return NextResponse.json(
        { success: false, error: 'Parent category not found' },
        { status: 404 }
      );
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        description,
        categoryId,
        status: status || 'active',
        imageUrl,
      }
    });

    return NextResponse.json({ success: true, subCategory });
  } catch (error: any) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    await prisma.$connect();
    const data = await req.json();
    const { id, name, description, categoryId, status } = data;

    if (!id || !name || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'ID, name, and category ID are required' },
        { status: 400 }
      );
    }

    const parentCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!parentCategory) {
      return NextResponse.json(
        { success: false, error: 'Parent category not found' },
        { status: 404 }
      );
    }

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        status
      }
    });

    return NextResponse.json({ success: true, subCategory });
  } catch (error: any) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    await prisma.$connect();
    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Subcategory ID is required' },
        { status: 400 }
      );
    }

    await prisma.subCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}