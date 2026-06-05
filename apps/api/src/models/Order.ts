import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  user?: Types.ObjectId | null;
  email: string;
  amount: number;
  currency: string;
  productType: 'premium' | 'gift' | 'subscription';
  productName: string;
  paymentId?: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  razorpaySignature?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    productType: {
      type: String,
      enum: ['premium', 'gift', 'subscription'],
      required: true,
    },
    productName: { type: String, required: true },
    paymentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    razorpaySignature: { type: String },
    metadata: { type: Schema.Types.Mixed },
    failureReason: { type: String },
  },
  { timestamps: true }
);

// Explicitly define requested indexes
OrderSchema.index({ orderId: 1 }, { unique: true });
OrderSchema.index({ email: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: 1 });

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
