'use client';
import { useRef, useState } from 'react';
import Features from './sections/Features';
import Pricing from './sections/Pricing';
import Testimonials from './sections/Testimonials';
import PaymentModal from '@/components/PaymentModal';
import styles from './hero.module.css';

type Plan = 'starter' | 'premium' | 'creator';

export default function LandingPage() {
  const pricingRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('premium');

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* Floating blobs */}
        <div className={styles.blobs}>
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`${styles.blob} animate-float`} style={{
              '--delay': `${i * 3}s`,
              '--size': `${120 + i * 40}px`,
              '--x': `${10 + i * 13}%`,
              '--y': `${5 + (i % 3) * 30}%`,
            } as React.CSSProperties} />
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={`${styles.badge} animate-fadeInUp`}>
            ✦ Trusted by 50,000+ creators
          </div>

          <h1 className={`${styles.headline} animate-fadeInUp delay-200`}>
            Create Your Story,<br />
            <span className={styles.headlineAccent}>Share Your Love</span>
          </h1>

          <p className={`${styles.subheadline} animate-fadeInUp delay-400`}>
            Join thousands sharing their most memorable moments with beautiful stories, real-time reactions, and premium features.
          </p>

          <div className={`${styles.ctaRow} animate-fadeInUp delay-600`}>
            <button id="hero-cta" className={styles.ctaBtn} onClick={scrollToPricing}>
              Get Started
            </button>
            <a href="#features" className={styles.ctaSecondary}>
              See how it works →
            </a>
          </div>

          <div className={`${styles.arrowWrap} animate-bounce-inf delay-800`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Floating stats bar */}
        <div className={`${styles.statsBar} animate-fadeInUp delay-800`}>
          {[
            { label: 'Active users', value: '50K+' },
            { label: 'Stories shared', value: '2M+' },
            { label: 'Countries', value: '120+' },
            { label: 'Uptime', value: '99.9%' },
          ].map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <div id="features">
        <Features />
      </div>

      {/* ── Pricing ── */}
      <div id="pricing" ref={pricingRef}>
        <Pricing onSelectPlan={openModal} />
      </div>

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── Payment Modal ── */}
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
      />
    </>
  );
}
