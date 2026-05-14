'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import TrackingProvider from './TrackingProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <TrackingProvider>{children}</TrackingProvider>
      </CartProvider>
    </AuthProvider>
  );
}