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

  const getAuthHeaders = (): HeadersInit => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('gc_token');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  const refreshCart = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/cart', { 
        headers: Object.keys(headers).length > 0 ? headers : undefined 
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
      const authHeaders = getAuthHeaders();
      const headers: HeadersInit = { 'Content-Type': 'application/json', ...authHeaders };
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: Object.keys(headers).length > 1 ? headers : { 'Content-Type': 'application/json' },
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
      const authHeaders = getAuthHeaders();
      const headers: HeadersInit = { 'Content-Type': 'application/json', ...authHeaders };
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: Object.keys(headers).length > 1 ? headers : { 'Content-Type': 'application/json' },
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
      const authHeaders = getAuthHeaders();
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
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
      const authHeaders = getAuthHeaders();
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
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