import { Link } from '@/i18n/routing';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <h3 className={styles.title}>Marketplace</h3>
          <Link href="/about" className={styles.link}>About Us</Link>
          <Link href="/sellers" className={styles.link}>Stores</Link>
          <Link href="/how-it-works" className={styles.link}>How it works</Link>
        </div>
        
        <div className={styles.column}>
          <h3 className={styles.title}>Support</h3>
          <Link href="/contact" className={styles.link}>Contact</Link>
          <Link href="/faq" className={styles.link}>FAQ</Link>
          <Link href="/shipping" className={styles.link}>Shipping</Link>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Legal</h3>
          <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
          <Link href="/terms" className={styles.link}>Terms of Service</Link>
        </div>
      </div>
      
      <div className={styles.bottom}>
        &copy; {new Date().getFullYear()} Golden Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
