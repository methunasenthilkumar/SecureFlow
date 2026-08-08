import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, updateProfileApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('upishield_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('upishield_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('upishield_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('upishield_token', res.data.token);
      localStorage.setItem('upishield_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('upishield_token', res.data.token);
      localStorage.setItem('upishield_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const updateProfile = async (updatedData) => {
    const res = await updateProfileApi(updatedData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('upishield_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('upishield_token');
    localStorage.removeItem('upishield_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
