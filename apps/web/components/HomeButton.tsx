'use client';

import Link from 'next/link';
import styles from './HomeButton.module.css';

interface HomeButtonProps {
  /** Override label. Defaults to "StoryShare" */
  label?: string;
}

/**
 * HomeButton — fixed top-left navigation present on all proposal pages.
 * Clicking takes the user back to the landing page (/).
 */
export default function HomeButton({ label = 'StoryShare' }: HomeButtonProps) {
  return (
    <Link href="/" className={styles.btn} aria-label="Go to StoryShare home" id="home-button">
      <span className={styles.icon}>✦</span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
