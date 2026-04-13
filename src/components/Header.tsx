import { Link } from '@/i18n/routing';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          GOLDEN
        </Link>

        <nav className={styles.nav}>
          <Link href="/products" className={styles.navLink}>Products</Link>
          <Link href="/categories" className={styles.navLink}>Categories</Link>
          <Link href="/sellers" className={styles.navLink}>Stores</Link>
        </nav>

        <div className={styles.actions}>
          <button className={styles.btn}>Connect</button>
        </div>
      </div>
    </header>
  );
}
