import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  // إذا كان التحميل جارٍ، عرض مؤشر التحميل
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جارِ التحميل...</p>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجلاً، التوجيه إلى صفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login" />;
  }

  // إذا كان المستخدم مسجلاً، السماح بالوصول إلى المحتوى
  return children;
};

export default PrivateRoute;