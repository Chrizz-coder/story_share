'use client';
import Link from 'next/link';
import styles from './landing.module.css';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span>StoryShare</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#pricing" className={styles.navLink}>Pricing</Link>
            <Link href="/login" className={styles.signInBtn}>Sign In</Link>
          </nav>
        </div>
      </header>

      {/* ── Page content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className={`${styles.footer} footer-dark`}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.footerBrandName}>StoryShare</span>
            <p className={styles.footerTagline}>Create your story, share your love.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.footerLink}>Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className={styles.footerLink}>Refund Policy</Link>
            <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} StoryShare. All rights reserved.</p>
          <p className={styles.footerCredits}>
            Created with <span className={styles.heart}>♥</span> by Stefin
          </p>
        </div>
      </footer>
    </div>
  );
}
