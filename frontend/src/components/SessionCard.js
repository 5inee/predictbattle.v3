import React from 'react';
import { Link } from 'react-router-dom';
import './SessionCard.css';

const SessionCard = ({ session }) => {
  // تنسيق التاريخ (بالميلادي)
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar', options);
  };

  // حساب نسبة المشاركين إلى الحد الأقصى
  const calculateProgressPercentage = () => {
    const participantsCount = session.participants?.length || 0;
    const maxPlayers = session.maxPlayers || 1; // تجنب القسمة على صفر
    return (participantsCount / maxPlayers) * 100;
  };

  // حساب حالة الجلسة بناءً على عدد التوقعات والمشاركين
  const isSessionComplete = () => {
    // إذا كانت التوقعات غير معرفة، قم بالمقارنة على افتراض أنها فارغة
    const predictionsLength = session.predictions?.length || 0;
    const participantsLength = session.participants?.length || 0;
    
    return predictionsLength === participantsLength && participantsLength > 0;
  };

  return (
    <div className="session-card">
      <div className="session-header">
        <h3 className="session-title">{session.title}</h3>
        <div className="session-status-container">
          <span className={`session-status ${isSessionComplete() ? 'complete' : 'active'}`}>
            {isSessionComplete() ? 'مكتملة' : 'نشطة'}
          </span>
        </div>
      </div>
      
      <div className="session-details">
        <div className="session-info code">
          <span className="info-label">كود الجلسة:</span> 
          <span className="session-code">{session.code}</span>
        </div>
        <div className="session-info date">
          <span className="info-label">تاريخ الإنشاء:</span> 
          <span>{formatDate(session.createdAt)}</span>
        </div>
        <div className="session-info participants">
          <span className="info-label">المشاركون:</span> 
          <div className="participants-count">
            <span>{session.participants?.length || 0}</span>
            <div className="participants-progress">
              <div 
                className="participants-progress-bar" 
                style={{ width: `${calculateProgressPercentage()}%` }}
              ></div>
            </div>
            <span>{session.maxPlayers}</span>
          </div>
        </div>
      </div>
      
      <div className="session-footer">
        <Link to={`/session/${session._id}`} className="btn btn-primary detail-btn">
          عرض التفاصيل
        </Link>
      </div>
    </div>
  );
};

export default SessionCard;