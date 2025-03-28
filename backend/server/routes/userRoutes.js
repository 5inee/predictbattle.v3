const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  guestLogin, 
  getUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// مسارات المستخدمين
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/guest', guestLogin);
router.get('/profile', protect, getUserProfile);

module.exports = router;