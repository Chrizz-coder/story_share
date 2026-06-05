/* razorpay.ts — browser-side Razorpay SDK loader */

interface RazorpayOrderData {
  id: string;
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  email?: string;
}

interface PaymentData {
  paymentId: string;
  orderId: string;
  signature: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

/** Dynamically loads the Razorpay checkout script */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Not in browser'));
    if (window.Razorpay) return resolve();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

/** Opens Razorpay payment window */
export async function openRazorpayPayment(
  razorpayOrder: RazorpayOrderData,
  onSuccess: (paymentData: PaymentData) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    await loadRazorpayScript();

    const options = {
      key: razorpayOrder.key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      order_id: razorpayOrder.orderId,
      name: 'StoryShare',
      image: '/logo.png',
      description: razorpayOrder.description,
      handler: function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      prefill: {
        email: razorpayOrder.email || '',
      },
      theme: {
        color: '#667eea',
      },
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
