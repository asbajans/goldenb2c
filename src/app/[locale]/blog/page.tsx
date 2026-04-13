import styles from '../coming-soon.module.css';

export default function BlogPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>📝</div>
      <h1 className={styles.title}>Blog</h1>
      <p className={styles.sub}>
        Jewelry trends, gold market insights, seller guides and AI-powered content tips. Coming soon!
      </p>
      <a href="/" className={styles.back}>← Back to Marketplace</a>
    </div>
  );
}
