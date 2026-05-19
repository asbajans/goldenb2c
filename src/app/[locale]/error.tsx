'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Errors');
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

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
      <div style={{ fontSize: '4rem' }}>⚠️</div>
      <h1 style={{
        fontSize: '2.5rem',
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        margin: 0,
        background: 'var(--gold-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {t('somethingWentWrong')}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '400px', lineHeight: 1.6 }}>
        {error.message || t('tryAgain')}
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button onClick={reset} style={{
          padding: '0.7rem 1.8rem',
          background: 'var(--gold-gradient)',
          color: '#1a0f00',
          fontWeight: 700,
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          {t('tryAgain')}
        </button>
        <button onClick={() => router.push('/')} style={{
          padding: '0.7rem 1.8rem',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontWeight: 600,
          borderRadius: '9999px',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          ← {t('goHome')}
        </button>
      </div>
    </div>
  );
}
