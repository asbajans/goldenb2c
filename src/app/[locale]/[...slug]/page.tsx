import styles from '../coming-soon.module.css';

export default function ComingSoonPage({ params }: { params: { slug?: string[] } }) {
  const path = params?.slug?.join('/') || '';
  
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>⚙️</div>
      <h1 className={styles.title}>Coming Soon</h1>
      <p className={styles.sub}>
        This page is under construction. We&apos;re working on it!
      </p>
      <a href="/" className={styles.back}>← Back to Marketplace</a>
    </div>
  );
}
