const Finance = require('../models/Finance');

// --- GET DATA ---
const getFinanceData = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const finance = await Finance.findOne({ user: userId }).lean();

    if (!finance) {
      return res.json({ summary: { totalAssets: 0, totalLiabilities: 0, netWorth: 0 } });
    }

    // Helper to sum up values in a sub-object (like assets or liabilities)
    const sum = (obj) => Object.values(obj || {}).reduce((a, b) => a + (Number(b) || 0), 0);

    const totalAssets = sum(finance.assets);
    const totalLiabilities = sum(finance.liabilities);

    res.json({
      summary: {
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error" });
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
// Add this to your financeController.js
const getAiInsights = async (req, res) => {
  try {
    const { assets, liabilities } = req.body;

    // 1. Calculate totals for analysis
    const totalAssets = Object.values(assets || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const totalLiabilities = Object.values(liabilities || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    let suggestion = "";

    // 2. AI Logic Rules
    if (liabilities.creditCardDues > 1000) {
      suggestion = "⚠️ Immediate Action: Your credit card debt is high. With interest rates often above 30%, paying this off is a better 'investment' than stocks right now.";
    } else if (assets.crypto > (totalAssets * 0.25)) {
      suggestion = "🚀 Portfolio Risk: Over 25% of your wealth is in Crypto. While growth is high, consider moving some gains into 'Real Estate' or 'Gold' for stability.";
    } else if (assets.cash > (totalAssets * 0.4) && totalAssets > 10000) {
      suggestion = "💰 Cash Drag: You are holding a lot of liquid cash. Inflation is eating your purchasing power. Have you considered 'Mutual Funds' or 'Fixed Deposits'?";
    } else if (netWorth > 0 && totalLiabilities === 0) {
      suggestion = "🌟 Rare Achievement: You are debt-free with a positive net worth! You are in a perfect position to explore aggressive 'Stock' or 'Real Estate' investments.";
    } else {
      suggestion = "📈 Wealth Building: Focus on increasing your 'Mutual Funds' SIPs. Your current asset-to-liability ratio is healthy. Keep it up!";
    }

    res.json({ suggestion });
  } catch (error) {
    console.error("AI Logic Error:", error);
    res.status(500).json({ message: "AI Analysis failed" });
  }
};
// --- EXPORT BOTH ---
module.exports = {
  getFinanceData,
  updateFinanceData,
  getAiInsights
};