'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

type Theme = 'light' | 'dark' | 'auto';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const AutoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="9"/><path d="M12 3v9l4 4"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

export default function Header() {
  const { user, loading, logout } = useAuth();
  const { cart } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>('auto');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cycleTheme = () => {
    setTheme(t => t === 'auto' ? 'light' : t === 'light' ? 'dark' : 'auto');
  };

  const ThemeLabel = { auto: <AutoIcon />, light: <SunIcon />, dark: <MoonIcon /> }[theme];
  const ThemeTooltip = { auto: 'System', light: 'Light', dark: 'Dark' }[theme];

  const navLinks = [
    { href: '/products', label: 'Shop' },
    { href: '/categories', label: 'Categories' },
    { href: '/sellers', label: 'Sellers' },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.topBar}>
        <div className={styles.container}>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoGold}>✦ Golden</span>
            <span className={styles.logoCrafters}> Crafters</span>
          </Link>

          {/* Center Search */}
          <div className={`${styles.searchWrap} ${searchOpen ? styles.searchActive : ''}`}>
            <div className={styles.searchBox}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search jewelry, gold, stores..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                id="header-search"
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Mobile search toggle */}
            <button
              id="btn-search-toggle"
              className={`${styles.iconBtn} ${styles.mobileSearch}`}
              onClick={() => setSearchOpen(o => !o)}
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            {/* Theme toggle */}
            <button
              id="btn-theme-toggle"
              className={styles.themeBtn}
              onClick={cycleTheme}
              title={`Theme: ${ThemeTooltip}`}
              aria-label={`Switch theme, current: ${ThemeTooltip}`}
            >
              {ThemeLabel}
              <span className={styles.themeBadge}>{ThemeTooltip}</span>
            </button>

            {/* Cart */}
            <Link href="/cart" id="btn-cart" className={styles.iconBtn} aria-label="Cart">
              <CartIcon />
              {cart.count > 0 && <span className={styles.cartCount}>{cart.count > 99 ? '99+' : cart.count}</span>}
            </Link>

            {/* User / Login */}
            {loading ? (
              <div className={styles.iconBtn} style={{ width: 38, height: 38 }}>
                <div className={styles.spinner} style={{ width: 18, height: 18 }} />
              </div>
            ) : user ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button 
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                >
                  <div className={styles.avatar}>
                    {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <ChevronIcon />
                </button>
                {userMenuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/account" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      My Account
                    </Link>
                    <Link href="/account/orders" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      My Orders
                    </Link>
                    <Link href="/account/addresses" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      Addresses
                    </Link>
                    <Link href="/account/wishlist" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      Wishlist
                    </Link>
                    <Link href="/account/settings" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      Settings
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem + ' ' + styles.logoutBtn} onClick={logout}>
                      <LogoutIcon /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" id="btn-login" className={styles.loginBtn}>
                Sign In
              </Link>
            )}

            {/* Seller CTA */}
            <Link href="/sellers/join" id="btn-join-seller" className={styles.ctaBtn}>
              Become a Seller
            </Link>

            {/* Mobile hamburger */}
            <button
              id="btn-mobile-menu"
              className={styles.hamburger}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Nav Bar */}
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.navLinks}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname?.includes(link.href) ? styles.active : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className={styles.navCategories}>
            {['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Pendants', 'Sets'].map(cat => (
              <Link key={cat} href={`/categories?type=${cat.toLowerCase()}`} className={styles.catLink}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileSearchBox}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
          </div>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.mobileLink}>{link.label}</Link>
          ))}
          <div className={styles.mobileCats}>
            {['Rings', 'Necklaces', 'Bracelets', 'Earrings'].map(c => (
              <Link key={c} href={`/categories?type=${c.toLowerCase()}`} className={styles.mobileCat}>{c}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
