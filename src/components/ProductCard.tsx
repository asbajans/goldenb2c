import Link from 'next/link';
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
}

export default function ProductCard({ id, title, price, priceUSD, storeName, imageUrl, slug, category, isNew }: ProductCardProps) {
  const hasImage = imageUrl && imageUrl !== '/placeholder.jpg' && !imageUrl.startsWith('data:image');
  
  return (
    <Link href={`/p/${slug}`} className={styles.card} id={`product-${id}`}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>✦</span>
          </div>
        )}
        <div className={styles.overlay} />
        <div className={styles.badges}>
          {isNew && <span className={styles.badgeNew}>New</span>}
          {category && <span className={styles.badgeCat}>{category}</span>}
        </div>
        <div className={styles.quickAdd}>
          <span>View Details</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.storeInfo}>
          <span className={styles.storeIcon}>🏪</span>
          {storeName}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.priceRow}>
          <span className={styles.price}>{price}</span>
          {priceUSD && <span className={styles.priceUSD}>{priceUSD}</span>}
        </div>
      </div>
    </Link>
  );
}
