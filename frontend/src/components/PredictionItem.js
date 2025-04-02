import React from 'react';
import './PredictionItem.css';

const PredictionItem = ({ prediction, isCurrentUser, index }) => {
  if (!prediction || !prediction.user) {
    console.error('خطأ: بيانات التوقع أو المستخدم غير متوفرة', prediction);
    return null;
  }

  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ar', options);
  };

  const getInitial = (username) => {
    return username.charAt(0).toUpperCase();
  };

  const getAvatarColor = () => {
    let hash = 0;
    for (let i = 0; i < prediction.user._id.length; i++) {
      hash = prediction.user._id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = (Math.abs(hash) * 137 + 50) % 360; // زيادة التباعد بتغيير الثابت
    const saturation = 60 + (Math.abs(hash) % 20); // جعل التشبع متغيرًا بين 60-80
    const lightness = 40 + (Math.abs(hash) % 20); // جعل الإضاءة متغيرة بين 40-60
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

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
            style={{ backgroundColor: getAvatarColor() }}
          >
            {getInitial(prediction.user.username)}
          </div>
          <div className="user-details">
            <div className="username-container">
              <span className="username-text">{prediction.user.username}</span>
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
