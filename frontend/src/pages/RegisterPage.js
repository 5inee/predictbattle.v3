import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, registerUser, error, setError } = useContext(UserContext);
  const navigate = useNavigate();
  
  const { username, password, confirmPassword } = formData;
  
  // إذا كان المستخدم مسجلاً، توجيهه إلى لوحة التحكم
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    
    // مسح أي أخطاء سابقة
    return () => {
      if (error) {
        setError(null);
      }
    };
  }, [user, navigate, error, setError]);
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من إدخال جميع البيانات
    if (!username || !password || !confirmPassword) {
      setErrorMessage('لازم تكتب كل البيانات المطلوبة');
      return;
    }
    
    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
      setErrorMessage('الباسووردين مو زي بعض');
      return;
    }
    
    // التحقق من طول الباسوورد
    if (password.length < 6) {
      setErrorMessage('الباسوورد يجب أن يكون على الأقل 6 أحرف');
      return;
    }
    
    // ضبط حالة التحميل
    setIsLoading(true);
    
    // محاولة إنشاء الحساب
    const result = await registerUser({ username, password });
    
    setIsLoading(false);
    
    if (result.error) {
      setErrorMessage(result.error);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <div className="auth-image-content">
            <h2 className="auth-image-title">صفحة إنشاء حساب</h2>
            <p className="auth-image-description">
              سوي حسابك وابدا من هنا
            </p>
          </div>
        </div>
        
        <div className="auth-form">
          <div className="auth-card">
            <h2 className="auth-title">إنشاء حساب</h2>
            
            {errorMessage && (
              <div className="alert alert-error">{errorMessage}</div>
            )}
            
            <form onSubmit={onSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="username">اليوزر</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    value={username}
                    onChange={onChange}
                    placeholder="اكتب يوزرك"
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label" htmlFor="password">الباسوورد</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={password}
                    onChange={onChange}
                    placeholder="اكتب الباسوورد (6 أحرف على الأقل)"
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">تأكيد الباسوورد</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    value={confirmPassword}
                    onChange={onChange}
                    placeholder="اكتب الباسوورد مرة ثانية"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block auth-btn"
                disabled={isLoading}
              >
                {isLoading ? 'جارِ إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </form>
            
            <div className="auth-links">
              <p>
                عندك حساب أصلاً؟{' '}
                <Link to="/login" className="auth-link">
                  تسجيل الدخول
                </Link>
              </p>
               <p>
                              ما تبي تسوي حساب؟ {' '}
                              <Link to="/guest" className="auth-link">
                                الدخول كجيست
                              </Link>
                            </p>
              <p>
                <Link to="/" className="auth-link">
                  العودة للصفحة الرئيسية
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;