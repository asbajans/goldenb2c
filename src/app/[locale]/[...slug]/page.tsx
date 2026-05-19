'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import styles from '../coming-soon.module.css';

export default function NotFoundPage() {
  const t = useTranslations('Errors');
  const router = useRouter();

  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>404</div>
      <h1 className={styles.title}>{t('notFound')}</h1>
      <p className={styles.sub}>{t('somethingWentWrong')}</p>
      <button onClick={() => router.push('/')} className={styles.back}>
        ← {t('goHome')}
      </button>
    </div>
  );
}
