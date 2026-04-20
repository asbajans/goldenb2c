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

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gc_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refreshCart = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/cart', { headers });
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
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'add', productId, variantId, quantity })
      });
      const data = await res.json();
      if (res.ok) {
        setCart({
          cartId: data.cartId || null,
          items: data.items || [],
          count: data.count || 0,
          total: data.total || 0,
          status: data.status || 'pending'
        });
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ itemId, quantity })
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
      const headers = getAuthHeaders();
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ itemId })
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  const clearCart = async () => {
    try {
      const headers = { ...getAuthHeaders() };
      await fetch('/api/cart', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ action: 'clear' })
      });
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