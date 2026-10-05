'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './blog.module.css';

export default function BlogPage() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.blog_posts) {
          try {
            const items = JSON.parse(data.blog_posts);
            setPosts(items.filter((p: any) => p.isActive !== false));
          } catch { setPosts([]); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{t('blog')}</h1>
        <p className={styles.sub}>
          Jewelry trends, gold market insights, seller guides and AI-powered content tips.
        </p>
      </section>

      <section className={styles.section}>
        <div className="container">
          {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>}
          {!loading && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h2>Articles Coming Soon</h2>
              <p>
                We are working on insightful articles about gold market trends, jewelry care tips,
                seller success stories, and AI-powered selling strategies.
              </p>
              <Link href="/" className={styles.back} style={{ marginTop: '1.5rem' }}>
                ← {t('home')}
              </Link>
            </div>
          )}
          {!loading && posts.length > 0 && (
            <div className={styles.grid}>
              {posts
                // Newest first (post ids are creation timestamps)
                .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
                .map(post => {
                  const tr = post.translations?.[locale] || post.translations?.en || {};
                  // NOTE: routing Link auto-prefixes the locale — do NOT add
                  // `/${locale}` manually (it produced /tr/tr/blog/... 404s).
                  return (
                    <Link key={post.id} href={`/blog/${post.id}`} className={styles.card}>
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt={tr.title || ''} className={styles.cardImage} loading="lazy" />
                      )}
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{tr.title || ''}</h3>
                        {tr.excerpt && <p className={styles.cardExcerpt}>{tr.excerpt}</p>}
                        <span className={styles.readMore}>{t('readMore')} →</span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
