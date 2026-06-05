'use client';
import { useEffect, useRef } from 'react';
import styles from './Pricing.module.css';

type Plan = 'starter' | 'premium' | 'creator';

const plans = [
  {
    key: 'starter' as Plan,
    name: 'Starter',
    price: '₹99',
    amount: 9900,
    desc: 'Perfect for casual users',
    features: ['10 stories/month', 'Basic reactions', 'Email support', 'Mobile app access'],
    btnLabel: 'Get Started',
    popular: false,
  },
  {
    key: 'premium' as Plan,
    name: 'Premium',
    price: '₹299',
    amount: 29900,
    desc: 'Most loved by creators',
    features: ['Unlimited stories', 'Advanced reactions', 'Priority support', 'Analytics dashboard', 'Custom themes'],
    btnLabel: 'Get Premium',
    popular: true,
  },
  {
    key: 'creator' as Plan,
    name: 'Creator',
    price: '₹999',
    amount: 99900,
    desc: 'For professional creators',
    features: ['Everything in Premium', 'Verified badge', 'Creator analytics', 'Custom domain', 'Dedicated manager'],
    btnLabel: 'Contact Sales',
    popular: false,
  },
];

interface PricingProps {
  onSelectPlan: (plan: Plan) => void;
}

export default function Pricing({ onSelectPlan }: PricingProps) {
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
      <div className={`${styles.header} reveal`} ref={(el) => { refs.current[3] = el; }}>
        <span className={styles.sectionLabel}>Pricing</span>
        <h2 className={styles.title}>Simple, Transparent Pricing</h2>
        <p className={styles.subtitle}>Start free, upgrade when you're ready. No hidden fees.</p>
      </div>

      <div className={styles.grid}>
        {plans.map((plan, i) => (
          <div
            key={plan.key}
            id={`pricing-card-${plan.key}`}
            className={`${styles.card} ${plan.popular ? styles.featured : styles.plain} reveal`}
            ref={(el) => { refs.current[i] = el; }}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {plan.popular && <span className={styles.badge}>MOST POPULAR</span>}

            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planDesc}>{plan.desc}</p>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{plan.price}</span>
              <span className={styles.period}>/month</span>
            </div>

            <ul className={styles.featureList}>
              {plan.features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <span className={styles.checkmark}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              id={`pricing-btn-${plan.key}`}
              className={plan.popular ? styles.btnFeatured : styles.btnPlain}
              onClick={() => onSelectPlan(plan.key)}
            >
              {plan.btnLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
