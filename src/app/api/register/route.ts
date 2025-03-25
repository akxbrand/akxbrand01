import { NextResponse } from 'next/server';
import { userDb } from '@/lib/db/user';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password, phoneNumber, address } = await request.json();

    // Validate required fields
    if (!email || !password || !phoneNumber || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await userDb.create({
      name,
      email,
      password,
      phoneNumber,
      address,
      role: 'client'
    });

    // Create notification for admin
    await prisma.adminNotification.create({
      data: {
        type: 'new_user',
        title: 'gistration',
        message: `${name} has registered as a new user`,
        metadata: {
          userId: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to register user',
        code: error.code
      },
      { status: error.code === 'DUPLICATE_PHONE' ? 409 : 500 }
    );
  }
}