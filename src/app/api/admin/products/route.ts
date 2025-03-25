import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/products
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection is active
    await prisma.$connect();

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      name: { contains: search, mode: 'insensitive' },
      ...(category && { categoryId: category }),
      ...(subcategory && { subCategoryId: subcategory })
    };

    // Fetch products with pagination and filters
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          subCategory: true,
          sizes: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    // Calculate total stock for each product by summing up stock across all sizes
    const productsWithTotalStock = products.map(product => ({
      ...product,
      stock: product.sizes.reduce((total, size) => total + (size.stock || 0), 0)
    }));

    return NextResponse.json({
      products: productsWithTotalStock,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch products: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.categoryId || !data.sizes || data.sizes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate minimum price from sizes
    const price = Math.min(...data.sizes.map((size: any) => size.price));

    // Create new product with sizes
    const product = await prisma.product.create({
      data: {
        name: data.name,
        nickname: data.nickname,
        images: data.images,
        
       
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        price: price,
        oldPrice: data.oldPrice,
        stock: data.stock || 0,
        status: data.status || 'active',
        isLimitedTimeDeal: data.isLimitedTimeDeal || false,
        dealStartTime: data.dealStartTime,
        dealEndTime: data.dealEndTime,
        dealQuantityLimit: data.dealQuantityLimit,
        isBestSeller: data.isBestSeller || false,
        isNewArrival: data.isNewArrival || false,
        weeklySales: data.weeklySales || 0,
        sizes: {
          createMany: {
            data: data.sizes.map(size => ({
              size: size.size,
              description: size.description,
              uniqueFeatures: size.uniqueFeatures,
              productDetails: size.productDetails,
              careInstructions: size.careInstructions,
              deliveryReturns: size.deliveryReturns,
              oldPrice: size.oldPrice,
              price: size.price,
              stock: size.stock,
              isLimitedTimeDeal: size.isLimitedTimeDeal,
              dealStartTime: size.dealStartTime,
              dealEndTime: size.dealEndTime,
              dealQuantityLimit: size.dealQuantityLimit
            }))
          }
        }
      },
      include: {
        category: true,
        subCategory: true,
        sizes: true
      }
    });

    return NextResponse.json({ product, message: "Product created successfully" }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/:id
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const productId = pathSegments[pathSegments.length - 1];

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Update product and its sizes
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        nickname: data.nickname,
        
        
        images: data.images,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        status: data.status,
        oldPrice: data.oldPrice,
        price: data.price,
        stock: data.stock,
        isLimitedTimeDeal: data.isLimitedTimeDeal,
        dealStartTime: data.dealStartTime,
        dealEndTime: data.dealEndTime,
        dealQuantityLimit: data.dealQuantityLimit,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        weeklySales: data.weeklySales,
        sizes: {
          deleteMany: {},
          create: data.sizes.map(size => ({
            size: size.size,
            description: size.description,
            uniqueFeatures: size.uniqueFeatures,
        productDetails: size.productDetails,
        careInstructions: size.careInstructions,
        deliveryReturns: size.deliveryReturns,
            oldPrice: size.oldPrice,
            price: size.price,
            stock: size.stock,
            isLimitedTimeDeal: size.isLimitedTimeDeal,
            dealStartTime: size.dealStartTime,
            dealEndTime: size.dealEndTime,
            dealQuantityLimit: size.dealQuantityLimit
          }))
        }
      },
      include: {
        category: true,
        subCategory: true,
        sizes: true
      }
    });

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = request.url.split('/').pop();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}