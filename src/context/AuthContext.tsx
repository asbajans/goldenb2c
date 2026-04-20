'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'seller' | 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('gc_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth?action=me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          setUser({
            id: data.id,
            email: data.email,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone,
            userType: data.userType || 'customer'
          });
        } else {
          setUser(null);
          localStorage.removeItem('gc_token');
        }
      } else {
        setUser(null);
        localStorage.removeItem('gc_token');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth?action=fast-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem('gc_token', data.accessToken);
        await refreshUser();
        return true;
      } else if (data.error) {
        console.error('Login error:', data.error.message);
        return false;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/auth?action=google';
  };

  const logout = () => {
    localStorage.removeItem('gc_token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
