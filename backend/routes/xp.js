// xp.js routes
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getXPHistory } = require('../controllers/statsController');

router.get('/history', auth, getXPHistory);

module.exports = router;
