import styles from '../coming-soon.module.css';

export default function AboutPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>🏅</div>
      <h1 className={styles.title}>About Us</h1>
      <p className={styles.sub}>
        Golden Crafters is an AI-powered marketplace connecting independent jewelry makers with customers around the world. We support multi-language, multi-currency and integrate with Google Merchant Center and Instagram Shop.
      </p>
      <a href="/products" className={styles.back}>Explore Products →</a>
    </div>
  );
}
