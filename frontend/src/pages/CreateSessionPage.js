import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import config from '../config';
import './CreateSessionPage.css';

const CreateSessionPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    maxPlayers: 5,
    secretCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const { title, maxPlayers, secretCode } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };
  
  const increaseMaxPlayers = () => {
    if (maxPlayers < 20) {
      setFormData({ ...formData, maxPlayers: maxPlayers + 1 });
    }
  };
  
  const decreaseMaxPlayers = () => {
    if (maxPlayers > 2) {
      setFormData({ ...formData, maxPlayers: maxPlayers - 1 });
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من إدخال العنوان
    if (!title.trim()) {
      setErrorMessage('لازم تكتب السؤال');
      return;
    }
    
    // التحقق من الرمز السري
    if (secretCode !== '021') {
      setErrorMessage('الباسوورد غلط');
      return;
    }
    
    try {
      setLoading(true);
      
      // تكوين الهيدر
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      // إرسال طلب إنشاء الجلسة
      const response = await axios.post(`${config.API_URL}/sessions/create`, formData, headers);
      
      setLoading(false);
      
      // التوجيه إلى صفحة الجلسة
      navigate(`/session/${response.data.session._id}`);
    } catch (error) {
      console.error('خطأ في إنشاء الجلسة:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'حصلت مشكلة أثناء إنشاء القيم، حاول مرة ثانية'
      );
      setLoading(false);
    }
  };
  
  return (
    <div className="create-session-page">
      <div className="page-header">
        <h1 className="page-title">إنشاء قيم جديد</h1>
      </div>
      
      <div className="form-card">
        {errorMessage && (
          <div className="alert alert-error">{errorMessage}</div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-section">
            <h3 className="section-label">سؤال القيم</h3>
            <textarea
              id="title"
              name="title"
              className="form-control"
              value={title}
              onChange={onChange}
              placeholder="اكتب سؤال القيم هنا..."
              rows={4}
            ></textarea>
          </div>
          
          <div className="form-section">
            <h3 className="section-label">عدد المشاركين</h3>
            <div className="input-counter">
              <button 
                type="button" 
                className="counter-btn" 
                onClick={decreaseMaxPlayers}
                disabled={maxPlayers <= 2}
              >
                -
              </button>
              <div className="counter-value">{maxPlayers}</div>
              <button 
                type="button" 
                className="counter-btn" 
                onClick={increaseMaxPlayers}
                disabled={maxPlayers >= 20}
              >
                +
              </button>
            </div>
            <small className="form-text">
              حدد العدد الأقصى للمشاركين في القيم (من 2 إلى 20)
            </small>
          </div>
          
          <div className="form-section">
            <h3 className="section-label">الباسوورد</h3>
            <input
              type="password"
              id="secretCode"
              name="secretCode"
              className="form-control code-input"
              value={secretCode}
              onChange={onChange}
              placeholder="اكتب الباسوورد الخاص بإنشاء الأقيام"
            />
            <small className="form-text">
              الباسوورد مطلوبة لمنع الأقيام العشوائية
            </small>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary submit-btn"
              disabled={loading}
            >
              {loading ? 'جارِ الإنشاء...' : 'ابدأ القيم'}
            </button>
            
            <Link to="/dashboard" className="btn btn-text back-btn">
              ارجع للداشبورد
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionPage;