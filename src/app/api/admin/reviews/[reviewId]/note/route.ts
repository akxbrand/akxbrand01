import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { note } = await request.json();
    const { reviewId } = params;

    if (!note) {
      return NextResponse.json(
        { error: 'Admin note is required' },
        { status: 400 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { adminNotes: note }
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error adding admin note:', error);
    return NextResponse.json(
      { error: 'Failed to add admin note' },
      { status: 500 }
    );
  }
}