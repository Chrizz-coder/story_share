'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { CREATE_ORDER, VERIFY_PAYMENT } from '@/graphql/landing';
import { openRazorpayPayment } from '@/lib/razorpay';
import styles from './PaymentModal.module.css';

type Plan = 'starter' | 'premium' | 'creator';

const PLAN_CONFIG: Record<Plan, { name: string; amount: number; productCategory: string; productType: string }> = {
  starter:  { name: 'Starter Plan',  amount: 9900,  productCategory: 'plan', productType: 'starter' },
  premium:  { name: 'Premium Plan',  amount: 29900, productCategory: 'plan', productType: 'premium' },
  creator:  { name: 'Creator Plan',  amount: 99900, productCategory: 'plan', productType: 'creator' },
};

interface FormData {
  email: string;
  fullName: string;
  agreeTerms: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
}

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState('');

  const config = PLAN_CONFIG[plan];
  const amountDisplay = `₹${(config.amount / 100).toLocaleString('en-IN')}`;

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormData>({
    mode: 'onChange',
  });

  const [createOrder] = useMutation(CREATE_ORDER);
  const [verifyPayment] = useMutation(VERIFY_PAYMENT);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Create order via GraphQL
      const { data: orderData, errors: orderErrors } = await createOrder({
        variables: {
          productCategory: config.productCategory,
          productType: config.productType,
          productName: config.name,
          amount: config.amount,
          email: data.email,
          metadata: JSON.stringify({ fullName: data.fullName }),
        },
      });

      if (orderErrors?.length) throw new Error(orderErrors[0].message);

      const razorpayOrder = {
        ...orderData.createOrder,
        email: data.email,
      };

      // 2. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        openRazorpayPayment(
          razorpayOrder,
          async (paymentData) => {
            try {
              // 3. Verify payment
              const { data: verifyData, errors: verifyErrors } = await verifyPayment({
                variables: {
                  orderId: paymentData.orderId,
                  paymentId: paymentData.paymentId,
                  signature: paymentData.signature,
                },
              });

              if (verifyErrors?.length) throw new Error(verifyErrors[0].message);

              showToast('🎉 Payment successful! Redirecting...');
              reset();
              onClose();

              setTimeout(() => {
                router.push(`/thank-you?orderId=${verifyData.verifyPayment.orderId}`);
              }, 1200);

              resolve();
            } catch (err) {
              reject(err);
            }
          },
          (err) => {
            if (err.message !== 'Payment cancelled by user') {
              reject(err);
            } else {
              resolve(); // cancelled — don't error
            }
          }
        );
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    setErrorMsg('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Backdrop */}
      <div className={styles.backdrop} onClick={handleClose} />

      {/* Modal */}
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 id="modal-title" className={styles.modalTitle}>Complete Your Purchase</h2>
            <p className={styles.modalSub}>Secure payment powered by Razorpay</p>
          </div>
          <button id="modal-close" className={styles.closeBtn} onClick={handleClose} disabled={submitting} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Plan summary */}
        <div className={styles.planSummary}>
          <div className={styles.planSummaryLeft}>
            <span className={styles.planSummaryIcon}>✦</span>
            <div>
              <p className={styles.planSummaryName}>{config.name}</p>
              <p className={styles.planSummaryTag}>One-time payment</p>
            </div>
          </div>
          <span className={styles.planSummaryPrice}>{amountDisplay}</span>
        </div>

        {/* Form */}
        <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
            />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>Full name</label>
            <input
              id="fullName"
              type="text"
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              placeholder="Your full name"
              {...register('fullName', { required: 'Full name is required' })}
            />
            {errors.fullName && <span className={styles.errorText}>{errors.fullName.message}</span>}
          </div>

          <div className={styles.checkbox}>
            <input
              id="agreeTerms"
              type="checkbox"
              className={styles.checkInput}
              {...register('agreeTerms', { required: true })}
            />
            <label htmlFor="agreeTerms" className={styles.checkLabel}>
              I agree to the <a href="/terms" target="_blank" className={styles.link}>Terms and Conditions</a>
            </label>
          </div>

          {errorMsg && (
            <div className={styles.errorBox}>
              <span>⚠</span> {errorMsg}
            </div>
          )}

          <button
            id="pay-btn"
            type="submit"
            className={styles.payBtn}
            disabled={!isValid || submitting}
          >
            {submitting ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay {amountDisplay}
              </>
            )}
          </button>

          <p className={styles.secureNote}>
            🔒 256-bit SSL encrypted · Secured by Razorpay
          </p>
        </form>
      </div>
    </>
  );
}
