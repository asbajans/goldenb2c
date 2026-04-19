'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

interface Cart {
  cartId: string | null;
  items: CartItem[];
  count: number;
  total: number;
  status: string;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const defaultCart: Cart = {
  cartId: null,
  items: [],
  count: 0,
  total: 0,
  status: 'pending'
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCart({
        cartId: data.cartId || null,
        items: data.items || [],
        count: data.count || 0,
        total: data.total || 0,
        status: data.status || 'pending'
      });
    } catch (error) {
      console.error('Cart refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: string, variantId?: string, quantity = 1) => {
    try {
      setLoading(true);
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity })
      });
      const data = await res.json();
      setCart({
        cartId: data.cartId || null,
        items: data.items || [],
        count: data.count || 0,
        total: data.total || 0,
        status: data.status || 'pending'
      });
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Update item error:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/item/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  const clearCart = async () => {
    try {
      await fetch('/api/cart/clear', { method: 'DELETE' });
      setCart(defaultCart);
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export default CartContext;