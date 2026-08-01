const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserStats, updateProfile } = require('../controllers/statsController');

router.get('/stats', auth, getUserStats);
router.put('/profile', auth, updateProfile);

module.exports = router;
