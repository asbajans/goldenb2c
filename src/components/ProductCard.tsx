import { Link } from '@/i18n/routing';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  storeName: string;
  imageUrl: string;
  slug: string;
}

export default function ProductCard({ id, title, price, storeName, imageUrl, slug }: ProductCardProps) {
  return (
    <Link href={`/p/${slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={title} className={styles.image} />
        <div className={styles.badges}>
          <span className={styles.badge}>New</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.storeInfo}>{storeName}</div>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.price}>{price}</div>
      </div>
    </Link>
  );
}
