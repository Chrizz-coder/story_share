'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROPOSAL } from '@/graphql/proposals';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, AlertCircle } from 'lucide-react';
import styles from './proposal.module.css';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  isBurst?: boolean;
  decay?: number;
}

export default function ProposalViewer({ params }: { params: { id: string } }) {
  const { id } = params;
  const [accepted, setAccepted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isPlayingRef = useRef(false);

  const { selectTrack, play, isPlaying } = useAudio();
  isPlayingRef.current = isPlaying;

  const { data, loading, error } = useQuery(GET_PROPOSAL, {
    variables: { id },
  });

  const proposal = data?.getProposal;
  const theme = proposal?.theme || 'rose-glow';
  const senderName = proposal?.senderName || 'Sender';
  const recipientName = proposal?.recipientName || 'Recipient';
  const customMessage = proposal?.customMessage || '';
  const template = proposal?.template || 'romantic';
  const musicTrackId = proposal?.music || 'romantic-lofi';
  const photoData = proposal?.photoData;

  // Auto-play the proposal soundtrack
  useEffect(() => {
    if (proposal && musicTrackId) {
      selectTrack(musicTrackId);
      // Attempt play. If browser blocks, it handles gracefully.
      play();
    }
  }, [proposal, musicTrackId]);

  // Canvas particle engine
  useEffect(() => {
    if (!proposal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const colors = (({
      'rose-glow': ['#ff758c', '#ff7eb3', '#fecfef', '#ffb3c1'],
      'sunset-gold': ['#f6d365', '#fda085', '#ffe0b2', '#ffcc80'],
      'midnight-stars': ['#ffffff', '#e0f7fa', '#b2ebf2', '#80deea'],
      'neon-dream': ['#f107a3', '#7b2ff7', '#00f2fe', '#4facfe'],
    } as Record<string, string[]>)[theme]) || ['#fff'];

    const particleType = (({
      'rose-glow': 'heart',
      'sunset-gold': 'circle',
      'midnight-stars': 'star',
      'neon-dream': 'square',
    } as Record<string, string>)[theme]) || 'circle';

    // Seed initial ambient background particles
    const ambientCount = theme === 'midnight-stars' ? 80 : 40;
    particlesRef.current = Array.from({ length: ambientCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 2,
      speedX: Math.random() * 0.4 - 0.2,
      speedY: -(Math.random() * 0.8 + 0.2),
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Filter and update particles
      particlesRef.current = particlesRef.current.filter((p) => {
        if (p.isBurst) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.speedY += 0.08; // apply light gravity to bursts
          p.opacity -= p.decay || 0.015;
          return p.opacity > 0;
        }

        // Ambient particles float upwards
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        return true;
      });

      // Render each particle
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        const isHeartType = p.isBurst || particleType === 'heart';

        if (isHeartType) {
          ctx.beginPath();
          const d = p.size;
          ctx.moveTo(p.x, p.y + d / 4);
          ctx.quadraticCurveTo(p.x, p.y, p.x - d / 2, p.y);
          ctx.quadraticCurveTo(p.x - d, p.y, p.x - d, p.y + d / 2);
          ctx.quadraticCurveTo(p.x - d, p.y + d, p.x, p.y + d * 1.5);
          ctx.quadraticCurveTo(p.x + d, p.y + d, p.x + d, p.y + d / 2);
          ctx.quadraticCurveTo(p.x + d, p.y, p.x + d / 2, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + d / 4);
          ctx.fill();
        } else if (particleType === 'star') {
          ctx.beginPath();
          const cx = p.x;
          const cy = p.y;
          const spikes = 4;
          const outerRadius = p.size;
          const innerRadius = p.size / 2.5;
          let rot = (Math.PI / 2) * 3;
          let x = cx;
          let y = cy;
          const step = Math.PI / spikes;

          ctx.moveTo(cx, cy - outerRadius);
          for (let idx = 0; idx < spikes; idx++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(cx, cy - outerRadius);
          ctx.closePath();
          ctx.fill();
        } else if (particleType === 'square') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [proposal, theme]);

  // Handle Yes reaction click (trigger particle burst)
  const handleAccept = () => {
    setAccepted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const burstColors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fecfef'];
    const count = 120;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particlesRef.current.push({
        x: cx,
        y: cy,
        size: Math.random() * 10 + 4,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        opacity: 1,
        color: burstColors[Math.floor(Math.random() * burstColors.length)],
        isBurst: true,
        decay: Math.random() * 0.02 + 0.012,
      });
    }
  };

  // Loading indicator
  if (loading) {
    return (
      <div className={`${styles.container} ${styles.themeRoseGlow}`}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Error page
  if (error || !proposal) {
    return (
      <div className={`${styles.container} ${styles.themeRoseGlow}`}>
        <div
          className={styles.card}
          style={{ padding: '30px', background: 'rgba(255,255,255,0.8)' }}
        >
          <AlertCircle size={40} style={{ color: 'var(--red-500)' }} />
          <h2 className={styles.names} style={{ color: 'var(--gray-900)' }}>
            Proposal Not Found
          </h2>
          <p className={styles.message} style={{ color: 'var(--gray-600)' }}>
            This proposal link is invalid or may have been deleted.
          </p>
          <a href="/" className={styles.btnAccept} style={{ marginTop: '10px', textDecoration: 'none' }}>
            Back Home
          </a>
        </div>
      </div>
    );
  }

  // Header tag based on template
  const templateBadge = (({
    romantic: 'A Special Message of Love',
    marriage: 'A Lifetime Commitment',
    date: 'A Loving Invitation',
    birthday: 'A Birthday Surprise',
    custom: 'A Special Dedication',
  } as Record<string, string>)[template]) || 'A StoryShare Message';

  // Apply custom classes based on selected theme
  const containerClass = `${styles.container}`;
  const backdropClass = `${styles.backdrop} ${
    theme === 'rose-glow'
      ? styles.themeRoseGlow
      : theme === 'sunset-gold'
      ? styles.themeSunsetGold
      : theme === 'midnight-stars'
      ? styles.themeMidnightStars
      : theme === 'neon-dream'
      ? styles.themeNeonDream
      : ''
  }`;

  const cardClass = `${styles.card} ${
    theme === 'midnight-stars'
      ? styles.cardMidnight
      : theme === 'neon-dream'
      ? styles.cardNeon
      : ''
  }`;

  return (
    <div className={containerClass}>
      <div className={backdropClass} />
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={cardClass}>
        <span className={styles.badge}>
          <Heart size={12} fill="currentColor" />
          {templateBadge}
        </span>

        <h1 className={styles.names}>
          Dear {recipientName},
        </h1>

        <p className={styles.message}>
          "{customMessage}"
        </p>

        {photoData && (
          <div className={styles.polaroid}>
            <img src={photoData} alt="Special Moment" className={styles.polaroidImg} />
            <span className={styles.polaroidText}>Our Moment ✦</span>
          </div>
        )}

        <div className={styles.interaction}>
          <AnimatePresence mode="wait">
            {!accepted ? (
              <motion.button
                key="btn-accept"
                type="button"
                className={`${styles.btnAccept} ${theme === 'neon-dream' ? styles.btnAcceptNeon : ''}`}
                onClick={handleAccept}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Say Yes! ❤️
              </motion.button>
            ) : (
              <motion.div
                key="accept-message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.reactionMsg}
              >
                Acceptance Sent! ❤️ You made my day!
              </motion.div>
            )}
          </AnimatePresence>

          <span className={styles.footerNote}>Signed, with love, {senderName}</span>
        </div>
      </div>

      {!isPlaying && (
        <div className={styles.audioReminder}>
          <div className={`${styles.audioIndicator} ${styles.audioIndicatorPulse}`} />
          <span>Soundtrack Autoplaying</span>
        </div>
      )}
    </div>
  );
}
