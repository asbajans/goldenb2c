'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from './cart.module.css';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading cart...</p>
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🛒</div>
        <h1>Your cart is empty</h1>
        <p>Discover beautiful gold jewelry in our marketplace.</p>
        <Link href="/products" className={styles.shopBtn}>Browse Products</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Shopping Cart</h1>
      
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
                <Link href={`/p/${item.sku}`} className={styles.itemTitle}>
                  {item.title}
                </Link>
                <p className={styles.itemSku}>SKU: {item.sku}</p>
                <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                  Remove
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
            Clear Cart
          </button>
        </div>
        
        <div className={styles.summary}>
          <h2>Order Summary</h2>
          
          <div className={styles.summaryRow}>
            <span>Subtotal ({cart.count} items)</span>
            <span>₺{Number(cart.total).toLocaleString('tr-TR')}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.summaryRow + ' ' + styles.total}>
            <span>Total</span>
            <span>₺{Number(cart.total).toLocaleString('tr-TR')}</span>
          </div>
          
          <Link href="/checkout" className={styles.checkoutBtn}>
            Proceed to Checkout
          </Link>
          
          <div className={styles.secure}>
            <span>🔒 Secure Checkout</span>
            <span>Multiple Payment Options</span>
          </div>
        </div>
      </div>
    </div>
  );
}