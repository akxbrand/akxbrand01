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
  const itemsList = data.items
    .map(
      (item) =>
        `${item.name}${item.size ? ` (${item.size})` : ''} x ${item.quantity} - ₹${item.price.toFixed(2)}`
    )
    .join('\n');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: data.customerEmail,
    subject: `Order Confirmation - #${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order!</h2>
        <p>Dear ${data.customerName},</p>
        <p>Your order has been confirmed and is being processed.</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> #${data.orderNumber}</p>
        
        <h4>Items:</h4>
        <pre style="background-color: #f5f5f5; padding: 10px;">${itemsList}</pre>
        
        <p><strong>Total Amount:</strong> ₹${data.total.toFixed(2)}</p>
        
        <h4>Shipping Address:</h4>
        <p>
          ${data.shippingAddress.street}${data.shippingAddress.apartment ? `, ${data.shippingAddress.apartment}` : ''}<br>
          ${data.shippingAddress.city}, ${data.shippingAddress.state}<br>
          ${data.shippingAddress.pincode}
        </p>
        
        ${data.paymentMode ? `<p><strong>Payment Method:</strong> ${data.paymentMode}</p>` : ''}
        
        <p>We will notify you once your order has been shipped.</p>
        
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>Team Himanshi</p>
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