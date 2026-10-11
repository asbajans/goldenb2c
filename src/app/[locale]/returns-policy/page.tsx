'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import styles from '../coming-soon.module.css';

interface Policy {
  title: string;
  body: string;
  lang: string;
}

export default function ReturnsPolicyPage() {
  const locale = useLocale();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const res = await fetch(`/api/policies/return?lang=${locale}`);
        if (res.ok) {
          setPolicy(await res.json());
        }
      } catch {
        // silent — fallback text below
      } finally {
        setLoading(false);
      }
    }
    fetchPolicy();
  }, [locale]);

  if (loading) {
    return (
      <div className={styles.legal}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className={styles.legal}>
        <h1>Return &amp; Refund Policy</h1>
        <p>Our return policy is currently unavailable. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className={styles.legal}>
      <h1>{policy.title}</h1>
      {policy.lang !== locale && (
        <p className={styles.date}>Shown in {policy.lang.toUpperCase()} (your language version coming soon)</p>
      )}
      {policy.body.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}
