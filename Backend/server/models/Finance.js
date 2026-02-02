const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assets: {
    cash: { type: Number, default: 0 },
    fixedDeposits: { type: Number, default: 0 },
    mutualFunds: { type: Number, default: 0 },
    stocks: { type: Number, default: 0 },
    crypto: { type: Number, default: 0 },
    realEstate: { type: Number, default: 0 },
    gold: { type: Number, default: 0 }
  },
  liabilities: {
    homeLoan: { type: Number, default: 0 },
    educationLoan: { type: Number, default: 0 },
    personalLoan: { type: Number, default: 0 },
    creditCardDues: { type: Number, default: 0 }
  },
  income: {
    salary: { type: Number, default: 0 },
    business: { type: Number, default: 0 },
    rental: { type: Number, default: 0 }
  },
  expenses: {
    monthlyTotal: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Finance', FinanceSchema);