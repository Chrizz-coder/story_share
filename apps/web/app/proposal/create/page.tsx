'use client';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { CREATE_PROPOSAL } from '@/graphql/proposals';
import { useAudio } from '@/context/AudioContext';
import { DEFAULT_TRACKS } from '@/lib/tracks';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Coffee, Gift, Upload, X, Copy, ExternalLink, Check, Music } from 'lucide-react';
import styles from './create.module.css';

interface ProposalForm {
  recipientName: string;
  senderName: string;
  customMessage: string;
  music: string;
  photoData?: string;
}

const PROPOSAL_TYPES = [
  {
    key: 'romantic',
    label: 'Romantic Proposal',
    emoji: '💕',
    desc: 'Ask that special someone',
    icon: Heart,
    available: true,
  },
  {
    key: 'marriage',
    label: 'Marriage',
    emoji: '💍',
    desc: 'A lifetime commitment',
    icon: Sparkles,
    available: false,
  },
  {
    key: 'date',
    label: 'Date Invitation',
    emoji: '☕',
    desc: 'Share a moment together',
    icon: Coffee,
    available: false,
  },
  {
    key: 'birthday',
    label: 'Birthday',
    emoji: '🎂',
    desc: 'A special celebration',
    icon: Gift,
    available: false,
  },
] as const;

const MUSIC_OPTIONS = DEFAULT_TRACKS.slice(0, 4);

export default function ProposalCreator() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState('romantic-lofi');
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentTrack, isPlaying, togglePlay, selectTrack } = useAudio();
  const [createProposal, { loading, error }] = useMutation(CREATE_PROPOSAL);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProposalForm>({
    defaultValues: {
      music: 'romantic-lofi',
      customMessage: '',
      recipientName: '',
      senderName: '',
    },
  });

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

  const handleMusicSelect = (trackId: string) => {
    setSelectedMusic(trackId);
    setValue('music', trackId);
  };

  const handleMusicPreview = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (currentTrack.id === trackId) {
      togglePlay();
    } else {
      selectTrack(trackId);
    }
  };

  const handleComingSoonClick = (label: string) => {
    setShowComingSoon(label);
    setTimeout(() => setShowComingSoon(null), 2500);
  };

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
            music: selectedMusic,
            photoData: data.photoData || null,
          },
        },
      });
      if (res?.createProposal) {
        const id = res.createProposal.id;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setProposalId(id);
        setShareLink(`${origin}/p/${id}`);
      }
    } catch (err) {
      console.error('Failed to create proposal:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'I have a special question for you 💕',
        text: 'Someone has a romantic proposal for you!',
        url: shareLink,
      }).catch(() => {});
    }
  };

  // Hearts for background
  const bgHearts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${8 + i * 7.5}%`,
    top: `${10 + ((i * 37) % 80)}%`,
    size: 14 + (i % 4) * 6,
    delay: i * 1.3,
    duration: 12 + (i % 5) * 3,
  }));

  return (
    <div className={styles.page}>
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

      {/* Coming soon toast */}
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
          {!shareLink ? (
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
                    const Icon = type.icon;
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
                {/* Names Row */}
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

                {/* Personal Message */}
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

                {/* Photo Upload */}
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

                <div className={styles.divider} />

                {/* Music Selector */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Music size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Background Music
                  </label>
                  <div className={styles.musicGrid}>
                    {MUSIC_OPTIONS.map((track) => {
                      const isSelected = selectedMusic === track.id;
                      const isPreviewing = isPlaying && currentTrack.id === track.id;
                      return (
                        <div
                          key={track.id}
                          className={`${styles.musicTile} ${isSelected ? styles.musicTileActive : ''}`}
                          onClick={() => handleMusicSelect(track.id)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleMusicSelect(track.id)}
                        >
                          <button
                            type="button"
                            className={`${styles.previewBtn} ${isPreviewing ? styles.previewBtnPlaying : ''}`}
                            onClick={(e) => handleMusicPreview(e, track.id)}
                            aria-label={isPreviewing ? 'Pause preview' : 'Play preview'}
                          >
                            {isPreviewing ? '⏸' : '▶'}
                          </button>
                          <div className={styles.musicInfo}>
                            <span className={styles.musicName}>{track.category}</span>
                            <span className={styles.musicSub}>{track.name}</span>
                          </div>
                          {isSelected && <Check size={16} className={styles.checkMark} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className={styles.submitError}>
                    ⚠ Failed to create proposal — {error.message}
                  </p>
                )}

                {/* Submit */}
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
          ) : (
            /* ─── Share Panel ─── */
            <motion.div
              key="share"
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
                  Share this link with your special someone
                </p>
              </div>

              <div className={styles.linkRow}>
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className={styles.linkInput}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  aria-label="Share link"
                />
                <button
                  type="button"
                  className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
                  onClick={handleCopyLink}
                  id="copy-share-link-btn"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className={styles.shareActions}>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    className={styles.shareBtn}
                    onClick={handleNativeShare}
                    id="native-share-btn"
                  >
                    📱 Share
                  </button>
                )}
                <a
                  href={`/p/${proposalId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.previewLink}
                  id="preview-proposal-link"
                >
                  <ExternalLink size={15} />
                  Preview
                </a>
              </div>

              <div className={styles.statsRow}>
                <span className={styles.statBadge}>👁 0 views</span>
                <span className={styles.statBadge}>💭 Not yet accepted</span>
              </div>

              <button
                type="button"
                className={styles.anotherBtn}
                onClick={() => {
                  setShareLink('');
                  setProposalId('');
                  setCopied(false);
                }}
              >
                Create another proposal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
