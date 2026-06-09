'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAudio } from '@/context/AudioContext';
import HomeButton from '@/components/HomeButton';
import Footer from '@/components/Footer';
import styles from './BirthdayExperience.module.css';

type Stage = 'INTRO' | 'GIFT_OPENING' | 'REVEAL';

const BALLOONS = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 6.7) % 90)}%`,
  size: 30 + ((i * 5) % 25),
  delay: (i * 0.4) % 5,
  duration: 8 + ((i * 2.3) % 7),
  emoji: ['🎈', '🎈', '🎈', '✨', '🎂'][i % 5],
}));

export default function BirthdayExperience({ proposal }: { proposal: any }) {
  const [stage, setStage] = useState<Stage>('INTRO');
  const { playTrack, setVolume } = useAudio();

  const handleOpenGift = () => {
    // Start music
    playTrack('/music/birthday.mp3', { volume: 0.5, loop: true });
    
    // Transition to opening
    setStage('GIFT_OPENING');

    // Simulate opening animation duration
    setTimeout(() => {
      triggerConfetti();
      setStage('REVEAL');
    }, 2000); // 2 seconds of shaking/popping
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b6be8', '#f4b4e8', '#ffd166', '#6ecbf5', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b6be8', '#f4b4e8', '#ffd166', '#6ecbf5', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleReplay = () => {
    setStage('GIFT_OPENING');
    setTimeout(() => {
      triggerConfetti();
      setStage('REVEAL');
    }, 1500);
  };

  const { recipientName, senderName, customMessage, photoData } = proposal;

  return (
    <>
      <div className={styles.page}>
        <HomeButton />

        {/* Floating Balloons Layer - active during reveal */}
        <AnimatePresence>
          {stage === 'REVEAL' && (
            <motion.div
              className={styles.balloonsLayer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {BALLOONS.map((b) => (
                <div
                  key={b.id}
                  className={styles.balloon}
                  style={{
                    left: b.left,
                    fontSize: b.size,
                    animationDelay: `${b.delay}s`,
                    animationDuration: `${b.duration}s`,
                  }}
                >
                  {b.emoji}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.content}>
          <AnimatePresence mode="wait">
            
            {/* ── INTRO STAGE ── */}
            {stage === 'INTRO' && (
              <motion.div
                key="intro"
                className={styles.introWrap}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h1 
                  className={styles.title}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  🎉 Happy Birthday<br/>{recipientName} 🎂
                </motion.h1>
                <motion.p 
                  className={styles.senderText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  From {senderName} ❤️
                </motion.p>
                
                <motion.p 
                  className={styles.subtitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{ marginTop: 24 }}
                >
                  A surprise gift is waiting...
                </motion.p>

                <motion.button
                  className={styles.openBtn}
                  onClick={handleOpenGift}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, type: 'spring' }}
                >
                  🎁 Open My Gift
                </motion.button>
              </motion.div>
            )}

            {/* ── GIFT OPENING STAGE ── */}
            {stage === 'GIFT_OPENING' && (
              <motion.div
                key="gift"
                className={styles.giftWrap}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
              >
                <div className={`${styles.hugeGift} ${styles.shake}`}>🎁</div>
              </motion.div>
            )}

            {/* ── REVEAL STAGE ── */}
            {stage === 'REVEAL' && (
              <motion.div
                key="reveal"
                className={styles.revealWrap}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
              >
                <h1 className={styles.title}>🎉 Happy Birthday<br/>{recipientName}! 🎂</h1>
                
                <div className={styles.messageCard}>
                  {photoData && (
                    <div className={styles.photoWrap} style={{ marginBottom: 24 }}>
                      <img src={photoData} alt="Birthday Memory" className={styles.photo} />
                    </div>
                  )}
                  
                  <p className={styles.messageText}>
                    {customMessage || "Hope your day is filled with happiness, laughter, success, and unforgettable memories!"}
                  </p>
                  
                  <p className={styles.senderText} style={{ marginTop: 20, textAlign: 'right' }}>
                    — {senderName} ❤️
                  </p>
                </div>

                <button className={styles.replayBtn} onClick={handleReplay}>
                  🎈 Celebrate Again
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
