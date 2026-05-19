'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('Errors');
  const router = useRouter();

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 2rem',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        404
      </div>
      <h1 style={{ fontSize: '2.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0 }}>{t('notFound')}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '400px', lineHeight: 1.6 }}>{t('somethingWentWrong')}</p>
      <button onClick={() => router.push('/')} style={{
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.7rem 1.8rem',
        background: 'var(--gold-gradient)',
        color: '#1a0f00',
        fontWeight: 700,
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem'
      }}>
        ← {t('goHome')}
      </button>
    </div>
  );
}
