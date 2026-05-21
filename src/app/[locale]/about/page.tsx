'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './about.module.css';

export default function AboutPage() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const [content, setContent] = useState<{ title: string; subtitle: string; description: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setContent({
          title: data[`about_title_${locale}`] || data.about_title_en || '',
          subtitle: data[`about_subtitle_${locale}`] || data.about_subtitle_en || '',
          description: data[`about_desc_${locale}`] || data.about_desc_en || '',
        });
      })
      .catch(() => {});
  }, [locale]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{content?.title || t('aboutUs')}</h1>
        <p className={styles.sub}>{content?.subtitle || t('tagline')}</p>
      </section>

      {(content?.description) ? (
        <section className={styles.section}>
          <div className={styles.content}>{content.description}</div>
        </section>
      ) : (
        <>
          <section className={styles.section}>
            <h2>Our Mission</h2>
            <p>
              Golden Crafters was founded to empower independent jewelry makers by giving them a global stage. 
              We combine cutting-edge AI technology with the timeless craft of goldsmithing to create a marketplace 
              where authenticity meets innovation.
            </p>
          </section>

          <section className={styles.section}>
            <h2>What Makes Us Different</h2>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardIcon}>🤖</div>
                <h3>AI-Powered Discovery</h3>
                <p>Our AI curates personalized product recommendations and generates multi-language content automatically.</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardIcon}>🌍</div>
                <h3>Global Reach</h3>
                <p>We support 6 languages, multiple currencies, and integrate with Google Merchant Center and Instagram Shop.</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardIcon}>🔗</div>
                <h3>Multi-Channel Selling</h3>
                <p>Sellers can sync their inventory across Etsy, Amazon, Trendyol, and more — all from one dashboard.</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardIcon}>✨</div>
                <h3>100% Authentic Gold</h3>
                <p>Every piece is verified for gold purity and quality, giving buyers complete peace of mind.</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Our Technology</h2>
            <p>
              Built on a modern stack with AI integration at its core, Golden Crafters automates everything from 
              product listing translations to pricing based on real-time gold market rates. Our platform connects 
              independent sellers with buyers across the globe through an intelligent, seamless experience.
            </p>
          </section>
        </>
      )}

      <div className={styles.cta}>
        <Link href="/products" className={styles.back}>Explore Products →</Link>
      </div>
    </div>
  );
}
