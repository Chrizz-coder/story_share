import nodemailer from 'nodemailer';
import { IOrder } from '../models/Order';

export async function sendPaymentConfirmationEmail(order: IOrder): Promise<void> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_EMAIL || '';
  const pass = process.env.SMTP_PASSWORD || '';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!user || !pass) {
    console.warn('⚠️ SMTP email/password not configured. Skipping payment confirmation email.');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const thankYouLink = `${frontendUrl}/thank-you?orderId=${order.orderId}`;
  // Amount in INR (since amount in DB is in paise)
  const amountInINR = (order.amount / 100).toFixed(2);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2e7d32; text-align: center;">Payment Successful!</h2>
      <p>Thank you for your purchase. Your payment has been successfully processed.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #555;"><strong>Product:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${order.productName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;"><strong>Amount Paid:</strong></td>
          <td style="padding: 8px 0; text-align: right;">₹${amountInINR}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;"><strong>Order ID:</strong></td>
          <td style="padding: 8px 0; text-align: right;"><code>${order.orderId}</code></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;"><strong>Payment ID:</strong></td>
          <td style="padding: 8px 0; text-align: right;"><code>${order.paymentId || 'N/A'}</code></td>
        </tr>
      </table>
      
      <hr style="border: 0; border-top: 1px solid #eee;" />
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${thankYouLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          View Receipt / Thank You Page
        </a>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Store Payments" <${user}>`,
      to: order.email,
      subject: `Payment Confirmation: ${order.productName}`,
      html: htmlContent,
    });
    console.log('✉️ Payment confirmation email sent successfully. MessageId:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error);
    // Don't throw - payment is already successful according to instructions
  }
}
