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

const sumValues = (obj) => Object.values(obj || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

const toPercent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const buildRuleBasedPlan = ({ assets = {}, liabilities = {} }) => {
  const totalAssets = sumValues(assets);
  const totalLiabilities = sumValues(liabilities);
  const netWorth = totalAssets - totalLiabilities;

  const creditCardDues = Number(liabilities.creditCardDues) || 0;
  const homeLoan = Number(liabilities.homeLoan) || 0;
  const educationLoan = Number(liabilities.educationLoan) || 0;
  const personalLoan = Number(liabilities.personalLoan) || 0;
  const totalDebt = creditCardDues + homeLoan + educationLoan + personalLoan;

  const cash = Number(assets.cash) || 0;
  const stocks = Number(assets.stocks) || 0;
  const mutualFunds = Number(assets.mutualFunds) || 0;
  const crypto = Number(assets.crypto) || 0;

  const risks = [];
  const wrongInvestments = [];
  const actionPlan = [];

  if (creditCardDues > 0) {
    risks.push('High-interest credit card dues are reducing wealth growth.');
    wrongInvestments.push('Investing aggressively while carrying expensive credit card debt.');
    actionPlan.push({
      step: 'Repay credit card dues first',
      timeline: '0-30 days',
      impact: 'Locks in a guaranteed return by avoiding high interest charges.',
    });
  }

  if (toPercent(cash, totalAssets) > 35 && totalAssets > 0) {
    risks.push('Cash allocation is high and may lose value against inflation.');
    wrongInvestments.push('Keeping too much idle cash instead of productive assets.');
    actionPlan.push({
      step: 'Move part of idle cash into diversified mutual funds through monthly SIP',
      timeline: 'Next 1-2 months',
      impact: 'Improves long-term compounding potential.',
    });
  }

  if (toPercent(crypto, totalAssets) > 20) {
    risks.push('Crypto concentration is high compared to a balanced portfolio.');
    wrongInvestments.push('Over-concentration in high-volatility assets.');
    actionPlan.push({
      step: 'Cap crypto to a safer share and rebalance into index funds / debt instruments',
      timeline: 'Next 2-3 months',
      impact: 'Reduces drawdown risk and stabilizes growth.',
    });
  }

  if (totalDebt > 0 && netWorth <= 0) {
    risks.push('Debt burden is high relative to current assets.');
    actionPlan.push({
      step: 'Create a debt snowball: clear smallest loans first while maintaining minimum payments on others',
      timeline: 'Next 3-6 months',
      impact: 'Builds momentum and improves cash flow faster.',
    });
  }

  if (actionPlan.length === 0) {
    actionPlan.push(
      {
        step: 'Increase monthly investment amount by 10-15%',
        timeline: 'From next month',
        impact: 'Accelerates portfolio growth through higher contribution.',
      },
      {
        step: 'Keep 6 months emergency fund, invest remainder in diversified equity/debt mix',
        timeline: '1-6 months',
        impact: 'Balances safety and long-term returns.',
      },
      {
        step: 'Rebalance every quarter',
        timeline: 'Quarterly',
        impact: 'Keeps risk profile aligned with your goals.',
      },
    );
  }

  return {
    summary: `Net worth is ${netWorth >= 0 ? 'positive' : 'negative'} with total assets ${totalAssets.toLocaleString('en-IN')} and liabilities ${totalLiabilities.toLocaleString('en-IN')}.`,
    risks: risks.length ? risks : ['No major concentration risk detected from current inputs.'],
    wrongInvestments: wrongInvestments.length
      ? wrongInvestments
      : ['No clear critical investment mistake detected from current allocation.'],
    actionPlan,
    targetAllocation: {
      emergencyCash: '10-15%',
      mutualFundsAndStocks: '50-70%',
      lowRiskDebtOrFD: '15-25%',
      alternativesLikeGoldCrypto: '5-10%',
    },
    note: 'Educational guidance only, not personalized financial advice.',
  };
};

const extractJson = (rawText) => {
  if (!rawText) return null;
  try {
    return JSON.parse(rawText);
  } catch {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(rawText.slice(start, end + 1));
    } catch {
      return null;
    }
  }
};

const getOpenAiPlan = async ({ assets, liabilities, totals }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
You are a personal finance coach. Analyze this user's finance data and provide practical growth steps.
Return strict JSON only with keys:
summary (string),
risks (string[]),
wrongInvestments (string[]),
actionPlan (array of objects with step, timeline, impact),
targetAllocation (object with emergencyCash, mutualFundsAndStocks, lowRiskDebtOrFD, alternativesLikeGoldCrypto),
note (string).

Data:
assets: ${JSON.stringify(assets)}
liabilities: ${JSON.stringify(liabilities)}
totals: ${JSON.stringify(totals)}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output valid JSON only. No markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return extractJson(content);
};

const getAiInsights = async (req, res) => {
  try {
    const assets = req.body?.assets || {};
    const liabilities = req.body?.liabilities || {};
    const totalAssets = sumValues(assets);
    const totalLiabilities = sumValues(liabilities);
    const netWorth = totalAssets - totalLiabilities;

    const totals = { totalAssets, totalLiabilities, netWorth };
    let plan = null;
    let source = 'rules';

    try {
      plan = await getOpenAiPlan({ assets, liabilities, totals });
      if (plan) {
        source = 'openai';
      }
    } catch (openAiError) {
      console.error('OpenAI Analysis Error:', openAiError.message);
    }

    if (!plan) {
      plan = buildRuleBasedPlan({ assets, liabilities });
    }

    res.json({
      source,
      totals,
      ...plan,
    });
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
