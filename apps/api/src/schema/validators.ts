import { z } from 'zod';

export const CreateOrderSchema = z.object({
  productType: z.enum(['premium', 'gift', 'subscription'], {
    errorMap: () => ({ message: "productType must be 'premium', 'gift', or 'subscription'" }),
  }),
  productName: z
    .string()
    .min(1, 'Product name must be at least 1 character')
    .max(100, 'Product name must be at most 100 characters'),
  amount: z
    .number()
    .int('Amount must be an integer')
    .min(100, 'Amount must be at least 100 paise')
    .max(500000, 'Amount must be at most 500,000 paise'),
  email: z.string().email('Invalid email address'),
  metadata: z.string().optional(),
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
  paymentId: z.string().min(1, 'paymentId is required'),
  signature: z.string().min(1, 'signature is required'),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
