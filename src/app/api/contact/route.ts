import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate the input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Create email content with HTML formatting
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Contact Form Submission</h1>
          </div>
          <div style="padding: 30px 40px;">
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; margin-bottom: 20px;">
              <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e9ecef;">
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px;">From</p>
                <p style="color: #2c3e50; font-size: 16px; margin: 0;"><strong>${name}</strong></p>
                <p style="color: #2c3e50; font-size: 16px; margin: 5px 0 0;">${email}</p>
              </div>
              ${subject ? `
              <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e9ecef;">
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px;">Subject</p>
                <p style="color: #2c3e50; font-size: 16px; margin: 0;">${subject}</p>
              </div>
              ` : ''}
              <div>
                <p style="color: #6c757d; font-size: 14px; margin: 0 0 5px;">Message</p>
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
            <img src="./images/brand-logo.png" alt="AKX Brand" style="height: 30px; margin-bottom: 10px;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              This email was sent from the contact form on AKX Brand website.
            </p>
          </div>
        </div>
      `
    };

    // Send the email with retry logic
    await sendEmailWithRetry(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}