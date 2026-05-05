'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCart } from '@/context/CartContext';
import styles from './cart.module.css';

export default function CartPage() {
  const t = useTranslations('Cart');
  const tc = useTranslations('Common');
  
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>{tc('loading')}</p>
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🛒</div>
        <h1>{t('emptyCart')}</h1>
        <p>Discover beautiful gold jewelry in our marketplace.</p>
        <Link href="/products" className={styles.shopBtn}>{tc('continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('title')}</h1>
      
      <div className={styles.layout}>
        <div className={styles.items}>
          {cart.items.map((item: any) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemImage}>
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill sizes="120px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.placeholder}>✦</div>
                )}
              </div>
              
              <div className={styles.itemInfo}>
                {item.storeName && (
                  <p className={styles.storeName}>🏪 {item.storeName}</p>
                )}
                <Link href={`/p/${item.productId}`} className={styles.itemTitle}>
                  {item.title}
                </Link>
                {item.variantName && (
                  <p className={styles.variant}>{item.variantName}</p>
                )}
                <p className={styles.itemSku}>SKU: {item.sku}</p>
                <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                  {t('remove')}
                </button>
              </div>
              
              <div className={styles.itemQty}>
                <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
              </div>
              
              <div className={styles.itemPrice}>
                <div className={styles.unitPrice}>₺{Number(item.unitPrice).toLocaleString('tr-TR')}</div>
                <div className={styles.totalPrice}>₺{Number(item.totalPrice).toLocaleString('tr-TR')}</div>
              </div>
            </div>
          ))}
          
          <button onClick={clearCart} className={styles.clearBtn}>
            {t('emptyCart')}
          </button>
        </div>
        
        <div className={styles.summary}>
          <h2>{t('orderSummary')}</h2>
          
          <div className={styles.summaryRow}>
            <span>{t('subtotal')} ({cart.count} {t('itemTotal').toLowerCase()})</span>
            <span>₺{Number(cart.total).toLocaleString('tr-TR')}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>{t('shipping')}</span>
            <span>Calculated at checkout</span>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.summaryRow + ' ' + styles.total}>
            <span>{t('total')}</span>
            <span>₺{Number(cart.total).toLocaleString('tr-TR')}</span>
          </div>
          
          <Link href="/checkout" className={styles.checkoutBtn}>
            {t('proceedToCheckout')}
          </Link>
          
          <div className={styles.secure}>
            <span>🔒 {tc('securePayment')}</span>
            <span>Multiple Payment Options</span>
          </div>
        </div>
      </div>
    </div>
  );
}