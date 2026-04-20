'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface CartItem {
  id?: string;
  productId: string;
  variantId?: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  image?: string;
  storeName?: string;
  storeSlug?: string;
  variantName?: string;
  attributes?: Record<string, string>;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  addItem: (productData: CartItem) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

interface Cart {
  cartId: string | null;
  items: CartItem[];
  count: number;
  total: number;
  status: string;
}

const defaultCart: Cart = {
  cartId: null,
  items: [],
  count: 0,
  total: 0,
  status: 'pending'
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [loading, setLoading] = useState(true);

  const saveCart = (newCart: Cart) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_cart', JSON.stringify(newCart));
    }
    setCart(newCart);
  };

  const refreshCart = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const stored = localStorage.getItem('gc_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        const count = parsed.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
        const total = parsed.items?.reduce((sum: number, item: CartItem) => sum + (item.totalPrice || 0), 0) || 0;
        setCart({ ...parsed, count, total });
      }
    } catch (error) {
      console.error('Cart refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productData: CartItem) => {
    setLoading(true);
    
    try {
      const stored = localStorage.getItem('gc_cart');
      let items: CartItem[] = stored ? JSON.parse(stored).items || [] : [];
      
      const existingIndex = items.findIndex(
        item => item.productId === productData.productId && item.variantId === productData.variantId
      );

      if (existingIndex >= 0) {
        items[existingIndex].quantity += productData.quantity || 1;
        items[existingIndex].totalPrice = items[existingIndex].unitPrice * items[existingIndex].quantity;
      } else {
        items.push({
          id: generateId(),
          productId: productData.productId,
          variantId: productData.variantId,
          title: productData.title,
          sku: productData.sku,
          quantity: productData.quantity || 1,
          unitPrice: productData.unitPrice,
          totalPrice: productData.unitPrice * (productData.quantity || 1),
          image: productData.image,
          storeName: productData.storeName,
          storeSlug: productData.storeSlug,
          variantName: productData.variantName,
          attributes: productData.attributes
        });
      }

      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      saveCart({
        cartId: 'local_' + Date.now(),
        items,
        count,
        total,
        status: 'pending'
      });
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const stored = localStorage.getItem('gc_cart');
      if (!stored) return;
      
      let items: CartItem[] = JSON.parse(stored).items || [];
      const index = items.findIndex(item => item.id === itemId);
      
      if (index >= 0) {
        if (quantity <= 0) {
          items.splice(index, 1);
        } else {
          items[index].quantity = quantity;
          items[index].totalPrice = items[index].unitPrice * quantity;
        }
      }

      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      saveCart({
        cartId: 'local_' + Date.now(),
        items,
        count,
        total,
        status: 'pending'
      });
    } catch (error) {
      console.error('Update item error:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const stored = localStorage.getItem('gc_cart');
      if (!stored) return;
      
      let items: CartItem[] = JSON.parse(stored).items || [];
      items = items.filter(item => item.id !== itemId);

      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      saveCart({
        cartId: 'local_' + Date.now(),
        items,
        count,
        total,
        status: 'pending'
      });
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  const clearCart = async () => {
    saveCart(defaultCart);
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