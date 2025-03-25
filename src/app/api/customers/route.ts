import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
          },
        },
      },
    });

    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phoneNumber || '',
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + (order.total || 0), 0),
      status: 'active',
      joinedAt: customer.createdAt.toISOString()
    }));

    return NextResponse.json({ success: true, customers: formattedCustomers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, reason } = await request.json();

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: {
        status,
        statusChangeReason: reason,
        statusChangedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer status' },
      { status: 500 }
    );
  }
}