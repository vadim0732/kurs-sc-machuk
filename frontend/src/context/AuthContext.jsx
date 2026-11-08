import { createContext, useState, useEffect } from 'react';
import api from '../api/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        // Декодируем токен, чтобы достать ID пользователя
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ token, id: payload.user_id });
      } catch (e) {
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    const token = response.data.access;
    localStorage.setItem('access_token', token);
    
    // Достаем ID из токена
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({ token, id: payload.user_id });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/';
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}