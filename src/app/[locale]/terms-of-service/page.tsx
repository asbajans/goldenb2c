'use client';

import { useTranslations } from 'next-intl';
import styles from '../coming-soon.module.css';

export default function TermsOfServicePage() {
  const t = useTranslations('Footer');

  return (
    <div className={styles.legal}>
      <h1>{t('termsOfService')}</h1>
      <p className={styles.date}>Last updated: May 18, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using Golden Crafters Marketplace, you agree to be bound by these Terms of Service.
        If you do not agree, please do not use our platform.
      </p>

      <h2>2. Marketplace Role</h2>
      <p>
        Golden Crafters acts as a marketplace connecting independent sellers with buyers. We facilitate
        transactions but are not a party to the sale agreement between seller and buyer. Each seller
        is responsible for their listings, product quality, and fulfillment.
      </p>

      <h2>3. Seller Obligations</h2>
      <ul>
        <li>Provide accurate product descriptions and gold purity information</li>
        <li>Fulfill orders in a timely manner</li>
        <li>Comply with all applicable laws and regulations</li>
        <li>Maintain truthful representations of gold weight, purity, and authenticity</li>
      </ul>

      <h2>4. Buyer Obligations</h2>
      <ul>
        <li>Provide accurate shipping and payment information</li>
        <li>Complete payment for orders placed</li>
        <li>Comply with return and refund policies</li>
      </ul>

      <h2>5. Pricing & Payments</h2>
      <p>
        Product prices are determined by sellers based on gold weight, purity, market rates, and profit margin.
        All payments are processed securely through our payment partners. Prices are displayed in TRY and USD.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        Content on Golden Crafters, including trademarks, logos, and platform design, is owned by
        Golden Crafters Marketplace. Seller product images and descriptions remain the property
        of the respective sellers.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        Golden Crafters provides the platform &quot;as is&quot; and is not liable for disputes between
        buyers and sellers, product defects, or shipping issues beyond our reasonable control.
      </p>

      <h2>8. Termination</h2>
      <p>
        We reserve the right to suspend or terminate accounts that violate these terms or engage
        in fraudulent activity. Sellers may terminate their account with 30 days notice.
      </p>

      <h2>9. Changes to Terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the platform after changes
        constitutes acceptance of the new terms.
      </p>
    </div>
  );
}
