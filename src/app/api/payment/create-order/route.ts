// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import prisma from '@/lib/prisma';
// import Razorpay from 'razorpay';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { items, shippingAddress, couponDiscount = 0, couponCode } = await req.json();

//     if (!items?.length || !shippingAddress) {
//       return NextResponse.json(
//         { error: 'Missing required order information' },
//         { status: 400 }
//       );
//     }

//     // Validate cart items
//     for (const item of items) {
//       if (!item.productId || !item.quantity || !item.price) {
//         return NextResponse.json(
//           { error: 'Invalid cart item: missing required fields' },
//           { status: 400 }
//         );
//       }

//       // Verify product exists
//       const product = await prisma.product.findUnique({
//         where: { id: item.productId }
//       });

//       if (!product) {
//         return NextResponse.json(
//           { error: `Product not found: ${item.productId}` },
//           { status: 400 }
//         );
//       }
//     }

//     const total = items.reduce(
//       (sum: number, item: any) => sum + item.price * item.quantity,
//       0
//     );

//     const finalAmount = total - couponDiscount;

//     // Create Razorpay order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: Math.round(finalAmount * 100), // Convert to smallest currency unit (paise)
//       currency: 'INR',
//       receipt: `order_${Date.now()}`,
//     });

//     // Validate coupon if provided
//     if (couponCode) {
//       const coupon = await prisma.coupon.findUnique({
//         where: { code: couponCode },
//         include: { usedBy: { where: { userId: session.user.id } } }
//       });

//       if (!coupon) {
//         return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
//       }

//       if (coupon.usedBy.length > 0) {
//         return NextResponse.json({ error: 'Coupon already used by this user' }, { status: 400 });
//       }

//       if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
//         return NextResponse.json({ error: 'Coupon usage limit exceeded' }, { status: 400 });
//       }

//       const now = new Date();
//       if (now < coupon.startDate || now > coupon.endDate) {
//         return NextResponse.json({ error: 'Coupon is not valid at this time' }, { status: 400 });
//       }
//     }

//     // Create order in database
//     try {
//       const order = await prisma.order.create({
//         data: {
//           userId: session.user.id,
//           items: {
//             create: items.map((item: any) => ({
//               productId: item.productId,
//               quantity: item.quantity,
//               price: item.price
//             }))
//           },
//           total: finalAmount,
//           status: 'pending',
//           shippingAddress,
//           paymentId: razorpayOrder.id,
//           paymentStatus: 'pending',
//           paymentMode: 'razorpay',
//           transactionDetails: razorpayOrder,
//           couponCode: couponCode
//         },
//         include: {
//           items: {
//             include: {
//               product: true
//             }
//           }
//         }
//       });
//       return NextResponse.json({
//         orderId: razorpayOrder.id,
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         dbOrderId: order.id
//       });
//     } catch (error: any) {
//       if (error.code === 'P2002' && error.meta?.target?.includes('paymentId')) {
//         return NextResponse.json(
//           { error: 'Order with this payment ID already exists' },
//           { status: 409 }
//         );
//       }
//       throw error;
//     }

//     return NextResponse.json({
//       orderId: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       dbOrderId: order.id
//     });
//   } catch (error: any) {
//     console.error('Error creating order:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to create order' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Razorpay from 'razorpay';

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Function to validate if the productId is a valid MongoDB ObjectId (24 hex characters)
const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

// Function to clean productId (removes non-hexadecimal characters)
const cleanProductId = (productId: string) => productId.replace(/[^a-fA-F0-9]/g, '');

// Main POST request handler for creating the order
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingAddress, couponDiscount = 0, couponCode } = await req.json();

    // Check if required information is present
    if (!items?.length || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Validate cart items and check product existence
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Invalid cart item: missing required fields' },
          { status: 400 }
        );
      }

      // Ensure productId is valid before querying the database
      const cleanedProductId = cleanProductId(item.productId);

      if (!isValidObjectId(cleanedProductId)) {
        return NextResponse.json(
          { error: `Invalid productId format: ${item.productId}` },
          { status: 400 }
        );
      }

      // Verify if the product exists
      const product = await prisma.product.findUnique({
        where: { id: cleanedProductId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    // Calculate the total amount for the order
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const finalAmount = total - couponDiscount;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
        include: { usedBy: { where: { userId: session.user.id } } }
      });

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
      }

      if (coupon.usedBy.length > 0) {
        return NextResponse.json({ error: 'Coupon already used by this user' }, { status: 400 });
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'Coupon usage limit exceeded' }, { status: 400 });
      }

      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        return NextResponse.json({ error: 'Coupon is not valid at this time' }, { status: 400 });
      }
    }

    // Create the order in the database
    try {
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          items: {
            create: items.map((item: any) => ({
              productId: cleanProductId(item.productId), // Clean productId before saving
              quantity: item.quantity,
              price: item.price
            }))
          },
          total: finalAmount,
          status: 'pending',
          shippingAddress,
          paymentId: razorpayOrder.id,
          paymentStatus: 'pending',
          paymentMode: 'razorpay',
          transactionDetails: razorpayOrder,
          couponCode: couponCode
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Respond with the Razorpay order details
      return NextResponse.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        dbOrderId: order.id
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('paymentId')) {
        return NextResponse.json(
          { error: 'Order with this payment ID already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
