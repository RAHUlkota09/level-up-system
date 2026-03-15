const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTodaysMissions,
  completeMission,
  updateProgress,
  getMissionHistory,
  runDailyAnalysis
} = require('../controllers/missionController');

router.get('/today', auth, getTodaysMissions);
router.put('/:missionId/complete', auth, completeMission);
router.put('/:missionId/progress', auth, updateProgress);
router.get('/history', auth, getMissionHistory);
router.post('/analyze', auth, runDailyAnalysis);

module.exports = router;
