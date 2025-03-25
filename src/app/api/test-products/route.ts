import { NextResponse } from 'next/server';

export async function GET() {
  const testProducts = [
    {
      id: '1',
      name: 'Test Product 1',
      images: ['/images/products/bed1.jpg'],
      price: 2999,
      rating: 4.5,
      category: {
        id: '1',
        name: 'Bedding'
      }
    },
    {
      id: '2',
      name: 'Test Product 2',
      images: ['/images/products/bed2.jpg'],
      price: 3999,
      rating: 4.0,
      category: {
        id: '2',
        name: 'Pillows'
      }
    }
  ];

  return NextResponse.json({
    products: testProducts,
    total: testProducts.length,
    page: 1,
    totalPages: 1
  });
}