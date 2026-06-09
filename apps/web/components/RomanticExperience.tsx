'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAudio } from '@/context/AudioContext';
import { getCategoryMusicUrl } from '@/lib/proposalAudio';
import HomeButton from '@/components/HomeButton';
import Footer from '@/components/Footer';
import styles from './RomanticExperience.module.css';

const ACCEPT_PROPOSAL = gql`
  mutation AcceptProposal($id: ID!) {
    acceptProposal(id: $id) {
      id
      accepted
    }
  }
`;

type Stage = 'ENVELOPE' | 'INTRO' | 'GREETING' | 'TEASER' | 'QUESTION' | 'BUTTONS' | 'ACCEPTED';

const NO_TEXTS = [
  'No 😢',
  'Are you sure? 🥺',
  'Think again 😭',
  'Please? 💔',
  'Come on ❤️',
  'Give me a chance 🥹',
  'Just press Yes 😭',
  "You can't escape 😈",
];

const TYPEWRITER_TEXT = 'Will you be my girlfriend?';

const HEARTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${4 + ((i * 4.9) % 92)}%`,
  size: 14 + ((i * 7) % 22),
  delay: (i * 0.6) % 8,
  duration: 12 + ((i * 3.1) % 10),
  opacity: 0.15 + ((i * 0.04) % 0.25),
}));

const SPARKLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 5.4) % 90)}%`,
  top: `${5 + ((i * 7.1) % 88)}%`,
  delay: (i * 0.45) % 6,
}));

