'use client';

import { useTranslations } from 'next-intl';
import styles from '../coming-soon.module.css';

export default function PrivacyPolicyPage() {
  const t = useTranslations('Footer');

  return (
    <div className={styles.legal}>
      <h1>{t('privacyPolicy')}</h1>
      <p className={styles.date}>Last updated: May 18, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide when creating an account, placing an order, or contacting us.
        This includes your name, email address, shipping address, phone number, and payment information.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Communicate about your orders and account</li>
        <li>Improve our marketplace and personalize your experience</li>
        <li>Detect and prevent fraud</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>
        We share your information with sellers to fulfill orders, with payment processors to handle transactions,
        and with shipping carriers to deliver packages. We do not sell your personal information to third parties.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We implement industry-standard security measures including SSL encryption, secure data storage,
        and regular security audits. Payment information is processed by PCI-compliant payment processors
        and is never stored on our servers.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You have the right to access, correct, or delete your personal data. You can manage your account
        settings at any time or contact us to request data deletion.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use essential cookies for authentication and cart functionality. Analytics cookies help us
        improve our service. You can control cookie preferences through your browser settings.
      </p>

      <h2>7. Contact</h2>
      <p>
        For privacy-related inquiries, please contact us through our seller panel or email.
      </p>
    </div>
  );
}
