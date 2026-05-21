import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem('quickfit_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data.user);
      } catch {
        localStorage.removeItem('quickfit_token');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const { data } = await api.post('/auth/login', payload);
        localStorage.setItem('quickfit_token', data.token);
        setUser(data.user);
      },
      async register(payload) {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('quickfit_token', data.token);
        setUser(data.user);
      },
      async updateProfile(payload) {
        const { data } = await api.put('/auth/profile', payload);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem('quickfit_token');
        setUser(null);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
