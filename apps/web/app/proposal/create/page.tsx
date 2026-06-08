'use client';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { CREATE_PROPOSAL } from '@/graphql/proposals';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Coffee, Gift,
  Upload, X, ExternalLink, Check,
} from 'lucide-react';
import HomeButton from '@/components/HomeButton';
import ShareLockCard from '@/components/ShareLockCard';
import Footer from '@/components/Footer';
import styles from './create.module.css';

interface ProposalForm {
  recipientName: string;
  senderName: string;
  customMessage: string;
  photoData?: string;
}

const PROPOSAL_TYPES = [
  {
    key: 'romantic',
    label: 'Romantic Proposal',
    emoji: '💕',
    available: true,
  },
  {
    key: 'marriage',
    label: 'Marriage',
    emoji: '💍',
    available: false,
  },
  {
    key: 'date',
    label: 'Date Invitation',
    emoji: '☕',
    available: false,
  },
  {
    key: 'birthday',
    label: 'Birthday',
    emoji: '🎂',
    available: false,
  },
] as const;

export default function ProposalCreator() {
  const { data: session } = useSession();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareUnlocked, setShareUnlocked] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createProposal, { loading, error }] = useMutation(CREATE_PROPOSAL);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProposalForm>({
    defaultValues: { customMessage: '', recipientName: '', senderName: '' },
  });

  // ── Photo upload ─────────────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue('photoData', result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview(null);
    setValue('photoData', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleComingSoonClick = (label: string) => {
    setShowComingSoon(label);
    setTimeout(() => setShowComingSoon(null), 2500);
  };

  // ── Form submit ──────────────────────────────────────────────────────
  const onSubmit = async (data: ProposalForm) => {
    try {
      const { data: res } = await createProposal({
        variables: {
          input: {
            recipientName: data.recipientName,
            senderName: data.senderName,
            template: 'romantic',
            customMessage: data.customMessage || '',
            theme: 'rose-glow',
            music: 'romantic', // category key — viewer loads /music/romantic.mp3 automatically
            photoData: data.photoData || null,
          },
        },
      });
      if (res?.createProposal) {
        const id = res.createProposal.id;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setProposalId(id);
        setShareUrl(`${origin}/p/${id}`);
      }
    } catch (err) {
      console.error('Failed to create proposal:', err);
    }
  };

  const [showToast, setShowToast] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'I have a special question for you 💕',
          text: 'Someone has a romantic proposal for you!',
          url: shareUrl,
        });
      } catch (e) {
        // user aborted or failed
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // ── Background hearts ────────────────────────────────────────────────
  const bgHearts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${8 + i * 7.5}%`,
    top: `${10 + ((i * 37) % 80)}%`,
    size: 14 + (i % 4) * 6,
    delay: i * 1.3,
    duration: 12 + (i % 5) * 3,
  }));

  return (
    <>
    <div className={`${styles.page} light-bg`}>
      {/* ── Fixed Home Button ── */}
      <HomeButton />

      {/* Background hearts */}
      <div className={styles.bgHearts} aria-hidden>
        {bgHearts.map((h) => (
          <div
            key={h.id}
            className={styles.bgHeart}
            style={{
              left: h.left,
              top: h.top,
              width: h.size,
              height: h.size,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Coming soon & Copied toast */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            className={styles.comingSoonToast}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            🚀 {showComingSoon} is coming soon!
          </motion.div>
        )}
        {showToast && (
          <motion.div
            className={styles.comingSoonToast}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            Link copied successfully ❤️
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.headerIcon}>
            <Heart size={28} fill="currentColor" />
          </div>
          <h1 className={styles.headerTitle}>Create a Proposal</h1>
          <p className={styles.headerSub}>Make someone&apos;s heart skip a beat 💕</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── FORM ── */}
          {!proposalId && (
            <motion.div
              key="form"
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ duration: 0.4 }}
            >
              {/* Type Selector */}
              <div className={styles.typeSection}>
                <p className={styles.sectionLabel}>Choose Type</p>
                <div className={styles.typeGrid}>
                  {PROPOSAL_TYPES.map((type) => {
                    if (type.available) {
                      return (
                        <div key={type.key} className={`${styles.typeTile} ${styles.typeTileActive}`}>
                          <span className={styles.typeEmoji}>{type.emoji}</span>
                          <span className={styles.typeLabel}>{type.label}</span>
                          <div className={styles.activePill}>Selected ✓</div>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={type.key}
                        type="button"
                        className={`${styles.typeTile} ${styles.typeTileDisabled}`}
                        onClick={() => handleComingSoonClick(type.label)}
                      >
                        <span className={styles.typeEmoji}>{type.emoji}</span>
                        <span className={styles.typeLabel}>{type.label}</span>
                        <div className={styles.comingSoonPill}>Coming Soon</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className={styles.namesRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="recipientName">
                      Their Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="recipientName"
                      type="text"
                      className={`${styles.input} ${errors.recipientName ? styles.inputError : ''}`}
                      placeholder="e.g. Sarah"
                      {...register('recipientName', { required: 'Recipient name is required' })}
                    />
                    {errors.recipientName && (
                      <span className={styles.errorText}>{errors.recipientName.message}</span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="senderName">
                      Your Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="senderName"
                      type="text"
                      className={`${styles.input} ${errors.senderName ? styles.inputError : ''}`}
                      placeholder="e.g. Alex"
                      {...register('senderName', { required: 'Your name is required' })}
                    />
                    {errors.senderName && (
                      <span className={styles.errorText}>{errors.senderName.message}</span>
                    )}
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="customMessage">
                    Personal Message{' '}
                    <span className={styles.optional}>(shown after they say Yes)</span>
                  </label>
                  <textarea
                    id="customMessage"
                    className={styles.textarea}
                    placeholder="e.g. You're the most amazing person I know. I love you endlessly. 🌹"
                    rows={3}
                    {...register('customMessage')}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Photo{' '}
                    <span className={styles.optional}>(optional — shown after Yes)</span>
                  </label>
                  <div
                    className={`${styles.uploadZone} ${photoPreview ? styles.uploadZoneHasPhoto : ''}`}
                    onClick={() => !photoPreview && fileInputRef.current?.click()}
                    role={photoPreview ? undefined : 'button'}
                    tabIndex={photoPreview ? undefined : 0}
                    onKeyDown={(e) => e.key === 'Enter' && !photoPreview && fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={handlePhotoUpload}
                    />
                    {photoPreview ? (
                      <div className={styles.photoPreview} onClick={(e) => e.stopPropagation()}>
                        <img src={photoPreview} alt="Preview" className={styles.previewImg} />
                        <button
                          type="button"
                          className={styles.removePhotoBtn}
                          onClick={removePhoto}
                          aria-label="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPrompt}>
                        <Upload size={22} className={styles.uploadIcon} />
                        <span className={styles.uploadTitle}>Upload a photo</span>
                        <span className={styles.uploadSub}>JPG, PNG — max 2MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <p className={styles.submitError}>
                    ⚠ Failed to create proposal — {error.message}
                  </p>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                  id="generate-proposal-btn"
                >
                  {loading ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate My Proposal
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── GENERATED PANEL ── */}
          {proposalId && (
            <motion.div
              key="generated"
              className={styles.shareCard}
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
            >
              <div className={styles.shareSuccess}>
                <div className={styles.successRing}>
                  <Check size={32} strokeWidth={2.5} />
                </div>
                <h2 className={styles.shareTitle}>Your Proposal is Ready! 🎉</h2>
                <p className={styles.shareSub}>
                  Preview it first, then unlock sharing to send to your special someone.
                </p>
              </div>

              {/* Preview button — always visible */}
              <a
                href={`/p/${proposalId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.previewLink}
                id="preview-proposal-link"
              >
                <ExternalLink size={15} />
                Preview Proposal
              </a>

              {/* Share Gate */}
              {!shareUnlocked ? (
                <ShareLockCard
                  proposalId={proposalId}
                  shareUrl={shareUrl}
                  onUnlocked={() => setShareUnlocked(true)}
                  userEmail={session?.user?.email ?? undefined}
                  template="romantic"
                />
              ) : (
                /* ── Share Actions (unlocked) ── */
                <motion.div
                  className={styles.unlockedShare}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0.3 }}
                >
                  <p className={styles.unlockedLabel}>✅ Sharing unlocked! Send it now:</p>
                  <div className={styles.shareActions}>
                    <button
                      type="button"
                      className={styles.shareBtn}
                      onClick={handleShare}
                      id="universal-share-btn"
                    >
                      📱 Share Proposal
                    </button>
                  </div>
                </motion.div>
              )}

              <button
                type="button"
                className={styles.anotherBtn}
                onClick={() => {
                  setProposalId('');
                  setShareUrl('');
                  setShareUnlocked(false);
                }}
              >
                Create another proposal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    <Footer />
    </>
  );
}
