'use client';
import Features from './sections/Features';
import Testimonials from './sections/Testimonials';
import styles from './hero.module.css';

export default function LandingPage() {
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
            ✦ Craft unforgettable proposals
          </div>

          <h1 className={`${styles.headline} animate-fadeInUp delay-200`}>
            Propose with Your<br />
            <span className={styles.headlineAccent}>Heart &amp; Creativity</span>
          </h1>

          <p className={`${styles.subheadline} animate-fadeInUp delay-400`}>
            Create a beautiful, personalised proposal page — complete with music, photos, and heartfelt words — and share it as a link your person will never forget.
          </p>

          <div className={`${styles.ctaRow} animate-fadeInUp delay-600`}>
            <a id="hero-cta" href="/proposal/create" className={styles.ctaBtn}>
              ✨ Create a Proposal
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
            { label: 'Proposals created', value: '50K+' },
            { label: 'Moments shared', value: '2M+' },
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

      {/* ── Testimonials ── */}
      <Testimonials />
    </>
  );
}
