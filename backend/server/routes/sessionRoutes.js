const express = require('express');
const router = express.Router();
const { 
  createSession, 
  joinSession, 
  submitPrediction, 
  getSession, 
  getUserSessions 
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

// حماية جميع المسارات
router.use(protect);

// مسارات جلسات التوقع
router.post('/create', createSession);
router.post('/join', joinSession);
router.post('/predict', submitPrediction);
router.get('/mysessions', getUserSessions);
router.get('/:id', getSession);

module.exports = router;