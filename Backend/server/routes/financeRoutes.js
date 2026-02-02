const express = require('express');
const router = express.Router();
const { updateFinanceData, getFinanceData } = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

// Matches: POST /api/finance/update
router.post('/update', protect, updateFinanceData);

// Matches: GET /api/finance
// Backend Route (Express)
router.get('/', protect, async (req, res) => {
    const finance = await Finance.findOne({ user: req.user.id });
    res.json(finance);
  });
module.exports = router;