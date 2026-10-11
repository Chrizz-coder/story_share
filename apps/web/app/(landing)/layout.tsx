'use client';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import Footer from '@/components/Footer';
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
            <AuthButton />
          </nav>
        </div>
      </header>

      {/* ── Page content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
