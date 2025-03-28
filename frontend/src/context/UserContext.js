import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

// إنشاء سياق المستخدم
export const UserContext = createContext();

// إنشاء مزود السياق
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // التحقق من وجود توكن في التخزين المحلي عند تحميل التطبيق
    const loadUser = async () => {
      const token = localStorage.getItem('userToken');
      
      if (token) {
        try {
          // تكوين الهيدر
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          // جلب بيانات المستخدم
          const { data } = await axios.get(`${config.API_URL}/users/profile`, config);
          
          setUser({
            ...data,
            token
          });
        } catch (error) {
          localStorage.removeItem('userToken');
          console.error('فشل في تحميل المستخدم:', error);
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // تسجيل المستخدم
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.API_URL}/users/register`, userData);
      
      // حفظ التوكن في التخزين المحلي
      localStorage.setItem('userToken', data.token);
      
      // تحديث حالة المستخدم
      setUser(data);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'حدث خطأ أثناء تسجيل المستخدم');
      return { success: false, error: error.response?.data?.message || 'حدث خطأ أثناء تسجيل المستخدم' };
    }
  };

  // تسجيل الدخول
  const loginUser = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.API_URL}/users/login`, userData);
      
      // حفظ التوكن في التخزين المحلي
      localStorage.setItem('userToken', data.token);
      
      // تحديث حالة المستخدم
      setUser(data);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
      return { success: false, error: error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  // تسجيل الدخول كضيف
  const guestLogin = async (username) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.API_URL}/users/guest`, { username });
      
      // حفظ التوكن في التخزين المحلي
      localStorage.setItem('userToken', data.token);
      
      // تحديث حالة المستخدم
      setUser(data);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول كضيف');
      return { success: false, error: error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول كضيف' };
    }
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      error,
      registerUser,
      loginUser,
      guestLogin,
      logout,
      setError
    }}>
      {children}
    </UserContext.Provider>
  );
};