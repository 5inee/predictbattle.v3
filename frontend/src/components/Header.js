import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={closeMobileMenu}>
            {/* <span className="logo-icon">⚡</span> */}
            {/* <span className="logo-text">PredictBattle</span> */}
          </Link>
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {showMobileMenu ? '✕' : '☰'}
        </button>
        
        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {user ? (
            <>
              <span className="username">{user.username}</span>
              <Link to="/dashboard" className="nav-link">
                الداشبورد
              </Link>
              <button onClick={handleLogout} className="btn btn-text">
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="nav-link">
                إنشاء حساب
              </Link>
              <Link to="/guest" className="nav-link">
                دخول كجيست
              </Link>
            </>
          )}
        </nav>
        
        {/* Mobile Navigation */}
        <div className={`overlay ${showMobileMenu ? 'open' : ''}`} onClick={closeMobileMenu}></div>
        <nav className={`nav-mobile ${showMobileMenu ? 'open' : ''}`}>
          <button className="mobile-menu-close" onClick={closeMobileMenu}>✕</button>
          {user ? (
            <>
              <span className="username">{user.username}</span>
              <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                الداشبورد
              </Link>
              <button onClick={handleLogout} className="btn btn-text">
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
                تسجيل الدخول
              </Link>
              <Link to="/register" className="nav-link" onClick={closeMobileMenu}>
                إنشاء حساب
              </Link>
              <Link to="/guest" className="nav-link" onClick={closeMobileMenu}>
                دخول كجيست
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;