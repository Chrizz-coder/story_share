'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './contact.module.css';

const FAQS = [
  {
    q: 'How do I create a proposal?',
    a: 'Head to the "Create a Proposal" page, fill in the recipient\'s name, your name, an optional message and photo, choose a music track, and click "Generate My Proposal." You\'ll get a unique shareable link instantly.',
  },
  {
    q: 'Can I edit a proposal after sharing it?',
    a: 'Currently proposals cannot be edited after creation. You can create a new one — it only takes about 30 seconds!',
  },
  {
    q: 'Why isn\'t my proposal link working?',
    a: 'Make sure you\'re sharing the full link starting with https://. If the issue persists, please contact us with the proposal ID from your link.',
  },
  {
    q: 'What music options are available?',
    a: 'We currently offer four romantic tracks: Romantic Lofi, Soft Piano, Dreamy Ambient, and Acoustic Guitar. More tracks are coming soon.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We take privacy seriously. Please read our Privacy Policy for full details on how we store and protect your data.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime from Settings → Billing in your account. Your access continues until the end of the billing period. See our Refund Policy for details.',
  },
  {
    q: 'Can I get a refund?',
    a: 'All sales are final. Please review our Refund & Cancellation Policy before purchasing. For technical errors (duplicate charges etc.) contact us within 7 days.',
  },
];

export default function ContactClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    // Simulate form submission — replace with your form backend / email service
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>💬</div>
        <h1 className={styles.heroTitle}>Contact Us</h1>
        <p className={styles.heroSub}>We&apos;re here to help. Reach out any time.</p>
      </div>

      <div className={styles.container}>
        {/* ── Top cards ── */}
        <div className={styles.cards}>
          <a href="mailto:christinmp07@gmail.com" className={styles.card}>
            <div className={styles.cardIcon}>✉️</div>
            <h3 className={styles.cardTitle}>Email Support</h3>
            <p className={styles.cardBody}>christinmp07@gmail.com</p>
            <span className={styles.cardCta}>Send an email →</span>
          </a>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⏱</div>
            <h3 className={styles.cardTitle}>Response Time</h3>
            <p className={styles.cardBody}>We aim to reply within 24–48 hours on business days.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🛡</div>
            <h3 className={styles.cardTitle}>Legal Inquiries</h3>
            <p className={styles.cardBody}>For privacy or legal concerns, email us directly and mark the subject "Legal."</p>
          </div>
        </div>

        {/* ── Contact Form + FAQ ── */}
        <div className={styles.grid}>
          {/* Contact Form */}
          <section className={styles.formSection} aria-labelledby="contact-form-title">
            <h2 className={styles.sectionTitle} id="contact-form-title">Send Us a Message</h2>
            <p className={styles.sectionSub}>
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className={styles.successBox}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.3 }}
                >
                  <div className={styles.successIcon}>🎉</div>
                  <h3 className={styles.successTitle}>Message Sent!</h3>
                  <p className={styles.successText}>
                    Thanks for reaching out, <strong>{formState.name}</strong>. We&apos;ll get back to you at{' '}
                    <strong>{formState.email}</strong> within 24–48 hours.
                  </p>
                  <button className={styles.resetBtn} onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}>
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className={styles.form}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  noValidate
                >
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="contact-name">
                        Your Name <span className={styles.req}>*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        className={styles.input}
                        placeholder="e.g. Alex Johnson"
                        value={formState.name}
                        onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="contact-email">
                        Email Address <span className={styles.req}>*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        className={styles.input}
                        placeholder="alex@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-subject">
                      Subject <span className={styles.req}>*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      className={styles.input}
                      placeholder="e.g. Proposal link not working"
                      value={formState.subject}
                      onChange={(e) => setFormState((p) => ({ ...p, subject: e.target.value }))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-message">
                      Message <span className={styles.req}>*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={6}
                      className={styles.textarea}
                      placeholder="Describe your issue or question in as much detail as you can..."
                      value={formState.message}
                      onChange={(e) => setFormState((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>

                  {error && <p className={styles.errorText}>{error}</p>}

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                    id="contact-submit-btn"
                  >
                    {submitting ? <span className={styles.spinner} /> : null}
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </section>

          {/* FAQ */}
          <section className={styles.faqSection} aria-labelledby="faq-title">
            <h2 className={styles.sectionTitle} id="faq-title">Frequently Asked Questions</h2>
            <p className={styles.sectionSub}>Quick answers to common questions.</p>

            <div className={styles.faqList}>
              {FAQS.map((faq, i) => (
                <div key={i} className={styles.faqItem}>
                  <button
                    className={`${styles.faqQ} ${openFaq === i ? styles.faqQOpen : ''}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    id={`faq-btn-${i}`}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span>{faq.q}</span>
                    <span className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`}>
                      ›
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-btn-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className={styles.faqAWrap}
                      >
                        <p className={styles.faqA}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
