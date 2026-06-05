'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { CREATE_PROPOSAL } from '@/graphql/proposals';
import { useAudio } from '@/context/AudioContext';
import { DEFAULT_TRACKS } from '@/lib/tracks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Gift,
  Coffee,
  Music,
  Play,
  Pause,
  Upload,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  X,
  ExternalLink,
} from 'lucide-react';
import styles from './create.module.css';

interface ProposalForm {
  recipientName: string;
  senderName: string;
  template: 'romantic' | 'marriage' | 'date' | 'birthday' | 'custom';
  customMessage: string;
  theme: 'rose-glow' | 'sunset-gold' | 'midnight-stars' | 'neon-dream';
  music: string;
  photoData?: string;
}

const TEMPLATES = [
  { key: 'romantic' as const, label: 'Romantic', icon: Heart, desc: 'A declaration of deep affection' },
  { key: 'marriage' as const, label: 'Marriage', icon: Sparkles, desc: 'A grand proposal of partnership' },
  { key: 'date' as const, label: 'Date Out', icon: Coffee, desc: 'An invitation to share a moment' },
  { key: 'birthday' as const, label: 'Birthday', icon: Gift, desc: 'A special customized greeting' },
  { key: 'custom' as const, label: 'Custom Card', icon: Music, desc: 'Create a unique message template' },
];

