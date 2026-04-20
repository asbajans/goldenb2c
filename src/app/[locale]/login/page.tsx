'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      const GoogleAuthInstance = (window as any).google?.accounts?.id;
      if (GoogleAuthInstance) {
        GoogleAuthInstance.prompt();
      } else {
        setError('Google authentication loading... Try again in a moment.');
      }
    } else {
      setError('Google authentication not configured. Please use email login below.');
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem('gc_token', data.accessToken);
        window.location.href = '/account';
      } else if (data.error) {
        setError(data.error.message || 'Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFastSignup = async () => {
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth?action=fast-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem('gc_token', data.accessToken);
        window.location.href = '/account';
      } else if (data.error) {
        setError(data.error.message || 'An error occurred');
      } else {
        setError('Login failed. Please try again.');
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
        <p className={styles.subtitle}>Sign in to your account</p>

        <button onClick={handleGoogleLogin} className={styles.googleBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className={styles.input}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className={styles.input}
            autoComplete="current-password"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.forgotLink}>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>

        <p className={styles.terms}>
          By continuing, you agree to our{' '}
          <Link href="/terms" className={styles.link}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className={styles.link}>Privacy</Link>
        </p>

        <p className={styles.register}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={styles.registerLink}>Create one</Link>
        </p>
      </div>
    </main>
  );
}