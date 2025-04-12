import nodemailer from 'nodemailer';

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

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to send email with retry logic
async function sendEmailWithRetry(mailOptions: any, retryCount = 0): Promise<void> {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error(`Attempt ${retryCount + 1} failed:`, error.message);
    
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY);
      return sendEmailWithRetry(mailOptions, retryCount + 1);
    }
    throw error;
  }
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string; // Add productName to the OrderEmailData interface
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
  total: number;
  shippingAddress: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMode?: string;
}

export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  const itemsList = `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Size</th>
          <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item, index) => `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
            <td style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">${item.name || 'N/A'}</td>
            <td style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">${item.size || 'N/A'}</td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: data.customerEmail,
    subject: `Order Confirmation - #${data.orderNumber}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <img src="https://akxbrand.com/images/brand-logo.png" alt="AKX Brand" style="height: 60px; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Order Confirmation</h1>
        </div>

        <div style="padding: 30px 40px;">
          <p style="color: #2c3e50; font-size: 18px; margin: 0 0 20px;">Dear ${data.customerName},</p>
          <p style="color: #2c3e50; font-size: 16px; margin: 0 0 30px;">Thank you for your order! We're excited to confirm that your order has been received and is being processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; margin-bottom: 30px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin: 0 0 20px;">Order Details</h2>
            <p style="color: #2c3e50; font-size: 16px; margin: 0 0 15px;"><strong>Order Number:</strong> #${data.orderNumber}</p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 4px; margin: 20px 0; overflow-x: auto;">
              <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px;">Order Items</h3>
              ${itemsList}
            </div>
            
            <p style="color: #2c3e50; font-size: 18px; margin: 20px 0;"><strong>Total Amount:</strong> ₹${data.total.toFixed(2)}</p>
            
            <div style="margin-top: 25px;">
              <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px;">Shipping Address</h3>
              <p style="color: #2c3e50; font-size: 15px; line-height: 1.6; margin: 0;">
                ${data.shippingAddress.street}${data.shippingAddress.apartment ? `, ${data.shippingAddress.apartment}` : ''}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.state}<br>
                ${data.shippingAddress.pincode}
              </p>
            </div>
            
            ${data.paymentMode ? `
            <div style="margin-top: 25px;">
              <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px;">Payment Method</h3>
              <p style="color: #2c3e50; font-size: 15px; margin: 0;">${data.paymentMode}</p>
            </div>` : ''}
          </div>
          
          <p style="color: #2c3e50; font-size: 16px; margin: 0 0 20px;">We will notify you once your order has been shipped. If you have any questions about your order, please don't hesitate to contact us.</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
          <p style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 0 0 15px;">Team AKX Brand</p>
          <div style="margin-bottom: 20px;">
            <a href="mailto:akxbrand@gmail.com" style="color: #3498db; text-decoration: none;">akxbrand@gmail.com</a><br>
            <p style="color: #6c757d; margin: 5px 0;">Phone: +91 9034366104</p>
            <p style="color: #6c757d; margin: 5px 0;">AKX Brand, Matta Chowk, Panipat, Haryana, PinCode - 132103</p>
          </div>
          <a href="https://akxbrand.com" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500;">Visit our website</a>
        </div>
      </div>
    `,
  };

  try {
    console.log('Attempting to send order confirmation email to:', data.customerEmail);
    await sendEmailWithRetry(mailOptions);
    console.log('Order confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error(`Failed to send order confirmation email: ${error.message}`);
  }
};