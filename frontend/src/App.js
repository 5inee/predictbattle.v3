import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// استيراد الصفحات
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GuestLoginPage from './pages/GuestLoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateSessionPage from './pages/CreateSessionPage';
import SessionPage from './pages/SessionPage';

// استيراد المكونات
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

// استيراد الأنماط
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/guest" element={<GuestLoginPage />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              <Route path="/create-session" element={
                <PrivateRoute>
                  <CreateSessionPage />
                </PrivateRoute>
              } />
              <Route path="/session/:id" element={
                <PrivateRoute>
                  <SessionPage />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;