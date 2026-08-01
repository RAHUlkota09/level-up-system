const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserStats,
  updateProfile,
  logWeight,
  getWeightHistory,
  getXPHistory
} = require('../controllers/statsController');

router.get('/', auth, getUserStats);
router.put('/profile', auth, updateProfile);
router.post('/weight', auth, logWeight);
router.get('/weight/history', auth, getWeightHistory);

module.exports = router;
