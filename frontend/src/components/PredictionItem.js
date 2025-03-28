import React from 'react';
import './PredictionItem.css';

const PredictionItem = ({ prediction, isCurrentUser }) => {
  // التأكد من وجود بيانات المستخدم
  if (!prediction || !prediction.user) {
    console.error('خطأ: بيانات التوقع أو المستخدم غير متوفرة', prediction);
    return null;
  }

  // تنسيق التاريخ والوقت
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  };

  // توليد حرف أولي للمستخدم
  const getInitial = (username) => {
    return username.charAt(0).toUpperCase();
  };

  // توليد لون للصورة الرمزية
  const getAvatarColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.floor((Math.abs(hash) * 137.508) % 360);
    const saturation = 75;
    const lightness = 60;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // توليد معرف مختصر
  const getShortId = (id) => {
    if (!id) return '';
    return id.substring(0, 6);
  };

  return (
    <div className={`prediction-item ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="prediction-header">
        <div className="user-info">
          <div 
            className="avatar" 
            style={{ backgroundColor: getAvatarColor(prediction.user.username) }}
          >
            {getInitial(prediction.user.username)}
          </div>
          <div className="user-details">
            <div className="username">
              {prediction.user.username}
              {isCurrentUser && <span className="user-badge">أنت</span>}
            </div>
            <div className="prediction-time">{formatDateTime(prediction.createdAt)}</div>
          </div>
        </div>
        
        <div className="prediction-meta">
          <div className="prediction-id">#{getShortId(prediction._id)}</div>
        </div>
      </div>
      
      <div className="prediction-content">
        <p>{prediction.text}</p>
      </div>
    </div>
  );
};

export default PredictionItem;