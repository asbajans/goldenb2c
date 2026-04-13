import Link from 'next/link';
import styles from './Footer.module.css';

const LINKS = {
  Shop: ['All Products', 'Rings', 'Necklaces', 'Bracelets', 'Earrings'],
  Sellers: ['Become a Seller', 'Seller Panel', 'Google Merchant', 'Instagram Shop'],
  Company: ['About', 'Blog', 'Privacy Policy', 'Terms of Service'],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Main */}
      <div className={styles.main}>
        <div className={styles.container}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>✦ Golden Crafters</div>
            <p className={styles.tagline}>
              AI-powered marketplace for independent jewelers. Authentic gold. Global reach.
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="Instagram" className={styles.socialBtn} id="footer-instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className={styles.socialBtn} id="footer-twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" aria-label="Pinterest" className={styles.socialBtn} id="footer-pinterest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.23-5.22 1.23-5.22s-.31-.63-.31-1.56c0-1.46.85-2.55 1.9-2.55.9 0 1.33.67 1.33 1.48 0 .9-.58 2.26-.87 3.51-.25 1.05.52 1.9 1.54 1.9 1.85 0 3.27-1.95 3.27-4.76 0-2.49-1.79-4.23-4.34-4.23-2.96 0-4.7 2.22-4.7 4.51 0 .89.34 1.85.77 2.37.08.1.09.19.07.29-.08.33-.25 1.05-.29 1.19-.05.19-.16.23-.37.14-1.39-.65-2.26-2.68-2.26-4.32 0-3.51 2.55-6.74 7.36-6.74 3.86 0 6.86 2.75 6.86 6.42 0 3.83-2.41 6.9-5.76 6.9-1.13 0-2.19-.59-2.55-1.28l-.69 2.59c-.25.97-.93 2.18-1.39 2.92.05.01.1.01.15.01.34 0 .68-.04 1-.1C17.52 21.86 22 17.41 22 12c0-5.52-4.48-10-10-10z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section} className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>{section}</h4>
              <ul className={styles.linkList}>
                {items.map(item => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className={styles.footerLink}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <p className={styles.copy}>© {new Date().getFullYear()} Golden Crafters Marketplace. All rights reserved.</p>
          <div className={styles.badges}>
            <span className={styles.badge}>🔒 SSL Secure</span>
            <span className={styles.badge}>✦ 100% Authentic</span>
            <span className={styles.badge}>🌍 Global Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
