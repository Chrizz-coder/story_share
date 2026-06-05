'use client';
import { useEffect, useRef } from 'react';
import styles from './Features.module.css';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    title: 'Instant Sharing',
    desc: 'Share memories in seconds with anyone, anywhere. No delays, no friction — just seamless sharing.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Real-time Reactions',
    desc: 'See who loves your moment the instant it happens. Live reaction counts and emoji bursts in real time.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
      </svg>
    ),
    title: 'Beautiful Stories',
    desc: '24-hour disappearing content with stunning templates. Make every moment look like a masterpiece.',
  },
];

export default function Features() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className={`${styles.header} reveal`} ref={(el) => { cardRefs.current[3] = el; }}>
        <span className={styles.sectionLabel}>Why StoryShare?</span>
        <h2 className={styles.title}>Everything you need to<br /><span className="brand-text">share what matters</span></h2>
        <p className={styles.subtitle}>Built for creators who want powerful tools without the complexity.</p>
      </div>

      <div className={styles.grid}>
        {features.map((f, i) => (
          <div
            key={f.title}
            id={`feature-card-${i}`}
            className={`${styles.card} reveal`}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div className={styles.iconWrap}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
