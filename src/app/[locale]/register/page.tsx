'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.firstName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      });

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem('gc_token', data.accessToken);
        router.push('/account');
      } else if (data.error) {
        setError(data.error.message || 'Registration failed');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.logo}>✦</div>
        <h1 className={styles.title}>Golden Crafters</h1>
        <p className={styles.subtitle}>Create your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              className={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              className={styles.input}
            />
          </div>

          <input
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className={styles.input}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password *"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className={styles.input}
            autoComplete="new-password"
            required
            minLength={6}
          />

          <input
            type="password"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={styles.input}
            autoComplete="new-password"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.terms}>
          By creating an account, you agree to our{' '}
          <Link href="/terms" className={styles.link}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className={styles.link}>Privacy</Link>
        </p>

        <p className={styles.register}>
          Already have an account?{' '}
          <Link href="/login" className={styles.registerLink}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
