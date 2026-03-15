const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  searchFoods,
  logFood,
  getTodaysLogs,
  deleteFoodLog,
  getNutritionHistory
} = require('../controllers/nutritionController');

router.get('/foods/search', auth, searchFoods);
router.post('/log', auth, logFood);
router.get('/today', auth, getTodaysLogs);
router.delete('/log/:logId', auth, deleteFoodLog);
router.get('/history', auth, getNutritionHistory);

module.exports = router;
