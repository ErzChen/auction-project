import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { User } from '../constants/types';

export function AuthProvider({ children } : { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/me`, { credentials: 'include' });
        setUser(res.ok ? await res.json() : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  async function logout() {
    await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}