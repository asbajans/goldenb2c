'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  priceUSD?: string;
  storeName: string;
  imageUrl: string;
  slug: string;
  category?: string;
  isNew?: boolean;
  discountRate?: number;
  discountedPrice?: string;
  discountedPriceUSD?: string;
}

export default function ProductCard({ id, title, price, priceUSD, storeName, imageUrl, slug, category, isNew, discountRate, discountedPrice, discountedPriceUSD }: ProductCardProps) {
  const hasImage = imageUrl && imageUrl !== '/placeholder.jpg' && !imageUrl.startsWith('data:image');

  const locale = useLocale();
  const tc = useTranslations('Common');
  const tp = useTranslations('Products');
  const hasDiscount = discountRate && discountRate > 0 && discountedPriceUSD;
  const displayPriceUSD = hasDiscount ? (discountedPriceUSD || priceUSD) : priceUSD;
  const displayPriceTRY = hasDiscount ? (discountedPrice || price) : price;

  return (
    <Link href={`/${locale}/p/${slug}`} className={styles.card} id={`product-${id}`}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={styles.image}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>✦</span>
          </div>
        )}
        <div className={styles.overlay} />
        <div className={styles.badges}>
          {hasDiscount && <span className={styles.discountBadge}>-%{discountRate}</span>}
          {isNew && <span className={styles.badgeNew}>{tp('newArrival')}</span>}
          {category && <span className={styles.badgeCat}>{category}</span>}
        </div>
        <div className={styles.quickAdd}>
          <span>{tc('viewProduct')}</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.storeInfo}>
          <span className={styles.storeIcon}>🏪</span>
          {storeName}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.priceRow}>
          {hasDiscount ? (
            <>
              <span className={styles.priceUSD}>{displayPriceUSD}</span>
              <span className={styles.oldPriceUSD}>{priceUSD}</span>
            </>
          ) : (
            <span className={styles.priceUSD}>{displayPriceUSD}</span>
          )}
        </div>
        <div className={styles.priceTRY}>{displayPriceTRY}</div>
      </div>
    </Link>
  );
}
