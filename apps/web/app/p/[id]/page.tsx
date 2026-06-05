'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAudio } from '@/context/AudioContext';
import styles from './proposal.module.css';
import { Heart } from 'lucide-react';

const GET_PROPOSAL = gql`
  query GetProposal($id: ID!) {
    getProposal(id: $id) {
      id
      recipientName
      senderName
      template
      customMessage
      theme
      music
      photoData
      accepted
    }
  }
`;

const INCREMENT_VIEW = gql`
  mutation IncrementViewCount($id: ID!) {
    incrementViewCount(id: $id) {
      id
      viewCount
    }
  }
`;

const ACCEPT_PROPOSAL = gql`
  mutation AcceptProposal($id: ID!) {
    acceptProposal(id: $id) {
      id
      accepted
    }
  }
`;

const THEMES = {
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  galaxy: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
  sunset: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
  sakura: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
};

const MUSIC_MAP: Record<string, string> = {
  lofi: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  piano: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=romantic-piano-128166.mp3',
  ambient: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_d0865ee461.mp3?filename=ambient-piano-amp-strings-10711.mp3',
  acoustic: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=happy-day-113985.mp3',
};

const NO_BUTTON_TEXTS = [
  "No 😢",
  "Are you sure? 🥺",
  "Think again 😭",
  "Please? 💔",
  "You can't escape 😈",
];

export default function ProposalPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { playTrack, pause } = useAudio();
  const [noClickCount, setNoClickCount] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data, loading, error } = useQuery(GET_PROPOSAL, { variables: { id } });
  const [incrementViewCount] = useMutation(INCREMENT_VIEW);
  const [acceptProposal] = useMutation(ACCEPT_PROPOSAL);

  useEffect(() => {
    if (data?.getProposal) {
      incrementViewCount({ variables: { id } }).catch(console.error);
      
      const trackId = data.getProposal.music;
      if (trackId && trackId !== 'none' && MUSIC_MAP[trackId]) {
        playTrack(MUSIC_MAP[trackId]);
      } else {
        pause();
      }

      if (data.getProposal.accepted) {
        setIsAccepted(true);
      }
    }
  }, [data]);

  if (loading) return <div className={styles.loading}>Loading magic... ✨</div>;
  if (error || !data?.getProposal) return <div className={styles.loading}>This page doesn't exist 💔</div>;

  const proposal = data.getProposal;
  const background = THEMES[proposal.theme as keyof typeof THEMES] || THEMES.purple;

  const handleNoHover = () => {
    if (noClickCount >= 4) return; // Stop moving violently on the last stage to let them click if they dare
    if (!containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const btnWidth = 150;
    const btnHeight = 60;
    
    // Calculate random position within container bounds
    const maxX = container.width - btnWidth;
    const maxY = container.height - btnHeight;
    
    // We constrain the random position so it doesn't fly off screen
    const newX = (Math.random() * maxX) - (maxX / 2);
    const newY = (Math.random() * maxY) - (maxY / 2) + 100; // +100 to keep it below the main text
    
    setNoBtnPosition({ x: newX, y: newY });
  };

  const handleNoClick = () => {
    setNoClickCount(prev => Math.min(prev + 1, NO_BUTTON_TEXTS.length - 1));
    handleNoHover();
  };

  const handleYesClick = async () => {
    try {
      await acceptProposal({ variables: { id } });
    } catch (e) {
      console.error(e);
    }
    
    setIsAccepted(true);
    
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff758c', '#ff7eb3']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff758c', '#ff7eb3']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Generate floating hearts array
  const hearts = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    animationDelay: `${Math.random() * 5}s`,
    scale: Math.random() * 0.5 + 0.5,
  }));

  const templateQuestion = proposal.template === 'custom' 
    ? proposal.customMessage.split('\n')[0] || "I have a question..."
    : TEMPLATE_TEXTS[proposal.template] || "Will you be my girlfriend?";

  return (
    <div className={styles.container} style={{ background }} ref={containerRef}>
      {/* Floating Hearts Background */}
      <div className={styles.heartsContainer}>
        {hearts.map((h) => (
          <div 
            key={h.id} 
            className={styles.floatingHeart}
            style={{
              left: h.left,
              animationDuration: h.animationDuration,
              animationDelay: h.animationDelay,
              transform: `scale(${h.scale})`
            }}
          >
            <Heart fill="rgba(255,255,255,0.2)" color="rgba(255,255,255,0.4)" size={32} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isAccepted ? (
          <motion.div 
            key="question"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            transition={{ duration: 0.8, type: "spring" }}
            className={styles.contentCard}
          >
            <motion.h1 
              className={styles.questionText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              {templateQuestion}
            </motion.h1>
            
            <p className={styles.fromText}>
              From: <span className={styles.highlight}>{proposal.senderName}</span>
            </p>

            <div className={styles.actions}>
              <motion.button 
                className={styles.yesBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYesClick}
                style={{
                  transform: `scale(${1 + (noClickCount * 0.15)})` // Yes button grows
                }}
              >
                Yes 💖
              </motion.button>

              <motion.button 
                className={styles.noBtn}
                onMouseEnter={handleNoHover}
                onClick={handleNoClick}
                animate={{ 
                  x: noBtnPosition.x, 
                  y: noBtnPosition.y,
                  scale: Math.max(1 - (noClickCount * 0.1), 0.5) // No button shrinks
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                style={{ position: noClickCount > 0 ? 'absolute' : 'relative' }}
              >
                {NO_BUTTON_TEXTS[noClickCount]}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="accepted"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className={styles.acceptedCard}
          >
            {proposal.photoData && (
              <motion.img 
                src={proposal.photoData} 
                alt="Us" 
                className={styles.photo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              />
            )}
            
            <motion.h1 
              className={styles.yayText}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              Yay! They said YES! 🎉
            </motion.h1>
            
            <motion.div 
              className={styles.messageBox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className={styles.customMessage}>{proposal.customMessage}</p>
              <p className={styles.recipientTag}>Dear {proposal.recipientName}, you just made {proposal.senderName}'s day! ❤️</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TEMPLATE_TEXTS: Record<string, string> = {
  romantic: 'Will you be my girlfriend?',
  marriage: 'Will you marry me?',
  date: 'Will you go on a date with me?',
  birthday: 'I have something special for you',
};
