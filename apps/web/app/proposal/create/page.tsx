'use client';
import React, { useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { CREATE_PROPOSAL } from '@/graphql/proposals';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Coffee, Gift,
  Upload, X, ExternalLink, Check, Image as ImageIcon
} from 'lucide-react';
import HomeButton from '@/components/HomeButton';
import ShareLockCard from '@/components/ShareLockCard';
import Footer from '@/components/Footer';
import styles from './create.module.css';

interface ProposalForm {
  recipientName: string;
  senderName: string;
  customMessage: string;
  age?: number;
  nickname?: string;
  photoData?: string;
}

const PROPOSAL_TYPES = [
  { key: 'romantic', label: 'Romantic Proposal', emoji: '💕', available: true },
  { key: 'birthday', label: 'Birthday', emoji: '🎂', available: true, badge: 'New' },
  { key: 'marriage', label: 'Marriage', emoji: '💍', available: false },
  { key: 'date', label: 'Date Invitation', emoji: '☕', available: false },
] as const;

export default function ProposalCreator() {
  const { data: session } = useSession();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareUnlocked, setShareUnlocked] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'romantic' | 'birthday'>('romantic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createProposal, { loading, error }] = useMutation(CREATE_PROPOSAL);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProposalForm>({
    defaultValues: { customMessage: '', recipientName: '', senderName: '', age: undefined, nickname: '' },
  });

  // Watch fields for live preview
  const liveRecipientName = useWatch({ control, name: 'recipientName' });
  const liveSenderName = useWatch({ control, name: 'senderName' });
  const liveMessage = useWatch({ control, name: 'customMessage' });
  const liveAge = useWatch({ control, name: 'age' });
  const liveNickname = useWatch({ control, name: 'nickname' });

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
            template: selectedTemplate,
            customMessage: data.customMessage || '',
            age: data.age ? Number(data.age) : null,
            nickname: data.nickname || null,
            theme: selectedTemplate === 'birthday' ? 'birthday' : 'rose-glow',
            music: selectedTemplate,
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
          title: selectedTemplate === 'birthday' ? 'Happy Birthday! 🎂' : 'I have a special question for you 💕',
          text: selectedTemplate === 'birthday' ? 'Someone sent you a birthday surprise!' : 'Someone has a romantic proposal for you!',
          url: shareUrl,
        });
      } catch (e) {
        // user aborted or failed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Background elements
  const bgElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${8 + i * 6}%`,
    top: `${10 + ((i * 37) % 80)}%`,
    size: 14 + (i % 4) * 6,
    delay: i * 0.5,
    duration: 12 + (i % 5) * 3,
  }));

  const isBirthday = selectedTemplate === 'birthday';

  return (
    <>
    <div className={`${styles.page} ${isBirthday ? styles.pageBirthday : 'light-bg'}`}>
      <HomeButton />

      {/* Dynamic Background */}
      <div className={isBirthday ? styles.bgBalloons : styles.bgHearts} aria-hidden>
        {bgElements.map((el) => (
          <div
            key={el.id}
            className={isBirthday ? styles.bgBalloon : styles.bgHeart}
            style={{
              left: el.left,
              top: isBirthday ? undefined : el.top,
              width: isBirthday ? undefined : el.size,
              height: isBirthday ? undefined : el.size,
              fontSize: isBirthday ? el.size + 10 : undefined,
              animationDelay: `${el.delay}s`,
              animationDuration: `${el.duration}s`,
            }}
          >
            {isBirthday ? ['🎈', '✨', '🎈', '🎈'][el.id % 4] : ''}
          </div>
        ))}
      </div>

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
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.headerIcon}>
            {isBirthday ? <Gift size={28} fill="currentColor" /> : <Heart size={28} fill="currentColor" />}
          </div>
          <h1 className={styles.headerTitle}>
            {isBirthday ? 'Create a Birthday Surprise 🎂' : 'Create a Proposal'}
          </h1>
          <p className={styles.headerSub}>
            {isBirthday ? 'Create a memorable birthday experience for someone special.' : 'Make someone\'s heart skip a beat 💕'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
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
                      const isActive = selectedTemplate === type.key;
                      return (
                        <div 
                          key={type.key} 
                          className={`${styles.typeTile} ${isActive ? styles.typeTileActive : ''}`}
                          onClick={() => setSelectedTemplate(type.key as 'romantic' | 'birthday')}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className={styles.typeEmoji}>{type.emoji}</span>
                          <span className={styles.typeLabel}>{type.label}</span>
                          {isActive && <div className={styles.activePill}>Selected ✓</div>}
                          {('badge' in type) && type.badge && !isActive && (
                            <div className={styles.comingSoonPill} style={{ background: '#8b6be8', color: 'white', opacity: 1 }}>
                              {type.badge}
                            </div>
                          )}
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

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* ── BIRTHDAY FIELDS ── */}
                {isBirthday ? (
                  <>
                    <div className={styles.namesRow}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="recipientName">
                          Birthday Person Name <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="recipientName"
                          type="text"
                          className={`${styles.input} ${errors.recipientName ? styles.inputError : ''}`}
                          placeholder="e.g. Sarah"
                          {...register('recipientName', { required: 'Name is required' })}
                        />
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
                          {...register('senderName', { required: 'Name is required' })}
                        />
                      </div>
                    </div>

                    <div className={styles.namesRow} style={{ marginTop: 16 }}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="age">
                          Age <span className={styles.optional}>(Optional)</span>
                        </label>
                        <input
                          id="age"
                          type="number"
                          className={styles.input}
                          placeholder="e.g. 21"
                          {...register('age', { valueAsNumber: true })}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="nickname">
                          Nickname <span className={styles.optional}>(Optional)</span>
                        </label>
                        <input
                          id="nickname"
                          type="text"
                          className={styles.input}
                          placeholder="e.g. Princess"
                          {...register('nickname')}
                        />
                      </div>
                    </div>

                    <div className={styles.field} style={{ marginTop: 16 }}>
                      <label className={styles.label} htmlFor="customMessage">
                        Birthday Message <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        id="customMessage"
                        className={styles.textarea}
                        placeholder="Happy Birthday Sarah! Wishing you happiness, success and lots of amazing memories. Enjoy your special day! 🎂✨"
                        rows={4}
                        {...register('customMessage', { required: 'Message is required' })}
                      />
                    </div>
                  </>
                ) : (
                  /* ── ROMANTIC FIELDS ── */
                  <>
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
                      </div>
                    </div>

                    <div className={styles.field} style={{ marginTop: 16 }}>
                      <label className={styles.label} htmlFor="customMessage">
                        Personal Message <span className={styles.optional}>(shown after they say Yes)</span>
                      </label>
                      <textarea
                        id="customMessage"
                        className={styles.textarea}
                        placeholder="e.g. You're the most amazing person I know. I love you endlessly. 🌹"
                        rows={3}
                        {...register('customMessage')}
                      />
                    </div>
                  </>
                )}

                <div className={styles.divider} />

                {/* ── PHOTO UPLOAD ── */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    {isBirthday ? 'Add a Birthday Photo' : 'Photo'} <span className={styles.optional}>
                      {isBirthday ? '(shown in Birthday Card)' : '(optional — shown after Yes)'}
                    </span>
                  </label>
                  <div
                    className={`${styles.uploadZone} ${photoPreview ? styles.uploadZoneHasPhoto : ''}`}
                    onClick={() => !photoPreview && fileInputRef.current?.click()}
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
                        <button type="button" className={styles.removePhotoBtn} onClick={removePhoto}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPrompt}>
                        {isBirthday ? <Gift size={22} className={styles.uploadIcon} /> : <Upload size={22} className={styles.uploadIcon} />}
                        <span className={styles.uploadTitle}>{isBirthday ? 'Upload a birthday photo' : 'Upload a photo'}</span>
                        <span className={styles.uploadSub}>JPG, PNG — max 2MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <p className={styles.submitError}>⚠ Failed to create — {error.message}</p>
                )}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : (
                    <>{isBirthday ? <Gift size={18} /> : <Sparkles size={18} />}{isBirthday ? 'Generate Birthday Surprise' : 'Generate My Proposal'}</>
                  )}
                </button>
              </form>

              {/* ── LIVE PREVIEW CARD (BIRTHDAY ONLY) ── */}
              {isBirthday && (liveRecipientName || liveMessage || liveSenderName || photoPreview) && (
                <motion.div 
                  className={styles.livePreviewWrapper}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className={styles.livePreviewCard}>
                    {liveAge && !isNaN(Number(liveAge)) && (
                      <div className={styles.previewAgeBadge}>Turning {liveAge}!</div>
                    )}
                    <div className={styles.previewHeader}>
                      🎉 Happy Birthday {liveNickname ? `"${liveNickname}"` : (liveRecipientName || 'Sarah')} 🎂
                    </div>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Live Preview" className={styles.previewPhoto} />
                    ) : (
                      <div className={styles.previewPhoto} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a792d4' }}>
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className={styles.previewMessage}>
                      {liveMessage || 'Wishing you a year full of happiness and success. 🎂✨'}
                    </div>
                    <div className={styles.previewSender}>
                      From {liveSenderName || 'Alex'} ❤️
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── GENERATED PANEL ── */}
          {proposalId && (
            <motion.div
              key="generated"
              className={styles.shareCard}
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <div className={styles.shareSuccess}>
                <div className={styles.successRing}>
                  <Check size={32} strokeWidth={2.5} />
                </div>
                <h2 className={styles.shareTitle}>
                  {isBirthday ? '🎉 Birthday Surprise Ready' : 'Your Proposal is Ready! 🎉'}
                </h2>
                <p className={styles.shareSub}>
                  Preview it first, then unlock sharing to send to your special someone.
                </p>
              </div>

              <a href={`/p/${proposalId}`} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                <ExternalLink size={15} /> Preview {isBirthday ? 'Surprise' : 'Proposal'}
              </a>

              {!shareUnlocked ? (
                <ShareLockCard
                  proposalId={proposalId}
                  shareUrl={shareUrl}
                  onUnlocked={() => setShareUnlocked(true)}
                  userEmail={session?.user?.email ?? undefined}
                  template={selectedTemplate}
                />
              ) : (
                <motion.div className={styles.unlockedShare} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className={styles.unlockedLabel}>✅ Sharing unlocked! Send it now:</p>
                  <div className={styles.shareActions}>
                    <button type="button" className={styles.shareBtn} onClick={handleShare}>📱 Share Link</button>
                  </div>
                </motion.div>
              )}

              <button type="button" className={styles.anotherBtn} onClick={() => { setProposalId(''); setShareUrl(''); setShareUnlocked(false); }}>
                Create another {isBirthday ? 'surprise' : 'proposal'}
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
