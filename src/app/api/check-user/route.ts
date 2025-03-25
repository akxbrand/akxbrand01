import { NextResponse } from 'next/server';
import { userDb } from '@/lib/db/user';

export async function POST(request: Request) {
  try {
    const { phoneNumber, role } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Try to find the user
    const user = await userDb.getByPhoneNumber(phoneNumber).catch(() => null);

    // For admin role, verify the role matches
    if (role === 'admin' && (!user || user.role !== 'admin')) {
      return NextResponse.json(
        { exists: false, message: 'Admin account not found' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      exists: !!user,
      role: user?.role || 'client',
      message: user ? 'User found' : 'User not found'
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}