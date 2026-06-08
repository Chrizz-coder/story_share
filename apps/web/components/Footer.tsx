import Link from 'next/link';
import { Linkedin, Github } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Left: Branding */}
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.footerBrandName}>StoryShare</span>
          </Link>
          <p className={styles.footerTagline}>Create beautiful moments worth sharing.</p>
        </div>

        {/* Center: Quick Links */}
        <div className={styles.footerLinks}>
          <Link href="/" className={styles.footerLink}>Home</Link>
          <Link href="/proposal/create" className={styles.footerLink}>Create Proposal</Link>
          <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <Link href="/terms" className={styles.footerLink}>Terms</Link>
          <Link href="/contact" className={styles.footerLink}>Contact</Link>
        </div>

        {/* Right: Personal Branding */}
        <div className={styles.footerBranding}>
          <p className={styles.builtBy}>Built by Christin MP</p>
          <div className={styles.socialIcons}>
            <a 
              href="https://www.linkedin.com/in/christin-mp/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className={styles.socialLink}
            >
              <Linkedin size={18} />
            </a>
            <a 
              href="https://github.com/Chrizz-coder" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className={styles.socialLink}
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} StoryShare. Crafted with <span className={styles.heart}>❤️</span> by{' '}
          <a 
            href="https://www.linkedin.com/in/christin-mp/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.authorLink}
          >
            Christin MP
          </a>.
        </p>
      </div>
    </footer>
  );
}
