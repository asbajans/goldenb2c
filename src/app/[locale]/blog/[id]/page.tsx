'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './detail.module.css';

const SITE_URL = 'https://goldencrafters.com';

export default function BlogDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('Common');
  const id = params?.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.blog_posts) {
          try {
            const items = JSON.parse(data.blog_posts);
            const found = items.find((p: any) => String(p.id) === id && p.isActive !== false);
            setPost(found || null);
          } catch { setPost(null); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingState}>Loading...</div>
    </div>
  );

  if (!post) return (
    <div className={styles.page}>
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>📝</div>
        <h1>Post Not Found</h1>
        <p>The blog post you are looking for does not exist.</p>
        <Link href="/blog" className={styles.backBtn}>← Back to Blog</Link>
      </div>
    </div>
  );

  const tr = post.translations?.[locale] || post.translations?.en || {};
  const postUrl = `${SITE_URL}/${locale}/blog/${id}`;

  return (
    <div className={styles.page}>
      <Link href="/blog" className={styles.breadcrumb}>← {t('blog')}</Link>

      <article className={styles.article}>
        {post.imageUrl && (
          <img src={post.imageUrl} alt={tr.title || ''} className={styles.image} />
        )}

        <h1 className={styles.title}>{tr.title || ''}</h1>

        {tr.excerpt && <p className={styles.excerpt}>{tr.excerpt}</p>}

        {tr.content && <div className={styles.content}>{tr.content}</div>}

        {/* Share */}
        <div className={styles.share}>
          <span className={styles.shareLabel}>Share this article</span>
          <div className={styles.shareBtns}>
            <button className={styles.shareBtn} onClick={() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(`${tr.title} - ${postUrl}`)}`, '_blank', 'noopener,noreferrer');
            }} aria-label="Share on WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button className={styles.shareBtn} onClick={() => {
              window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}&media=${encodeURIComponent(post.imageUrl || '')}&description=${encodeURIComponent(tr.title || '')}`, '_blank', 'noopener,noreferrer');
            }} aria-label="Share on Pinterest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.972-5.365 11.972-11.986C23.971 5.367 18.607 0 12.017 0z"/></svg>
            </button>
            <button className={styles.shareBtn} onClick={() => {
              if (navigator.share) {
                navigator.share({ title: tr.title, text: `${tr.title} - ${postUrl}`, url: postUrl });
              } else {
                navigator.clipboard?.writeText(postUrl);
              }
            }} aria-label="Share">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
