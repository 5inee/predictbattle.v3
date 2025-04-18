// backend/server/routes/healthRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

module.exports = router;