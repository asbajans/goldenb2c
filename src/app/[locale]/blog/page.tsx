'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from '../coming-soon.module.css';

export default function BlogPage() {
  const t = useTranslations('Common');

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{t('blog')}</h1>
        <p className={styles.sub}>
          Jewelry trends, gold market insights, seller guides and AI-powered content tips.
        </p>
      </section>

      <section className={styles.section} style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
        <h2>Articles Coming Soon</h2>
        <p>
          We are working on insightful articles about gold market trends, jewelry care tips,
          seller success stories, and AI-powered selling strategies. Subscribe to our newsletter
          to be notified when we publish.
        </p>
        <Link href="/" className={styles.back} style={{ marginTop: '1.5rem' }}>
          ← {t('home')}
        </Link>
      </section>
    </div>
  );
}
