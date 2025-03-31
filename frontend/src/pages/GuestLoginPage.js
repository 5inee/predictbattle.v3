import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './AuthPages.css';

// قائمة الأسماء المحظورة ومشتقاتها
const BANNED_NAMES = [
  // معمر القذافي ومشتقاته
  'القذافي', 'معمر القذافي', 'معمر', 'أبو منيار', 'ابن القذافي', 'عائلة القذافي', 'جماهيرية', 'الثورة الخضراء', 'الكتاب الأخضر', 

  // صدام حسين ومشتقاته
  'صدام', 'صدام حسين', 'ابن صدام', 'حزب البعث', 'البعثي', 'عائلة صدام', 'الرئيس صدام', 'القائد الضرورة', 'المهيب الركن', 'العوجة', 

  // الحجاج بن يوسف ومشتقاته
  'الحجاج', 'الحجاج بن يوسف', 'الحجاج الثقفي', 'ابن يوسف', 'والي العراق', 'سفاح العراق', 'الحاكم الدموي', 'طاغية العراق', 

  // كريستيانو رونالدو ومشتقاته
  'كريستيانو', 'رونالدو', 'كريستيانو رونالدو', 'CR7', 'الدون', 'صاروخ ماديرا', 'CR', 'كريس', 'الأسطورة كريستيانو', 'CRISTIANO', 

  // إضافة بعض الاختصارات المحتملة لمنع التلاعب
  'قذافي', 'معمّر', 'Saddam', 'Hussein', 'Al-Qaddafi', 'Cristiano Ronaldo', 'Don Ronaldo', 'Al-Hajjaj', 'Hajajj'
];


const GuestLoginPage = () => {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, guestLogin, error, setError } = useContext(UserContext);
  const navigate = useNavigate();
  
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
    setUsername(e.target.value);
    setErrorMessage('');
  };
  
  // التحقق من اسم المستخدم إذا كان محظوراً
  const isNameBanned = (name) => {
    // تحويل الاسم إلى حروف صغيرة وإزالة الفراغات للمقارنة
    const normalizedName = name.trim().toLowerCase();
    
    return BANNED_NAMES.some(bannedName => 
      normalizedName.includes(bannedName.toLowerCase()) || 
      bannedName.toLowerCase().includes(normalizedName)
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من إدخال اسم المستخدم
    if (!username) {
      setErrorMessage('يرجى إدخال اسم المستخدم');
      return;
    }
    
    // التحقق من أن الاسم غير محظور
    if (isNameBanned(username)) {
      setErrorMessage('تستهبل انت؟');
      return;
    }
    
    setIsLoading(true);
    
    // محاولة تسجيل الدخول كضيف
    const result = await guestLogin(username);
    
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
            <h2 className="auth-image-title">دخول سريع</h2>
            <p className="auth-image-description">
              ادخل كضيف دون الحاجة لإنشاء حساب كامل
            </p>
          </div>
        </div>
        
        <div className="auth-form">
          <div className="auth-card">
            <h2 className="auth-title">الدخول كضيف</h2>
            
            {errorMessage && (
              <div className="alert alert-error">{errorMessage}</div>
            )}
            
            <form onSubmit={onSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="username">اسم المستخدم</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    value={username}
                    onChange={onChange}
                    placeholder="أدخل اسمك"
                  />
                </div>
                <small className="form-text text-warning">
                  <strong>تنبيه:</strong>الأسماء التالية محظورة: القذافي، صدام، الحجاج، كريستيانو</small>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block auth-btn"
                disabled={isLoading}
              >
                {isLoading ? 'جارِ الدخول...' : 'الدخول كضيف'}
              </button>
            </form>
            
            <div className="auth-separator">
              <span>أو</span>
            </div>
            
            <div className="auth-links">
              <p>
                أفضل إنشاء حساب كامل؟{' '}
                <Link to="/register" className="auth-link">
                  إنشاء حساب
                </Link>
              </p>
              <p>
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="auth-link">
                  تسجيل الدخول
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

export default GuestLoginPage;