'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './Footer.module.css';

const LINKS = {
  Shop: [
    { key: 'allProducts', href: '/products' },
    { key: 'rings', href: '/categories?type=rings' },
    { key: 'necklaces', href: '/categories?type=necklaces' },
    { key: 'bracelets', href: '/categories?type=bracelets' },
    { key: 'earrings', href: '/categories?type=earrings' },
  ],
  Sellers: [
    { key: 'becomeSeller', href: '/sellers/join' },
    { key: 'browseStores', href: '/sellers' },
  ],
  Company: [
    { key: 'about', href: '/about' },
    { key: 'blog', href: '/blog' },
    { key: 'privacyPolicy', href: '/privacy-policy' },
    { key: 'termsOfService', href: '/terms-of-service' },
  ],
};

export default function Footer() {
  const t = useTranslations('Footer');
  const tCat = useTranslations('Categories');
  const tc = useTranslations('Common');

  return (
    <footer className={styles.footer}>
      {/* Main */}
      <div className={styles.main}>
        <div className={styles.container}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>✦ Golden Crafters</div>
            <p className={styles.tagline}>
              {t('tagline')}
            </p>
            <div className={styles.socials}>
              <a href="https://www.instagram.com/golden.crafters/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialBtn} id="footer-instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://www.youtube.com/channel/UCicnvsbNkEmg3PVtHvu9kkw" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialBtn} id="footer-youtube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <a href="https://goldencrafterscom.etsy.com" target="_blank" rel="noopener noreferrer" aria-label="Etsy" className={styles.socialBtn} id="footer-etsy">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section} className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>{section === 'Shop' ? tc('shop') : section === 'Sellers' ? tc('sellers') : 'Company'}</h4>
              <ul className={styles.linkList}>
                {items.map((item: any) => {
                  const label = item.key === 'allProducts' ? tc('viewAll') : 
                    item.key === 'becomeSeller' ? tc('becomeSeller') : 
                    item.key === 'browseStores' ? tc('sellers') : 
                    item.key === 'about' ? t('aboutUs') : 
                    item.key === 'blog' ? tc('blog') : 
                    item.key === 'privacyPolicy' ? t('privacyPolicy') : 
                    item.key === 'termsOfService' ? t('termsOfService') :
                    tCat(item.key);
                  
                  return (
                    <li key={item.key}>
                      {item.external ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                          {label} ↗
                        </a>
                      ) : (
                        <Link href={item.href} className={styles.footerLink}>
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <p className={styles.copy}>© {new Date().getFullYear()} Golden Crafters Marketplace. {t('allRightsReserved')}</p>
          <div className={styles.badges}>
            <span className={styles.badge}>🔒 {t('securePayment')}</span>
            <span className={styles.badge}>✦ {t('authenticated')}</span>
            <span className={styles.badge}>🌍 {t('globalShipping')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}