import { NextResponse } from 'next/server';
import { bannerDb } from '@/lib/db/banner';

export async function POST(request: Request) {
  try {
    const { title, description, imageUrl, link, status, displayOrder } = await request.json();

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    const banner = await bannerDb.create({
      title,
      description,
      imageUrl,
      link,
      status: status || 'inactive',
      displayOrder: displayOrder || 0
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const banners = await bannerDb.getAll();
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const banner = await bannerDb.update(id, data);
    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    await bannerDb.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete banner' },
      { status: 500 }
    );
  }
}