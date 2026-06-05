'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation, gql } from '@apollo/client';
import { compressImage } from '@/lib/utils/image';
import { useAudio } from '@/context/AudioContext';
import styles from './create.module.css';
import { Music, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

const CREATE_PROPOSAL = gql`
  mutation CreateProposal($input: ProposalInput!) {
    createProposal(input: $input) {
      id
    }
  }
`;

type FormValues = {
  recipientName: string;
  senderName: string;
  template: string;
  customMessage: string;
  theme: string;
  music: string;
};

const TEMPLATES = [
  { id: 'romantic', label: 'Will you be my girlfriend?' },
  { id: 'marriage', label: 'Will you marry me?' },
  { id: 'date', label: 'Will you go on a date with me?' },
  { id: 'birthday', label: 'I have something special for you' },
  { id: 'custom', label: 'Custom Question...' },
];

const THEMES = [
  { id: 'purple', label: 'StoryShare Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', button: '#667eea' },
  { id: 'galaxy', label: 'Galaxy', gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)', button: '#5b86e5' },
  { id: 'sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)', button: '#ff7e5f' },
  { id: 'sakura', label: 'Sakura', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', button: '#ff9a9e' },
];

const MUSIC_TRACKS = [
  { id: 'none', label: 'No Music', url: '' },
  { id: 'lofi', label: 'Romantic Lofi', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { id: 'piano', label: 'Soft Piano', url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=romantic-piano-128166.mp3' },
  { id: 'ambient', label: 'Dreamy Ambient', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_d0865ee461.mp3?filename=ambient-piano-amp-strings-10711.mp3' },
  { id: 'acoustic', label: 'Acoustic Guitar', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=happy-day-113985.mp3' },
];

export default function CreateProposalPage() {
  const router = useRouter();
  const { playTrack, pause } = useAudio();
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedLink, setGeneratedLink] = useState('');

  const [createProposal, { loading }] = useMutation(CREATE_PROPOSAL);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      template: 'romantic',
      theme: 'purple',
      music: 'lofi',
    }
  });

  const selectedTemplate = watch('template');
  const selectedTheme = watch('theme');
  const selectedMusic = watch('music');

  const handleMusicChange = (trackId: string) => {
    const track = MUSIC_TRACKS.find(m => m.id === trackId);
    if (track && track.url) {
      playTrack(track.url);
    } else {
      pause();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await compressImage(file, 800, 800);
      setPhotoData(base64);
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Failed to process image. Please try a different one.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    try {
      const result = await createProposal({
        variables: {
          input: {
            ...data,
            photoData
          }
        }
      });
      
      const id = result.data.createProposal.id;
      setGeneratedLink(`${window.location.origin}/p/${id}`);
      setStep(3);
    } catch (err) {
      console.error('Failed to create proposal:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  const currentThemeConfig = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  return (
    <div className={styles.container} style={{ background: currentThemeConfig.gradient }}>
      {step === 3 ? (
        <div className={styles.successCard}>
          <div className={styles.successIconWrapper}>
            <CheckCircle2 size={64} color="#22c55e" />
          </div>
          <h1 className={styles.title}>Your Page is Ready! ✨</h1>
          <p className={styles.subtitle}>Share this link with your special someone.</p>
          
          <div className={styles.linkBox}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Share with them</label>
              <input type="text" readOnly value={generatedLink} className={styles.linkInput} />
            </div>
            <button 
              className={styles.copyBtn}
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert('Share link copied to clipboard!');
              }}
            >
              Copy
            </button>
          </div>

          <div className={styles.linkBox} style={{ marginTop: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Secret Status Link (Keep for yourself)</label>
              <input type="text" readOnly value={`${generatedLink}/status`} className={styles.linkInput} />
            </div>
            <button 
              className={styles.copyBtn}
              style={{ background: '#4b5563' }}
              onClick={() => {
                navigator.clipboard.writeText(`${generatedLink}/status`);
                alert('Status link copied to clipboard!');
              }}
            >
              Copy
            </button>
          </div>

          <button 
            className={styles.previewBtn}
            style={{ marginTop: '24px' }}
            onClick={() => window.open(generatedLink, '_blank')}
          >
            Preview Page
          </button>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconBox}><Sparkles color="#ff758c" /></div>
            <h1 className={styles.title}>Make them say YES!</h1>
            <p className={styles.subtitle}>Create a personalized page they literally can't say no to 💖</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {step === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.inputGroup}>
                  <label>Their Name</label>
                  <input 
                    {...register('recipientName', { required: 'Recipient name is required' })} 
                    placeholder="Who is this for?" 
                    className={errors.recipientName ? styles.inputError : ''}
                  />
                  {errors.recipientName && <span className={styles.errorText}>{errors.recipientName.message}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Your Name</label>
                  <input 
                    {...register('senderName', { required: 'Your name is required' })} 
                    placeholder="Who is it from?" 
                    className={errors.senderName ? styles.inputError : ''}
                  />
                  {errors.senderName && <span className={styles.errorText}>{errors.senderName.message}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Pick Your Question</label>
                  <div className={styles.optionsList}>
                    {TEMPLATES.map(t => (
                      <label key={t.id} className={`${styles.optionCard} ${selectedTemplate === t.id ? styles.selected : ''}`}>
                        <input type="radio" value={t.id} {...register('template')} />
                        <span className={styles.radioCustom}></span>
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Your Message (Shown after they say YES)</label>
                  <textarea 
                    {...register('customMessage', { required: 'Message is required' })} 
                    placeholder="e.g. You're the most beautiful person I know. I love you endlessly. 💕"
                    rows={4}
                    className={errors.customMessage ? styles.inputError : ''}
                  ></textarea>
                  {errors.customMessage && <span className={styles.errorText}>{errors.customMessage.message}</span>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.inputGroup}>
                  <label>Select Theme</label>
                  <div className={styles.themeGrid}>
                    {THEMES.map(t => (
                      <label key={t.id} className={`${styles.themeCard} ${selectedTheme === t.id ? styles.selected : ''}`}>
                        <input type="radio" value={t.id} {...register('theme')} />
                        <div className={styles.themePreview} style={{ background: t.gradient }}></div>
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Background Music</label>
                  <Controller
                    name="music"
                    control={control}
                    render={({ field }) => (
                      <div className={styles.optionsList}>
                        {MUSIC_TRACKS.map(m => (
                          <label 
                            key={m.id} 
                            className={`${styles.optionCard} ${field.value === m.id ? styles.selected : ''}`}
                          >
                            <input 
                              type="radio" 
                              value={m.id} 
                              onChange={(e) => {
                                field.onChange(e);
                                handleMusicChange(e.target.value);
                              }}
                              checked={field.value === m.id}
                            />
                            <Music size={16} color={field.value === m.id ? '#ff758c' : '#9ca3af'} />
                            {m.label}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Optional Photo (Shown with the final message)</label>
                  <label className={styles.photoUploadArea}>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className={styles.hiddenInput} />
                    {photoData ? (
                      <img src={photoData} alt="Preview" className={styles.photoPreview} />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <ImageIcon size={32} color="#9ca3af" />
                        <span>{isUploading ? 'Processing...' : 'Click to upload a cute photo'}</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className={styles.footerActions}>
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className={styles.backBtn}>
                  Back
                </button>
              )}
              <button 
                type="submit" 
                className={styles.primaryBtn} 
                disabled={loading || isUploading}
                style={{ background: currentThemeConfig.button, width: step === 1 ? '100%' : 'auto', flex: 1 }}
              >
                {step === 1 ? 'Next: Customize Design ✨' : (loading ? 'Generating Link...' : 'Generate Shareable Link 💖')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
