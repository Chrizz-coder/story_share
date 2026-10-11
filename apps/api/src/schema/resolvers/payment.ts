import { GraphQLError } from 'graphql';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order } from '../../models/Order';
import { CreateOrderSchema, VerifyPaymentSchema } from '../validators';
import { sendPaymentConfirmationEmail } from '../../services/email';
import type { Context } from '../../context';

// Helper to safely get Razorpay client
const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new GraphQLError('Razorpay is not configured on the server.', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const PaymentMutations = {
  async createOrder(
    _: unknown,
    args: {
      productCategory: string;
      productType: string;
      productName: string;
      amount: number;
      email: string;
      metadata?: string;
    },
    ctx: Context
  ) {
    // Validate with Zod
    const validation = CreateOrderSchema.safeParse(args);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      throw new GraphQLError('Validation failed.', {
        extensions: { code: 'BAD_USER_INPUT', errors: fieldErrors },
      });
    }

    const { productCategory, productType, productName, amount, email, metadata } = validation.data;

    const razorpay = getRazorpayClient();

    try {
      // Create Razorpay order
      const rpOrder = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: metadata ? { metadata } : undefined,
      });

      // Parse metadata if present
      let parsedMetadata: Record<string, any> | undefined;
      if (metadata) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch {
          parsedMetadata = { raw: metadata };
        }
      }

      // Save Order doc in MongoDB
      const orderDoc = await Order.create({
        orderId: rpOrder.id,
        user: ctx.viewer ? ctx.viewer._id : null,
        email,
        amount,
        currency: 'INR',
        productCategory,
        productType,
        productName,
        paymentStatus: 'pending',
        metadata: parsedMetadata,
      });

      return {
        id: orderDoc._id.toString(),
        key: process.env.RAZORPAY_KEY_ID!,
        amount,
        currency: 'INR',
        description: productName,
        orderId: rpOrder.id,
      };
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      throw new GraphQLError(error.message || 'Failed to create order.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error },
      });
    }
  },

  async verifyPayment(
    _: unknown,
    args: {
      orderId: string;
      paymentId: string;
      signature: string;
    },
    _ctx: Context
  ) {
    // Validate with Zod
    const validation = VerifyPaymentSchema.safeParse(args);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      throw new GraphQLError('Validation failed.', {
        extensions: { code: 'BAD_USER_INPUT', errors: fieldErrors },
      });
    }

    const { orderId, paymentId, signature } = validation.data;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new GraphQLError('Razorpay is not configured on the server.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }

    // Find Order by orderId
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new GraphQLError('Order not found.', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Reconstruct signature
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    // Compare with provided signature
    if (generatedSignature !== signature) {
      // Update order status to failed
      order.paymentStatus = 'failed';
      order.failureReason = 'Signature mismatch';
      await order.save();

      throw new GraphQLError('Payment signature verification failed.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Update order status to success
    order.paymentId = paymentId;
    order.paymentStatus = 'success';
    order.razorpaySignature = signature;
    await order.save();

    // Send email (don't block the response)
    sendPaymentConfirmationEmail(order).catch((err) => {
      console.error('Deferred error sending payment email:', err);
    });

    return {
      message: 'Payment verified',
      orderId,
      paymentId,
    };
  },
};
