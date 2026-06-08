'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createShareOrder,
  verifyPayment,
} from '@/lib/paymentService';
import styles from './ShareLockCard.module.css';

interface ShareLockCardProps {
  proposalId: string;
  shareUrl: string;
  onUnlocked: () => void;
  userEmail?: string;
  template?: string;
}

type FlowStage = 'LOCKED' | 'PROCESSING' | 'SUCCESS';

/**
 * ShareLockCard
 *
 * Monetization gate for proposal sharing.
 * Shows the "Unlock Sharing" CTA → Payment Modal → Success.
 *
 * Currently uses mock payment. To enable real Razorpay:
 *   1. Replace mock logic in lib/paymentService.ts
 *   2. Load Razorpay script and pass orderId to Razorpay checkout
 */
export default function ShareLockCard({ proposalId, shareUrl, onUnlocked, userEmail, template }: ShareLockCardProps) {
  const [stage, setStage] = useState<FlowStage>('LOCKED');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    if (!userEmail) {
      setError('Please sign in to unlock sharing.');
      return;
    }

    setStage('PROCESSING');
    setError('');
    try {
      // 1. Create Order
      const orderResult = await createShareOrder(proposalId, userEmail, template);
      if (!orderResult.success || !orderResult.order) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // 2. Open Razorpay Checkout
      const { paymentId, signature } = await new Promise<{ paymentId: string; signature: string }>((resolve, reject) => {
        // Assume openRazorpayPayment exists in lib/paymentService and it handles the popup
        import('@/lib/razorpay').then(({ openRazorpayPayment }) => {
          openRazorpayPayment(
            orderResult.order,
            (paymentData) => resolve({ paymentId: paymentData.paymentId, signature: paymentData.signature }),
            (err) => reject(err)
          );
        }).catch(err => reject(err));
      });

      // 3. Verify Payment
      const verifyResult = await verifyPayment(orderResult.order.orderId, paymentId, signature, proposalId);

      if (verifyResult.success) {
        setStage('SUCCESS');
        setTimeout(onUnlocked, 1400);
      } else {
        setError('Payment verification failed. Please try again.');
        setStage('LOCKED');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
      setStage('LOCKED');
    }
  };

  return (
    <div className={styles.wrapper}>
      <AnimatePresence mode="wait">
        {stage === 'LOCKED' && (
          <motion.div
            key="locked"
            className={styles.card}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className={styles.lockIcon}>🔒</div>
            <h3 className={styles.title}>Share Your Proposal</h3>
            <p className={styles.desc}>
              Unlock sharing to send your proposal to your special someone.
            </p>
            {error && <p className={styles.error}>{error}</p>}
            <button
              className={styles.unlockBtn}
              onClick={handleUnlock}
              id="unlock-sharing-btn"
            >
              ✨ Unlock Sharing
            </button>
          </motion.div>
        )}

        {stage === 'PROCESSING' && (
          <motion.div
            key="processing"
            className={`${styles.card} ${styles.cardCenter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.spinner} />
            <p className={styles.processingText}>Processing payment…</p>
          </motion.div>
        )}

        {stage === 'SUCCESS' && (
          <motion.div
            key="success"
            className={`${styles.card} ${styles.cardCenter}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <div className={styles.successIcon}>🎉</div>
            <p className={styles.successText}>Payment successful! Unlocking share options…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
