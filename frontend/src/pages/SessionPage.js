import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import PredictionItem from '../components/PredictionItem';
import config from '../config';
import './SessionPage.css';

const SessionPage = () => {
  const [session, setSession] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { id } = useParams();
  const { user } = useContext(UserContext);
  
  // جلب بيانات الجلسة مع استخدام useCallback
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      
      // تكوين الهيدر
      const headers = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      // جلب البيانات
      const { data } = await axios.get(`${config.API_URL}/sessions/${id}`, headers);
      
      setSession(data.session);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب بيانات الجلسة:', error);
      setErrorMessage('حدث خطأ أثناء جلب بيانات الجلسة');
      setLoading(false);
    }
  }, [id, user.token]);
  
  // تحميل البيانات عند تحميل الصفحة أو تغيير مفتاح التحديث
  useEffect(() => {
    fetchSession();
  }, [fetchSession, refreshKey]);
  
  // التحقق من أن المستخدم قدم توقعًا بالفعل
  const hasSubmittedPrediction = () => {
    if (!session || !session.predictions) return false;
    
    const hasSubmitted = session.predictions.some(
      prediction => prediction.user._id === user._id
    );
    
    return hasSubmitted;
  };
  
  // نسخ كود الجلسة
  const copySessionCode = () => {
    if (!session) return;
    
    navigator.clipboard.writeText(session.code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('فشل في نسخ النص:', err);
      });
  };
  
  // معالجة تقديم التوقع
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من إدخال التوقع
    if (!prediction.trim()) {
      setErrorMessage('يرجى إدخال توقعك');
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMessage('');
      
      // تكوين الهيدر
      const headers = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      // إرسال التوقع
      const { data } = await axios.post(
        `${config.API_URL}/sessions/predict`,
        { sessionId: id, text: prediction },
        headers
      );
      
      // تحديث الجلسة المحلية
      setSession(data.session);
      setSuccessMessage('تم إرسال توقعك بنجاح');
      setPrediction('');
      setSubmitting(false);
      
      // تحديث مفتاح التحديث لإجبار الصفحة على إعادة التحميل
      setRefreshKey(oldKey => oldKey + 1);
      
      // إعادة جلب بيانات الجلسة للتأكد من استلام أحدث البيانات
      setTimeout(() => {
        fetchSession();
      }, 500);
    } catch (error) {
      console.error('خطأ في إرسال التوقع:', error);
      setErrorMessage(error.response?.data?.message || 'حدث خطأ أثناء إرسال التوقع');
      setSubmitting(false);
    }
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">جارِ تحميل بيانات الجلسة...</p>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>خطأ في تحميل الجلسة</h2>
        <p>{errorMessage}</p>
        <Link to="/dashboard" className="btn btn-primary">
          العودة إلى لوحة التحكم
        </Link>
      </div>
    );
  }

  // هل قدم المستخدم الحالي توقعه
  const userHasPredicted = hasSubmittedPrediction();
  
  return (
    <div className="session-page">
      <div className="session-header">
        <h1 className="session-title">{session.title}</h1>
        
        <div className="session-meta">
          <div className="session-code-container">
            <span className="meta-label">كود الجلسة:</span>
            <span className="session-code">{session.code}</span>
            <button 
              className="copy-btn" 
              onClick={copySessionCode}
              title="نسخ الكود"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          
          <div className="session-info date">
            <span className="meta-label">تاريخ الإنشاء:</span>
            <span>{formatDate(session.createdAt)}</span>
          </div>
          
          <div className="session-info participants">
            <span className="meta-label">المشاركون:</span>
            <span>{session.participants.length}/{session.maxPlayers}</span>
          </div>
          
          <div className="session-status-container">
            <span className="meta-label">الحالة:</span>
            <span className={`session-status ${session.isComplete ? 'complete' : 'active'}`}>
              {session.isComplete ? 'مكتملة' : 'نشطة'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="session-content">
        {/* عرض نموذج التوقع إذا لم يكن المستخدم قد قدم توقعًا بعد */}
        {!userHasPredicted && (
          <div className="prediction-form-container">
            <h2 className="section-title prediction">أدخل توقعك</h2>
            
            {errorMessage && (
              <div className="alert alert-error">{errorMessage}</div>
            )}
            
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            
            <form onSubmit={handleSubmit} className="prediction-form">
              <div className="form-group">
                <textarea
                  className="form-control prediction-textarea"
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder="اكتب توقعك هنا..."
                  rows={4}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary submit-prediction-btn"
                disabled={submitting}
              >
                {submitting ? 'جارِ الإرسال...' : 'إرسال التوقع'}
              </button>
            </form>
            
            {/* رسالة إخبارية للمستخدم بضرورة إرسال التوقع أولاً */}
            <div className="alert-info mt-4">
              يجب عليك إرسال توقعك أولاً قبل أن تتمكن من مشاهدة توقعات المشاركين الآخرين
            </div>
          </div>
        )}
        
        {/* عرض التوقعات فقط إذا كان المستخدم قد قدم توقعًا */}
        {userHasPredicted && (
          <div className="predictions-container">
            <h2 className="section-title predictions">
              التوقعات
              <span className="predictions-count">
                {session.predictions.length}/{session.maxPlayers}
              </span>
            </h2>
            
            {session.predictions.length === 0 ? (
              <div className="empty-predictions">
                <div className="empty-predictions-icon">📝</div>
                <p>لا توجد توقعات حتى الآن.</p>
              </div>
            ) : (
              <div className="predictions-list">
                {session.predictions.map((prediction) => (
                  <PredictionItem 
                    key={prediction._id || Math.random().toString()} 
                    prediction={prediction}
                    isCurrentUser={prediction.user._id === user._id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* إظهار رسالة للمستخدم عند إرسال التوقع في حالة عدم وجود توقعات أخرى */}
        {userHasPredicted && session.predictions.length <= 1 && (
          <div className="alert-info mt-4">
            توقعات المشاركين الآخرين ستظهر هنا بمجرد إرسالها
          </div>
        )}
      </div>
      
      <div className="session-footer">
        <Link to="/dashboard" className="btn btn-secondary back-to-dashboard">
          العودة إلى لوحة التحكم
        </Link>
      </div>
    </div>
  );
};

export default SessionPage;