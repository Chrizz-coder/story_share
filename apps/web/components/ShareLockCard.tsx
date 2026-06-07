'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createShareOrder,
  verifyPayment,
  mockSetShareUnlocked,
} from '@/lib/paymentService';
import styles from './ShareLockCard.module.css';

interface ShareLockCardProps {
  proposalId: string;
  shareUrl: string;
  onUnlocked: () => void;
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
export default function ShareLockCard({ proposalId, shareUrl, onUnlocked }: ShareLockCardProps) {
  const [stage, setStage] = useState<FlowStage>('LOCKED');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    setStage('PROCESSING');
    setError('');
    try {
      const order = await createShareOrder(proposalId);

      // ── TODO: Replace this block with real Razorpay checkout ────────
      // const { paymentId, signature } = await openRazorpayCheckout(order);
      // const result = await verifyPayment(order.orderId, paymentId, signature, proposalId);
      // ────────────────────────────────────────────────────────────────

      // ── Mock: auto-succeed ──
      const result = await verifyPayment(order.orderId, 'mock_payment_id', 'mock_sig', proposalId);

      if (result.success) {
        mockSetShareUnlocked(proposalId);
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
