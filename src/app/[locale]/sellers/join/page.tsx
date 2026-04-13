import styles from '../../coming-soon.module.css';

export default function JoinSellerPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>✦</div>
      <h1 className={styles.title}>Become a Seller</h1>
      <p className={styles.sub}>
        Join our growing community of independent jewelers. Create your store, list your products, and reach customers worldwide with AI-powered content.
      </p>
      <a href="https://seller.asb.web.tr" className={styles.back} target="_blank" rel="noopener noreferrer">
        Go to Seller Panel ↗
      </a>
    </div>
  );
}