const THEMES = [
  { key: 'rose-glow' as const, label: 'Rose Glow', gradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', textColor: '#ffffff' },
  { key: 'sunset-gold' as const, label: 'Sunset Gold', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', textColor: '#ffffff' },
  { key: 'midnight-stars' as const, label: 'Midnight Stars', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', textColor: '#ffffff' },
  { key: 'neon-dream' as const, label: 'Neon Dream', gradient: 'linear-gradient(135deg, #f107a3 0%, #7b2ff7 100%)', textColor: '#ffffff' },
];

export default function ProposalCreator() {
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentTrack, isPlaying, togglePlay, selectTrack } = useAudio();
  const [createProposal, { loading, error }] = useMutation(CREATE_PROPOSAL);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<ProposalForm>({
    defaultValues: {
      template: 'romantic',
      theme: 'rose-glow',
      music: 'romantic-lofi',
      customMessage: '',
      recipientName: '',
      senderName: '',
    },
    mode: 'onChange',
  });

  const watchAll = watch();

  // Validate step transitions
  const handleNextStep = async () => {
    let fieldsToValidate: ('senderName' | 'recipientName' | 'template' | 'theme' | 'customMessage' | 'music')[] = [];
    if (step === 1) {
      fieldsToValidate = ['senderName', 'recipientName'];
    } else if (step === 2) {
      fieldsToValidate = ['template', 'theme'];
    } else if (step === 3) {
      fieldsToValidate = ['customMessage'];
    } else if (step === 4) {
      fieldsToValidate = ['music'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Image Upload handlers
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Music Selector handlers
  const handlePlayMusic = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (currentTrack.id === trackId) {
      togglePlay();
    } else {
      selectTrack(trackId);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    setValue('music', trackId);
  };

  // Form Submit
  const onSubmit = async (data: ProposalForm) => {
    try {
      const { data: responseData } = await createProposal({
        variables: {
          input: {
            recipientName: data.recipientName,
            senderName: data.senderName,
            template: data.template,
            customMessage: data.customMessage,
            theme: data.theme,
            music: data.music,
            photoData: data.photoData || null,
          },
        },
      });

      if (responseData?.createProposal) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        setShareLink(`${origin}/proposal/${responseData.createProposal.id}`);
        setStep(6);
      }
    } catch (err) {
      console.error('Failed to create proposal:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress Bar Width
  const progressPercent = step === 6 ? 100 : ((step - 1) / 4) * 100;

  return (
    <div className={styles.container}>
      {/* Background blobs */}
      <div className={styles.blobs}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`${styles.blob} animate-float`}
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 2) * 35}%`,
              animationDelay: `${i * 2}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className={styles.wrapper}>
        {step < 6 && (
          <div className={styles.stepperHeader}>
            <span className={styles.stepTitle}>Proposal Creator</span>
            <span className={styles.stepProgress}>Step {step} of 5</span>
          </div>
        )}

        {step < 6 && (
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
          </div>
        )}

        <div className={styles.panel}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AnimatePresence mode="wait">
              {/* STEP 1: Names */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.stepContent}
                >
                  <h2 className={styles.heading}>Tell us who this is for</h2>
                  <p className={styles.subheading}>Fill in the names to personalize the proposal invitation.</p>

                  <div className={styles.field}>
                    <label htmlFor="senderName" className={styles.label}>Your Name (Sender)</label>
                    <input
                      id="senderName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. John Doe"
                      {...register('senderName', { required: 'Your name is required' })}
                    />
                    {errors.senderName && <span className={styles.errorText}>{errors.senderName.message}</span>}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="recipientName" className={styles.label}>Special Someone's Name (Recipient)</label>
                    <input
                      id="recipientName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Jane Smith"
                      {...register('recipientName', { required: 'Recipient name is required' })}
                    />
                    {errors.recipientName && <span className={styles.errorText}>{errors.recipientName.message}</span>}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Templates & Themes */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.stepContent}
                >
                  <h2 className={styles.heading}>Choose Template & Theme</h2>
                  <p className={styles.subheading}>Templates change the message layout, and themes set the visual style.</p>

                  <div className={styles.field}>
                    <label className={styles.label}>Select Card Template</label>
                    <div className={styles.optionsGrid}>
                      {TEMPLATES.map((tmpl) => {
                        const Icon = tmpl.icon;
                        const isActive = watchAll.template === tmpl.key;
                        return (
                          <div
                            key={tmpl.key}
                            className={`${styles.optionCard} ${isActive ? styles.activeCard : ''}`}
                            onClick={() => setValue('template', tmpl.key)}
                          >
                            <div className={styles.optionIcon}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <span className={styles.optionLabel}>{tmpl.label}</span>
                              <p className={styles.optionDesc}>{tmpl.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Select Custom Theme</label>
                    <div className={styles.optionsGrid}>
                      {THEMES.map((theme) => {
                        const isActive = watchAll.theme === theme.key;
                        return (
                          <div
                            key={theme.key}
                            className={`${styles.themeCard} ${isActive ? styles.activeCard : ''}`}
                            onClick={() => setValue('theme', theme.key)}
                          >
                            <div className={styles.themeThumb} style={{ background: theme.gradient }}>
                              <div className={styles.themeGlow} style={{ background: theme.gradient }} />
                            </div>
                            <span className={styles.themeTitle}>{theme.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Message & Picture */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.stepContent}
                >
                  <h2 className={styles.heading}>Write a Custom Message</h2>
                  <p className={styles.subheading}>Express your feelings. You can also upload a memorable photo.</p>

                  <div className={styles.field}>
                    <label htmlFor="customMessage" className={styles.label}>Your Special Message</label>
                    <textarea
                      id="customMessage"
                      className={styles.textarea}
                      placeholder="Write your heart out here... e.g. From the moment I met you, my life became brighter..."
                      {...register('customMessage', {
                        required: 'Please write a message',
                        minLength: { value: 10, message: 'Message should be at least 10 characters' },
                      })}
                    />
                    {errors.customMessage && <span className={styles.errorText}>{errors.customMessage.message}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Add a Polaroid Photo (Optional)</label>
                    <div className={styles.uploadContainer} onClick={() => fileInputRef.current?.click()}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className={styles.uploadInput}
                        onChange={handlePhotoUpload}
                      />
                      {photoPreview ? (
                        <div className={styles.polaroid} onClick={(e) => e.stopPropagation()}>
                          <button className={styles.removeImgBtn} onClick={removePhoto} aria-label="Remove Image">
                            <X size={12} />
                          </button>
                          <img src={photoPreview} alt="Upload Preview" className={styles.polaroidImg} />
                          <span className={styles.polaroidText}>Our Moment ✦</span>
                        </div>
                      ) : (
                        <div className={styles.uploadContent}>
                          <Upload size={32} />
                          <span className={styles.uploadTitle}>Click to upload an image</span>
                          <span className={styles.uploadSub}>Supports JPG, PNG (Max 2MB)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Soundtrack */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.stepContent}
                >
                  <h2 className={styles.heading}>Select Background Music</h2>
                  <p className={styles.subheading}>Choose the soundtrack that will play automatically when they open the link.</p>

                  <div className={styles.musicGrid}>
                    {DEFAULT_TRACKS.map((track) => {
                      const isSelected = watchAll.music === track.id;
                      const isTrackPlaying = isPlaying && currentTrack.id === track.id;

                      return (
                        <div
                          key={track.id}
                          className={`${styles.musicTrack} ${isSelected ? styles.activeMusic : ''}`}
                          onClick={() => handleTrackSelect(track.id)}
                        >
                          <div className={styles.musicLeft}>
                            <button
                              type="button"
                              className={styles.musicPlayBtn}
                              onClick={(e) => handlePlayMusic(e, track.id)}
                              aria-label={isTrackPlaying ? 'Pause preview' : 'Play preview'}
                            >
                              {isTrackPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '1px' }} />}
                            </button>
                            <div className={styles.musicMeta}>
                              <span className={styles.musicTitle}>{track.name}</span>
                              <span className={styles.musicArtist}>{track.artist}</span>
                              <span className={styles.musicTag}>{track.category}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={18} className={styles.playingIndicator} />}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Review & Publish */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.stepContent}
                >
                  <h2 className={styles.heading}>Review & Generate</h2>
                  <p className={styles.subheading}>Double-check how your proposal card will look before publishing.</p>

                  <div className={styles.previewBox}>
                    <div
                      className={styles.previewCard}
                      style={{
                        background: THEMES.find((t) => t.key === watchAll.theme)?.gradient || '#333',
                      }}
                    >
                      <span className={styles.previewBadge}>
                        {TEMPLATES.find((t) => t.key === watchAll.template)?.label} Template
                      </span>
                      <div className={styles.previewNames}>
                        {watchAll.senderName || 'Sender'} ✦ {watchAll.recipientName || 'Recipient'}
                      </div>
                      <p className={styles.previewMessage}>
                        "{watchAll.customMessage || 'Write your beautiful custom message in the previous step...'}"
                      </p>
                      {photoPreview && (
                        <div className={styles.polaroid} style={{ transform: 'none', scale: 0.85 }}>
                          <img src={photoPreview} alt="Polaroid Preview" className={styles.polaroidImg} />
                          <span className={styles.polaroidText}>Our Moment ✦</span>
                        </div>
                      )}
                      <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.85 }}>
                        <Music size={12} />
                        Soundtrack: {DEFAULT_TRACKS.find((t) => t.id === watchAll.music)?.name}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div style={{ color: 'var(--red-500)', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
                      ⚠ Failed to publish: {error.message}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 6: Success published */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={styles.successWrapper}
                >
                  {copied && <div className={styles.toast}>Copied to Clipboard!</div>}

                  <div className={styles.successRing}>
                    <Check size={36} strokeWidth={2.5} />
                  </div>

                  <div>
                    <h2 className={styles.heading}>Your Proposal is Live!</h2>
                    <p className={styles.subheading} style={{ marginTop: '6px' }}>
                      Copy the unique link below and share it with your special someone.
                    </p>
                  </div>

                  <div className={styles.linkBox}>
                    <input
                      type="text"
                      readOnly
                      value={shareLink}
                      className={styles.linkInput}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button type="button" className={styles.btnCopy} onClick={handleCopyLink}>
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>

                  <div className={styles.successActions}>
                    <a
                      href={`/proposal/${shareLink.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnPrimary}
                    >
                      View Proposal <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                    </a>
                    <a href="/" className={styles.btnSecondary}>
                      Back Home
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Buttons */}
            {step < 6 && (
              <div className={styles.actionsRow}>
                {step > 1 ? (
                  <button type="button" className={styles.btnBack} onClick={handlePrevStep}>
                    <ArrowLeft size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button type="button" className={styles.btnNext} onClick={handleNextStep}>
                    Next
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`${styles.btnNext} ${styles.btnFull}`}
                    disabled={loading || !isValid}
                  >
                    {loading ? (
                      <span className={styles.spinner} />
                    ) : (
                      <>
                        Publish Proposal
                        <Sparkles size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
