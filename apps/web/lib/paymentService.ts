import { getApolloClient } from './apollo-client';
import { CREATE_ORDER, VERIFY_PAYMENT } from '../graphql/landing';
import { UNLOCK_PROPOSAL_SHARING } from '../graphql/proposals';

export interface ShareOrderResult {
  success: boolean;
  order?: any;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export async function createShareOrder(proposalId: string, email: string, template: string = 'romantic'): Promise<ShareOrderResult> {
  try {
    const client = getApolloClient();
    const { data } = await client.mutate({
      mutation: CREATE_ORDER,
      variables: {
        productCategory: 'template_unlock',
        productType: 'template_unlock',
        productName: template,
        amount: 2900,
        email,
        metadata: JSON.stringify({ proposalId }),
      },
    });
    return { success: true, order: data.createOrder };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  proposalId: string
): Promise<PaymentResult> {
  try {
    const client = getApolloClient();
    
    // 1. Verify Razorpay signature
    const { data: verifyData } = await client.mutate({
      mutation: VERIFY_PAYMENT,
      variables: { orderId, paymentId, signature },
    });
    
    if (!verifyData.verifyPayment) {
      return { success: false, error: 'Signature verification failed' };
    }

    // 2. Unlock proposal sharing in DB
    await client.mutate({
      mutation: UNLOCK_PROPOSAL_SHARING,
      variables: { proposalId, orderId },
    });

    return { success: true, paymentId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
