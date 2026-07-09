import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password, role) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoint = role === 'admin' ? '/api/admin/login' : '/api/auth/login';
    const url = baseURL + endpoint;
    console.log('Logging in with URL:', url);
    const response = await axios.post(url, { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    const userObj = { email, role };
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
