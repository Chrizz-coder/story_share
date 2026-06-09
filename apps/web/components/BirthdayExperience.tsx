'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAudio } from '@/context/AudioContext';
import HomeButton from '@/components/HomeButton';
import Footer from '@/components/Footer';
import styles from './BirthdayExperience.module.css';

type Stage = 'INTRO' | 'GIFT_OPENING' | 'REVEAL';
type GiftAnim = 'IDLE' | 'WIGGLE' | 'GLOW' | 'PULSE' | 'EXPLODE' | 'DONE';

export default function BirthdayExperience({ proposal }: { proposal: any }) {
  const [stage, setStage] = useState<Stage>('INTRO');
  const [giftAnim, setGiftAnim] = useState<GiftAnim>('IDLE');
  const { playTrack } = useAudio();

  // Ambient particles
  const ambientBalloons = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${10 + (i * 11)}%`,
    delay: i * 1.5,
    duration: 15 + (i % 3) * 5,
    emoji: ['🎈', '🎂', '✨', '🎈'][i % 4]
  }));

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: 1 + Math.random() * 2,
    delay: Math.random() * 2
  }));

  // Auto-play music on mount (browser permitting)
  useEffect(() => {
    // We try to autoplay. If it fails due to browser policy, 
    // it will definitely play when they click "Open My Gift".
    playTrack('/music/birthday.mp3', { volume: 0.5, loop: true });
  }, [playTrack]);

  const runGiftSequence = () => {
    // Ensure music is playing
    playTrack('/music/birthday.mp3', { volume: 0.5, loop: true });
    
    setStage('GIFT_OPENING');
    
    // 1. Shake / Wiggle
    setGiftAnim('WIGGLE');
    
    // 2. Glow
    setTimeout(() => {
      setGiftAnim('GLOW');
    }, 800);
    
    // 3. Countdown Pulse
    setTimeout(() => {
      setGiftAnim('PULSE');
    }, 1600);
    
    // 4. Explosion Effect & Confetti Cannon & Balloon Release
    setTimeout(() => {
      setGiftAnim('EXPLODE');
      triggerConfettiCannon();
    }, 2800);
    
    // 5. Card Emerges From Box
    setTimeout(() => {
      setGiftAnim('DONE');
      setStage('REVEAL');
    }, 3200);
  };

  const triggerConfettiCannon = () => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8b6be8', '#f4b4e8', '#ffd166', '#6ecbf5', '#ffffff']
      }));
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8b6be8', '#f4b4e8', '#ffd166', '#6ecbf5', '#ffffff']
      }));
    }, 250);
  };

  const handleReplay = () => {
    setStage('GIFT_OPENING');
    setGiftAnim('IDLE');
    setTimeout(() => runGiftSequence(), 100);
  };

  const { recipientName, senderName, customMessage, age, nickname, photoData } = proposal;

  const displayName = nickname ? `"${nickname}"` : recipientName;

  // Gift Animation Variants
  const giftVariants = {
    IDLE: { scale: 1, rotate: 0 },
    WIGGLE: { 
      rotate: [0, -10, 10, -10, 10, 0], 
      transition: { duration: 0.6, repeat: Infinity } 
    },
    GLOW: { 
      scale: 1.05, 
      filter: 'drop-shadow(0 0 40px rgba(255, 209, 102, 0.8))',
      transition: { duration: 0.8 } 
    },
    PULSE: { 
      scale: [1.05, 1.2, 1.05, 1.2, 1.05], 
      filter: 'drop-shadow(0 0 60px rgba(255, 209, 102, 1))',
      transition: { duration: 1.2 } 
    },
    EXPLODE: { 
      scale: 2, 
      opacity: 0, 
      filter: 'blur(20px)',
      transition: { duration: 0.4 } 
    },
    DONE: { opacity: 0, display: 'none' }
  };

  return (
    <>
      <div className={styles.page}>
        <HomeButton />

        {/* Ambient Background Layer */}
        <div className={styles.ambientLayer}>
          {sparkles.map(s => (
            <div 
              key={`sparkle-${s.id}`} 
              className={styles.sparkle} 
              style={{ left: s.left, top: s.top, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }} 
            />
          ))}
          {ambientBalloons.map(b => (
            <div 
              key={`balloon-${b.id}`} 
              className={styles.ambientBalloon}
              style={{ left: b.left, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
            >
              {b.emoji}
            </div>
          ))}
        </div>

        <div className={styles.content}>
          <AnimatePresence mode="wait">
            
            {/* ── STAGE 1: INTRO ── */}
            {stage === 'INTRO' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <motion.h1 
                  className={styles.title}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  🎉 Happy Birthday<br/>{displayName} 🎂
                </motion.h1>
                <motion.p 
                  className={styles.senderText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  From {senderName} ❤️
                </motion.p>
                
                <motion.p 
                  className={styles.subtitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  A surprise gift is waiting...
                </motion.p>

                <motion.button
                  className={styles.openBtn}
                  onClick={runGiftSequence}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: 1.6, type: 'spring', stiffness: 200 }}
                >
                  🎁 Open My Gift
                </motion.button>
              </motion.div>
            )}

            {/* ── STAGE 2: GIFT OPENING SEQUENCE ── */}
            {stage === 'GIFT_OPENING' && (
              <motion.div
                key="gift"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className={styles.giftContainer}
              >
                {giftAnim === 'GLOW' || giftAnim === 'PULSE' ? <div className={styles.glowAura} /> : null}
                <motion.div
                  className={styles.hugeGift}
                  variants={giftVariants}
                  animate={giftAnim}
                >
                  🎁
                </motion.div>
              </motion.div>
            )}

            {/* ── STAGE 3: CARD REVEAL ── */}
            {stage === 'REVEAL' && (
              <motion.div
                key="reveal"
                className={styles.cardWrapper}
                initial={{ opacity: 0, scale: 0.5, y: 150, rotateX: 45 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 80, delay: 0.2 }}
              >
                <div className={styles.greetingCard}>
                  <div className={styles.cardBanner}>
                    <span>🎈</span> Happy Birthday <span>🎂</span>
                  </div>
                  
                  <div className={styles.cardInner}>
                    {age && (
                      <div className={styles.ageBadge}>Turning {age}! 🎉</div>
                    )}
                    
                    {photoData && (
                      <div className={styles.photoFrame}>
                        <img src={photoData} alt="Birthday Memory" />
                      </div>
                    )}
                    
                    <p className={styles.cardMessage}>
                      {customMessage || "Wishing you a year full of happiness and success. 🎂✨"}
                    </p>
                    
                    <p className={styles.cardSender}>
                      — {senderName}
                    </p>
                  </div>
                </div>

                <motion.button 
                  className={styles.replayBtn} 
                  onClick={handleReplay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  🎈 Celebrate Again
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </>
  );
}
