// import { NextResponse } from 'next/server';
// import React from 'react';
// import prisma from '@/lib/prisma';

// export async function GET(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   try {
//     const productId = context.params.id;

//     const product = await prisma.product.findUnique({
//       where: {
//         id: productId
//       },
//       include: {
//         category: true,
//         subCategory: true,
//         sizes: true,
//         reviews: {
//           include: {
//             user: {
//               select: {
//                 name: true,
//                 id: true
//               }
//             }
//           }
//         }
//       }
//     });

//     if (!product) {
//       return NextResponse.json(
//         { error: 'Product not found' },
//         { status: 404 }
//       );
//     }

//     // Transform the data to match the expected format
//     const transformedProduct = {
//       ...product,
//       category: product.category,
//       subCategory: product.subCategory
//     };

//     return NextResponse.json({ product: transformedProduct });
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch product' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params; // Await params before using
    const productId = params?.id;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        subCategory: true,
        sizes: true,
        reviews: {
          include: {
            user: {
              select: { name: true, id: true }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
