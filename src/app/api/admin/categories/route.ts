import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Ensure database connection is active
    await prisma.$connect();

    const categories = await prisma.category.findMany({
      where: {
        status: 'Active'
      },
      include: {
        subCategories: {
          where: {
            status: 'Active'
          },
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!categories) {
      console.error('No categories found');
      return NextResponse.json({ success: false, error: 'No categories found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, categories });
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