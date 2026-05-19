'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
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

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function Header() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const { user, loading, logout } = useAuth();
  const { cart } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>('auto');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fetch categories from API with current language
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?lang=${locale}`);
        const data = await res.json();
        if (data?.data) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, [locale]);

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
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
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
              <button
                type="button"
                onClick={handleSearch}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                aria-label="Search"
              >
                <SearchIcon />
              </button>
              <input
                type="text"
                placeholder="Search jewelry, gold, stores..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
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

            {/* Language Switcher */}
            <div className={`${styles.userMenu} ${styles.langMenu}`} ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                className={styles.iconBtn}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change language"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <GlobeIcon />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{locale.toUpperCase()}</span>
              </button>
              {langMenuOpen && (
                <div className={styles.dropdown} style={{ right: 0, minWidth: '150px' }}>
                  {LANGUAGES.map(lang => (
                    <Link
                      key={lang.code}
                      href={pathname ? pathname.replace(`/${locale}`, `/${lang.code}`) : `/${lang.code}`}
                      className={styles.dropdownItem}
                      onClick={() => setLangMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: locale === lang.code ? 600 : 400
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
          <div className={styles.navCategories}>
            {categories.map(cat => (
              <Link key={cat.id} href={`/${locale}/categories?type=${encodeURIComponent(cat.slug || cat.name)}`} className={styles.catLink}>
                {cat.name}
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
          <div className={styles.mobileCats}>
            {categories.map(cat => (
              <Link key={cat.id} href={`/${locale}/categories?type=${encodeURIComponent(cat.slug || cat.name)}`} className={styles.mobileCat}>{cat.name}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}