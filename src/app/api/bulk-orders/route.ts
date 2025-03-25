import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Create a transporter using Gmail app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      userId,
      companyName,
      contactPerson,
      email,
      phoneNumber,
      deliveryAddress,
      items,
      notes
    } = data;

    // Validate required fields
    if (!userId || !contactPerson || !email || !phoneNumber || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Calculate total quantity
    const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    // Fetch product details for the items
    const productsDetails = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.bulkOrderProduct.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        if (!product) {
          throw new Error(`Product not found with ID: ${item.productId}`);
        }
        return {
          name: product.name,
          quantity: item.quantity
        };
      })
    );

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `New Bulk Order Quote Request - ${companyName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL}/images/brand-logo.png" alt="Company Logo" style="height: 40px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Bulk Order Quote Request</h1>
          </div>
          
          <div style="padding: 35px 40px;">
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #e9ecef;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 25px;">
                <div style="padding-bottom: 15px;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px; text-transform: uppercase;">Company</p>
                  <p style="color: #2c3e50; font-size: 16px; margin: 0; font-weight: 600;">${companyName}</p>
                </div>
                <div style="padding-bottom: 15px;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px; text-transform: uppercase;">Contact Person</p>
                  <p style="color: #2c3e50; font-size: 16px; margin: 0; font-weight: 600;">${contactPerson}</p>
                </div>
                <div style="padding-bottom: 15px;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px; text-transform: uppercase;">Email</p>
                  <p style="color: #2c3e50; font-size: 16px; margin: 0;">${email}</p>
                </div>
                <div style="padding-bottom: 15px;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px; text-transform: uppercase;">Phone</p>
                  <p style="color: #2c3e50; font-size: 16px; margin: 0;">${phoneNumber}</p>
                </div>
              </div>
              
              <div style="margin-bottom: 25px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px; text-transform: uppercase;">Delivery Address</p>
                <p style="color: #2c3e50; font-size: 16px; margin: 0; line-height: 1.6;">${deliveryAddress}</p>
              </div>
              
              ${notes ? `
              <div style="margin-bottom: 25px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px; text-transform: uppercase;">Notes</p>
                <p style="color: #2c3e50; font-size: 16px; margin: 0; line-height: 1.6;">${notes}</p>
              </div>
              ` : ''}
            </div>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; border: 1px solid #e9ecef;">
              <h3 style="color: #1a237e; margin: 0 0 20px; font-size: 18px; font-weight: 600;">Order Details</h3>
              <div style="margin-bottom: 20px;">
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px; text-transform: uppercase;">Total Quantity</p>
                <p style="color: #2c3e50; font-size: 18px; margin: 0; font-weight: 600;">${totalQuantity} units</p>
              </div>
              <div style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 15px; text-transform: uppercase;">Requested Items</p>
                <div style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
                  ${productsDetails.map((item: any, index: number) => `
                    <div style="padding: 15px; ${index !== productsDetails.length - 1 ? 'border-bottom: 1px solid #e9ecef;' : ''}">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #2c3e50; font-weight: 500;">${item.name} </span>
                        <span style="color: #2c3e50; font-weight: 600;">  ${item.quantity} units</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              This email was sent from the Bulk Order form on AKX Brand website.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { 
        message: 'Bulk order quote request submitted successfully'
      },
      { status: 201 }
    );

  } catch (error: any) {
    // console.error('Error processing bulk order:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk order request. Please try again later.' },
      { status: 500 }
    );
  }
}