/**
 * lib/paymentService.ts
 *
 * Reusable service structure for Razorpay integration.
 * Currently uses a mock implementation — replace with real API calls later.
 *
 * FUTURE INTEGRATION:
 *   1. createShareOrder()  → POST /api/payments/create-order → Razorpay Order ID
 *   2. verifyPayment()     → POST /api/payments/verify       → unlock share status
 *   3. getShareStatus()    → GET  /api/proposals/:id/share-status
 */

export interface ShareOrder {
  orderId: string;
  amount: number;       // in paise (e.g. 9900 = ₹99)
  currency: string;
  proposalId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/** Creates a Razorpay order for unlocking proposal sharing. */
export async function createShareOrder(proposalId: string): Promise<ShareOrder> {
  // TODO: replace with real API call
  // const res = await fetch('/api/payments/create-order', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ proposalId, productType: 'gift', productName: 'Share Proposal', amount: 9900 }),
  // });
  // return res.json();

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 800));
  return {
    orderId: `mock_order_${Date.now()}`,
    amount: 9900,
    currency: 'INR',
    proposalId,
  };
}

/** Verifies a completed Razorpay payment and unlocks sharing. */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  proposalId: string
): Promise<PaymentResult> {
  // TODO: replace with real API call
  // const res = await fetch('/api/payments/verify', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ orderId, paymentId, signature, proposalId }),
  // });
  // const data = await res.json();
  // return { success: data.success, paymentId };

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, paymentId };
}

/** Checks if sharing has been unlocked for a given proposal. */
export async function getShareStatus(proposalId: string): Promise<boolean> {
  // TODO: replace with real API call
  // const res = await fetch(`/api/proposals/${proposalId}/share-status`);
  // const data = await res.json();
  // return data.shareUnlocked;

  // ── Mock — check localStorage for dev purposes ──
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`share_unlocked_${proposalId}`) === 'true';
}

/** Persists unlock status locally (dev/mock only — remove in production). */
export function mockSetShareUnlocked(proposalId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`share_unlocked_${proposalId}`, 'true');
  }
}
