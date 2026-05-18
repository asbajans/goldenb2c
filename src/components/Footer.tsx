'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslations('Footer');
  const tCat = useTranslations('Categories');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/categories?lang=${locale}`)
      .then(r => r.json())
      .then(d => {
        const cats = d?.data || d || [];
        setCategories(Array.isArray(cats) ? cats.slice(0, 6) : []);
      })
      .catch(() => {});
  }, [locale]);

  const shopLinks = [
    { key: 'allProducts', href: '/products', label: tc('viewAll') },
    ...categories.map((cat: any) => ({
      key: cat.slug || cat.name,
      href: `/${locale}/categories?type=${encodeURIComponent(cat.slug || cat.name)}`,
      label: cat.name,
    })),
  ];

  const sellerLinks = [
    { key: 'becomeSeller', href: '/sellers/join', label: tc('becomeSeller') },
    { key: 'browseStores', href: '/sellers', label: tc('sellers') },
  ];

  const companyLinks = [
    { key: 'about', href: '/about', label: t('aboutUs') },
    { key: 'blog', href: '/blog', label: tc('blog') },
    { key: 'privacyPolicy', href: '/privacy-policy', label: t('privacyPolicy') },
    { key: 'termsOfService', href: '/terms-of-service', label: t('termsOfService') },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <div className={styles.logo}>✦ Golden Crafters</div>
            <p className={styles.tagline}>{t('tagline')}</p>
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

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>{tc('shop')}</h4>
            <ul className={styles.linkList}>
              {shopLinks.map(item => (
                <li key={item.key}>
                  <Link href={item.href} className={styles.footerLink}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>{tc('sellers')}</h4>
            <ul className={styles.linkList}>
              {sellerLinks.map(item => (
                <li key={item.key}>
                  <Link href={item.href} className={styles.footerLink}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Company</h4>
            <ul className={styles.linkList}>
              {companyLinks.map(item => (
                <li key={item.key}>
                  <Link href={item.href} className={styles.footerLink}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

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