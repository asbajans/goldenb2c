'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('gc_token');
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('Profile updated successfully');
      } else {
        setMessage('Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setMessage('An error occurred');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Account Settings</h1>
        <Link href="/account" className={styles.backBtn}>← Back to Account</Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h2>Profile Information</h2>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={user.email} disabled className={styles.inputDisabled} />
            <span>Email cannot be changed</span>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className={styles.input}
              placeholder="+90..."
            />
          </div>
        </div>

        {message && (
          <div className={message.includes('success') ? styles.success : styles.error}>
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className={styles.dangerZone}>
        <h2>Danger Zone</h2>
        <p>Once you delete your account, there is no going back.</p>
        <button className={styles.deleteBtn}>Delete Account</button>
      </div>
    </div>
  );
}