'use client';
import { useEffect, useRef } from 'react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    initials: 'AS',
    name: 'Amrita Singh',
    role: 'Content Creator',
    quote: 'The stories feature is so intuitive. I love how effortless it is to share my moments!',
    rating: 5,
    color: '#667eea',
  },
  {
    initials: 'RK',
    name: 'Rohan Kumar',
    role: 'Photographer',
    quote: 'Finally a platform that gets it. Sharing has never been easier — my portfolio reaches more people than ever.',
    rating: 5,
    color: '#764ba2',
  },
  {
    initials: 'PP',
    name: 'Priya Patel',
    role: 'Student',
    quote: 'Absolutely love the real-time reactions. My friends feel so close even when we\'re far apart!',
    rating: 5,
    color: '#f06292',
  },
  {
    initials: 'VN',
    name: 'Vikram Nair',
    role: 'Startup Founder',
    quote: 'We use StoryShare for our brand launches. The analytics dashboard is a game-changer.',
    rating: 5,
    color: '#26c6da',
  },
];

const Stars = ({ count }: { count: number }) => (
  <div className={styles.stars}>
    {[...Array(count)].map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

export default function Testimonials() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('revealed')),
      { threshold: 0.1 }
    );
    refs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className={`${styles.header} reveal`} ref={(el) => { refs.current[4] = el; }}>
        <span className={styles.sectionLabel}>Testimonials</span>
        <h2 className={styles.title}>Loved by <span className="brand-text">thousands</span></h2>
        <p className={styles.subtitle}>Real stories from real creators who trust StoryShare every day.</p>
      </div>

      <div className={styles.scroll}>
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            id={`testimonial-${i}`}
            className={`${styles.card} reveal`}
            ref={(el) => { refs.current[i] = el; }}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <Stars count={t.rating} />
            <p className={styles.quote}>"{t.quote}"</p>
            <div className={styles.author}>
              <div className={styles.avatar} style={{ background: t.color }}>{t.initials}</div>
              <div>
                <p className={styles.authorName}>{t.name}</p>
                <p className={styles.authorRole}>{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
