import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './HomePage.css';

const HomePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // إذا كان المستخدم مسجلاً، توجيهه إلى لوحة التحكم
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="welcome-card fade-in">
          <div className="welcome-header">
            <h1 className="welcome-title">مرحبًا بك في PredictBattle</h1>
            <p className="welcome-subtitle">منصة توقعات تفاعلية للمجموعات</p>
          </div>
          
          <div className="welcome-content">
            <p>
              شارك مع أصدقائك وزملائك في تحديات تتنبأ فيها بالمستقبل في مختلف المجالات.
              قم بإنشاء جلسات توقع، وادعو المشاركين، وقارن توقعاتكم في واجهة سهلة ومبهجة.
            </p>
          </div>
          
          <div className="welcome-actions">
            <Link to="/login" className="btn btn-primary btn-block mb-2">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="btn btn-secondary btn-block mb-2">
              إنشاء حساب
            </Link>
            <Link to="/guest" className="btn btn-text btn-block">
              الدخول كضيف
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;