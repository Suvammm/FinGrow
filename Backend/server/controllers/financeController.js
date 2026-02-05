const Finance = require('../models/Finance');

// --- GET DATA ---
const getFinanceData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const finance = await Finance.findOne({ user: userId });

    if (!finance) {
      return res.status(200).json({
        assets: [],
        liabilities: [],
        summary: { totalAssets: 0, totalLiabilities: 0, netWorth: 0 }
      });
    }

    const calculateTotal = (data) => {
      if (!data) return 0;
      
      // Convert Mongoose document to a plain object so Object.values works correctly
      const plainData = typeof data.toObject === 'function' ? data.toObject() : data;
      
      // Remove the _id if it's inside the nested object to avoid adding it to the sum
      if (plainData._id) delete plainData._id;

      return Object.values(plainData).reduce((acc, val) => {
        // Ensure we only add numbers
        const num = Number(val);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
    };

    const totalAssets = calculateTotal(finance.assets);
    const totalLiabilities = calculateTotal(finance.liabilities);

    res.json({
      assets: finance.assets || [],
      liabilities: finance.liabilities || [],
      summary: {
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities
      }
    });
  } catch (error) {
    console.error("CRITICAL ERROR:", error.message);
    res.status(500).json({ message: "Backend crashed", error: error.message });
  }
};

// --- UPDATE DATA ---
const updateFinanceData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const updatedFinance = await Finance.findOneAndUpdate(
      { user: userId },
      { ...req.body },
      { new: true, upsert: true }
    );
    res.json(updatedFinance);
  } catch (error) {
    console.error("UPDATE ERROR:", error.message);
    res.status(400).json({ message: "Invalid financial data provided" });
  }
};

// --- EXPORT BOTH ---
module.exports = {
  getFinanceData,
  updateFinanceData
};