export default function RomanticExperience({ proposal }: { proposal: any }) {
  const [stage, setStage] = useState<Stage>('ENVELOPE');
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [noCount, setNoCount] = useState(0);
  const [yesScale, setYesScale] = useState(1);
  const [musicStarted, setMusicStarted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);

  const noX = useMotionValue(0);
  const noY = useMotionValue(0);
  const noXSpring = useSpring(noX, { stiffness: 300, damping: 20 });
  const noYSpring = useSpring(noY, { stiffness: 300, damping: 20 });

  const { playTrack, play, setVolume } = useAudio();
  const [showToast, setShowToast] = useState(false);
  
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'I have a special question for you 💕',
          text: 'Someone has a romantic proposal for you!',
          url,
        });
      } catch (e) {
        // ignored
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const [acceptProposal] = useMutation(ACCEPT_PROPOSAL);

  const handleOpenProposal = () => {
    if (proposal && !musicStarted) {
      const musicCategory = proposal.music ?? 'romantic';
      const musicUrl = getCategoryMusicUrl(musicCategory);
      playTrack(musicUrl, { volume: 0.4, loop: true });
      setMusicStarted(true);
    }
    setStage('INTRO');
  };

  useEffect(() => {
    if (stage === 'INTRO') {
      const t = setTimeout(() => setStage('GREETING'), 1800);
      return () => clearTimeout(t);
    }
    if (stage === 'GREETING') {
      const t = setTimeout(() => setStage('TEASER'), 2800);
      return () => clearTimeout(t);
    }
    if (stage === 'TEASER') {
      const t = setTimeout(() => setStage('QUESTION'), 2800);
      return () => clearTimeout(t);
    }
    if (stage === 'QUESTION') {
      let i = 0;
      setTypedText('');
      setTypewriterDone(false);
      const interval = setInterval(() => {
        i++;
        setTypedText(TYPEWRITER_TEXT.slice(0, i));
        if (i >= TYPEWRITER_TEXT.length) {
          clearInterval(interval);
          setTypewriterDone(true);
          setTimeout(() => setStage('BUTTONS'), 600);
        }
      }, 60);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const moveNoBtn = useCallback(() => {
    if (!yesBtnRef.current) return;
    const yr = yesBtnRef.current.getBoundingClientRect();
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const noW = 160;
    const noH = 52;
    const margin = 20;
    const safePadding = 30;
    const yesLeft = yr.left - safePadding;
    const yesRight = yr.right + safePadding;
    const yesTop = yr.top - safePadding;
    const yesBottom = yr.bottom + safePadding;

    let attempts = 0;
    let nx: number, ny: number;
    do {
      nx = margin + Math.random() * (ww - noW - margin * 2);
      ny = margin + Math.random() * (wh - noH - margin * 2);
      attempts++;
    } while (
      attempts < 50 &&
      (nx < yesRight && nx + noW > yesLeft && ny < yesBottom && ny + noH > yesTop)
    );

    const cx = ww / 2 - noW / 2;
    const cy = yr.top;
    noX.set(nx - cx);
    noY.set(ny - cy);
  }, [noX, noY]);

  const handleNoHover = () => {
    if (noCount >= NO_TEXTS.length - 1) return;
    moveNoBtn();
  };

  const handleNoTouchStart = () => {
    moveNoBtn();
  };

  const handleNoClick = () => {
    const next = Math.min(noCount + 1, NO_TEXTS.length - 1);
    setNoCount(next);
    setYesScale((prev) => Math.min(prev + 0.12, 1.7));
    moveNoBtn();
  };

  const handleYesClick = async () => {
    try {
      await acceptProposal({ variables: { id: proposal.id } });
    } catch {}

    setStage('ACCEPTED');
    setVolume(0.55);

    const fire = (angle: number, origin: { x: number; y: number }) => {
      confetti({
        particleCount: 60,
        angle,
        spread: 70,
        origin,
        colors: ['#ff4d79', '#ff80ab', '#fecfef', '#e91e63', '#ffb3c6'],
        startVelocity: 45,
        gravity: 0.8,
        ticks: 200,
      });
    };

    fire(60, { x: 0, y: 0.7 });
    fire(120, { x: 1, y: 0.7 });
    fire(90, { x: 0.5, y: 0.4 });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
        shapes: ['circle'],
        colors: ['#ff4d79', '#ff80ab', '#fff', '#fce4ec'],
        startVelocity: 30,
        gravity: 0.5,
      });
    }, 400);
  };

  const recipientName = proposal.recipientName;
  const senderName = proposal.senderName;
  const customMessage = proposal.customMessage;
  const photoData = proposal.photoData;

  return (
    <>
    <div className={styles.page} ref={containerRef}>
      <HomeButton />

      <AnimatePresence>
        {showToast && (
          <motion.div
            className={styles.shareToast}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            Link copied successfully ❤️
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          className={styles.heartsLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {HEARTS.map((h) => (
            <div
              key={h.id}
              className={styles.floatingHeart}
              style={{
                left: h.left,
                bottom: '-10%',
                width: h.size,
                height: h.size,
                opacity: h.opacity,
                animationDelay: `${h.delay}s`,
                animationDuration: `${h.duration}s`,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {(stage === 'GREETING' || stage === 'TEASER' || stage === 'QUESTION' || stage === 'BUTTONS' || stage === 'ACCEPTED') && (
          <motion.div
            className={styles.sparklesLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {SPARKLES.map((s) => (
              <div
                key={s.id}
                className={styles.sparkle}
                style={{
                  left: s.left,
                  top: s.top,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.content}>
        <AnimatePresence mode="wait">

          {stage === 'ENVELOPE' && (
            <motion.div
              key="envelope"
              className={styles.envelopeWrap}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                className={styles.openBtn}
                onClick={handleOpenProposal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                💌 Tap to Open
              </motion.button>
              <p className={styles.envelopeText}>A special message for {recipientName}</p>
            </motion.div>
          )}

          {stage === 'INTRO' && (
            <motion.div
              key="intro"
              className={styles.introWrap}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.introHeart}>❤️</div>
            </motion.div>
          )}

          {stage === 'GREETING' && (
            <motion.div
              key="greeting"
              className={styles.textWrap}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <p className={styles.greetingText}>
                Hi {recipientName} ❤️
              </p>
            </motion.div>
          )}

          {stage === 'TEASER' && (
            <motion.div
              key="teaser"
              className={styles.textWrap}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <p className={styles.teaserText}>
                Someone special has something to ask you...
              </p>
            </motion.div>
          )}

          {stage === 'QUESTION' && (
            <motion.div
              key="question"
              className={styles.textWrap}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className={styles.questionText}>
                {typedText}
                <span className={`${styles.cursor} ${typewriterDone ? styles.cursorHide : ''}`}>|</span>
              </p>
            </motion.div>
          )}

          {stage === 'BUTTONS' && (
            <motion.div
              key="buttons"
              className={styles.buttonsWrap}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.p
                className={styles.questionText}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {TYPEWRITER_TEXT}
              </motion.p>

              <motion.div
                className={styles.btnsRow}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <motion.button
                  ref={yesBtnRef}
                  id="yes-btn"
                  className={styles.yesBtn}
                  style={{ scale: yesScale }}
                  onClick={handleYesClick}
                  whileHover={{ scale: yesScale * 1.06 }}
                  whileTap={{ scale: yesScale * 0.95 }}
                  animate={{ scale: [yesScale, yesScale * 1.05, yesScale] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  Yes! 💖
                </motion.button>

                <motion.button
                  id="no-btn"
                  className={styles.noBtn}
                  style={{
                    x: noXSpring,
                    y: noYSpring,
                    position: noCount > 0 ? 'fixed' : 'relative',
                  }}
                  onMouseEnter={handleNoHover}
                  onTouchStart={handleNoTouchStart}
                  onClick={handleNoClick}
                  aria-label="No button"
                >
                  {NO_TEXTS[Math.min(noCount, NO_TEXTS.length - 1)]}
                </motion.button>
              </motion.div>

              <motion.p
                className={styles.fromText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                — from {senderName}, with love 🌹
              </motion.p>
            </motion.div>
          )}

          {stage === 'ACCEPTED' && (
            <motion.div
              key="accepted"
              className={styles.acceptedWrap}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            >
              <motion.div
                className={styles.yayEmoji}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                ❤️
              </motion.div>

              <motion.h1
                className={styles.yayTitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Yay! You said YES!
              </motion.h1>

              {customMessage && (
                <motion.div
                  className={styles.messageCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className={styles.messageText}>&ldquo;{customMessage}&rdquo;</p>
                  <p className={styles.messageSender}>— {senderName} 💕</p>
                </motion.div>
              )}

              {photoData && (
                <motion.div
                  className={styles.photoWrap}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                >
                  <img src={photoData} alt="A special moment" className={styles.photo} />
                </motion.div>
              )}

              <motion.p
                className={styles.fromText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                You just made {senderName}&apos;s day! 🎉
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(stage === 'QUESTION' || stage === 'BUTTONS' || stage === 'ACCEPTED') && (
            <motion.button
              className={styles.floatingShareBtn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.5 }}
              onClick={handleShare}
            >
              📱 Share Proposal
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
    <Footer />
    </>
  );
}
