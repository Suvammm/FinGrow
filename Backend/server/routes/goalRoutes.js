const express = require('express');
const router = express.Router();
const { getGoals, setGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

// 'protect' MUST be the second argument to inject the user into the request
router.get('/', protect, getGoals);
router.post('/', protect, setGoal);

module.exports = router;