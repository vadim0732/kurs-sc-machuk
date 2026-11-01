import { createContext, useState, useEffect } from 'react';
import api from '../api/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // При загрузке проверяем, есть ли токен
    const token = localStorage.getItem('access_token');
    if (token) {
      // В будущем здесь можно запросить /api/auth/me/ чтобы получить данные юзера
      setUser({ token });
    }
    setLoading(false);
  }, []);

const login = async (email, password) => {
  const response = await api.post('/auth/login/', { email, password });
  localStorage.setItem('access_token', response.data.access);
  setUser({ token: response.data.access });
};

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}